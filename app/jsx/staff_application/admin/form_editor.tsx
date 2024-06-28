import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { DateTime } from "luxon";

import { CompetitionData } from "../types/competition_data";
import { QuestionEditor } from "./question_editor";
import { Form } from "../types/form";
import { Question, QuestionType } from "../question/types";
import { FilterModal } from "../filter/modal";
import { createFilter } from "../filter/create_filter";
import { Filter } from "../filter/filter";
import { FilterParams } from "../filter/types/params";

interface FormEditorProps {
  form: Form;
  deleteForm: Function;
}

export function FormEditor(props: FormEditorProps) {
  const { wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;

  const [name, setName] = useState(props.form.name || "");
  const [numQuestions, setNumQuestions] = useState(props.form.questions.length);
  const form = props.form;
  const [deadline, setDeadline] = useState(
    DateTime.fromSeconds(form.deadlineSeconds || 0).toFormat(
      "yyyy-MM-dd'T'HH:mm",
    ),
  );
  const [filters, setFilters] = useState(
    (form.filters || []).map((params) => createFilter(params, settings, wcif)),
  );
  const deleteForm = props.deleteForm;

  const updateName = function (name: string) {
    form.name = name;
    setName(name);
  };

  const updateDeadline = function (value: string) {
    form.deadlineSeconds = DateTime.fromISO(value).toSeconds();
    setDeadline(value);
  };

  const newQuestion = function () {
    event.preventDefault();
    form.questions.push({
      id: form.nextQuestionId,
      name: "New Question",
      required: false,
      questionType: QuestionType.Null,
    });
    form.nextQuestionId++;
    setNumQuestions(form.questions.length);
  };

  const deleteQuestion = function (question: Question) {
    form.questions = form.questions.filter((q) => q.id !== question.id);
    setNumQuestions(form.questions.length);
  };

  const addFilter = function (params: FilterParams) {
    if (form.filters === undefined) {
      form.filters = [];
    }
    form.filters.push(params);
    setFilters([...filters, createFilter(params, settings, wcif)]);
  };

  const deleteFilter = function (filterId: string) {
    const newFilters = filters.filter((f) => f.id() !== filterId);
    setFilters(newFilters);
    form.filters = newFilters.map((f) => f.getParams());
  };

  return (
    <div className="card">
      <div className="card-body">
        <div className="mb-3">
          <label htmlFor={"description-" + form.id} className="form-label">
            Name
          </label>
          <input
            className="form-control"
            type="text"
            value={name}
            onChange={(e) => updateName(e.target.value)}
            placeholder="Name of form"
          ></input>
        </div>
        <div className="row">
          <div className="form-check form-switch col-6">
            <input
              className="form-check-input"
              type="checkbox"
              role="switch"
              id={"visible-" + form.id}
              defaultChecked={form.isOpen}
              onChange={(e) => (form.isOpen = e.target.checked)}
            />
            <label className="form-check-label" htmlFor={"visible-" + form.id}>
              Make this form visible
            </label>
          </div>
          <div className="col-2">
            <label htmlFor={"deadline-" + form.id} className="form-label">
              Deadline
            </label>
          </div>
          <div className="col-4">
            <input
              className="form-control"
              type="datetime-local"
              value={deadline}
              onChange={(e) => updateDeadline(e.target.value)}
              placeholder="Name of form"
            ></input>
          </div>
        </div>
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-success"
            data-bs-toggle="modal"
            data-bs-target="#filter-modal"
          >
            <span className="material-symbols-outlined">add</span> Add Filter
          </button>
          <FilterModal id="filter-modal" addFilter={addFilter} />
          {filters.map((filter) => (
            <span key={filter.id()}>
              <span className="badge text-bg-primary">
                {filter.description()}
              </span>
              <span
                className="material-symbols-outlined"
                onClick={(e) => deleteFilter(filter.id())}
                style={{ cursor: "pointer" }}
              >
                delete
              </span>
            </span>
          ))}
        </div>
        <div className="mb-3">
          <label htmlFor={"description-" + form.id} className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id={"description-" + form.id}
            defaultValue={form.description}
            onChange={(e) => (form.description = e.target.value)}
            placeholder="Text to show at the top of the form"
          ></textarea>
        </div>
        <div>Questions</div>
        <ul className="list-group">
          {form.questions.map((question) => (
            <li className="list-group-item" key={question.id + 1}>
              <QuestionEditor
                question={question}
                deleteQuestion={deleteQuestion}
              />
            </li>
          ))}
          <li className="list-group-item" key="new">
            <button className="btn btn-success mb-3" onClick={newQuestion}>
              <span className="material-symbols-outlined">add</span> Add
              Question
            </button>
          </li>
        </ul>
        <button
          type="button"
          className="btn btn-danger"
          onClick={(e) => deleteForm(form)}
        >
          <span className="material-symbols-outlined">delete</span> Delete Form
        </button>
      </div>
    </div>
  );
}
