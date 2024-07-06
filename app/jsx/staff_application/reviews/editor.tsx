import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import Select from "react-select";
import { DateTime } from "luxon";

import { CompetitionData } from "../types/competition_data";
import { QuestionEditor } from "../admin/question_editor";
import { DefaultAssignment, ReviewForm, ReviewsData } from "./types";
import { Question, QuestionType } from "../question/types";
import { FilterModal } from "../filter/modal";
import { createFilter } from "../filter/create_filter";
import { Filter } from "../filter/filter";
import { FilterParams } from "../filter/types/params";

interface DefaultAssignmentEditorProps {
  id: string;
  defaultAssignment: DefaultAssignment;
  eligibleReviewerFilters: Filter[];
  onDelete: () => void;
}
function DefaultAssignmentEditor({
  id,
  eligibleReviewerFilters,
  defaultAssignment,
  onDelete,
}: DefaultAssignmentEditorProps) {
  const { wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const { applicants } = useRouteLoaderData("reviews") as ReviewsData;
  const [filters, setFilters] = useState(
    (defaultAssignment.filters || []).map((params) =>
      createFilter(params, settings, wcif),
    ),
  );
  const eligibleReviewers = applicants.filter((applicant) => {
    for (const filter of eligibleReviewerFilters) {
      if (!filter.apply(applicant)) {
        return false;
      }
    }
    return true;
  });
  const [reviewers, setReviewers] = useState(defaultAssignment.personIds || []);

  const addFilter = function (params: FilterParams) {
    if (defaultAssignment.filters === undefined) {
      defaultAssignment.filters = [];
    }
    defaultAssignment.filters.push(params);
    setFilters([...filters, createFilter(params, settings, wcif)]);
  };

  const deleteFilter = function (filterId: string) {
    const newFilters = filters.filter((f) => f.id() !== filterId);
    setFilters(newFilters);
    defaultAssignment.filters = newFilters.map((f) => f.getParams());
  };

  const reviewerValues = eligibleReviewers.map((reviewer) => {
    return {
      value: reviewer.user.id,
      label: reviewer.user.name,
    };
  });

  const onSelectReviewerChange = function (selected: typeof reviewerValues) {
    defaultAssignment.personIds = selected.map((reviewer) => reviewer.value);
    setReviewers(defaultAssignment.personIds);
  };

  return (
    <div className="row">
      <div className="col-6">
        <button
          type="button"
          className="btn btn-success"
          data-bs-toggle="modal"
          data-bs-target={`#filter-modal-${id}`}
        >
          <span className="material-symbols-outlined">add</span> Add Filter
        </button>
        <FilterModal id={`filter-modal-${id}`} addFilter={addFilter} />
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
      <div className="col-4">
        <Select
          options={reviewerValues}
          value={reviewerValues.filter((val) => reviewers.includes(val.value))}
          onChange={onSelectReviewerChange}
          isMulti={true}
        />
      </div>
      <div className="col-2">
        <div className="float-end">
          <button
            className="btn btn-danger"
            data-bs-toggle="modal"
            data-bs-target={`#delete-modal-${id}`}
          >
            <span className="material-symbols-outlined">delete</span> Delete
          </button>
        </div>
      </div>
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">
                Delete this default assignment?
              </h1>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={(e) => onDelete()}
                data-bs-dismiss="modal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ReviewFormEditorProps {
  form: ReviewForm;
  deleteForm: (form: ReviewForm) => void;
}

export function ReviewFormEditor(props: ReviewFormEditorProps) {
  const { wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;

  const [name, setName] = useState(props.form.name || "");
  const [numQuestions, setNumQuestions] = useState(
    props.form.questions?.length || 0,
  );
  const form = props.form;
  const [filters, setFilters] = useState(
    (form.eligibleReviewerFilters || []).map((params) =>
      createFilter(params, settings, wcif),
    ),
  );
  const deleteForm = props.deleteForm;
  const [defaults, setDefaults] = useState(props.form.defaults);

  const updateName = function (name: string) {
    form.name = name;
    setName(name);
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
    if (form.eligibleReviewerFilters === undefined) {
      form.eligibleReviewerFilters = [];
    }
    form.eligibleReviewerFilters.push(params);
    setFilters([...filters, createFilter(params, settings, wcif)]);
  };

  const deleteFilter = function (filterId: string) {
    const newFilters = filters.filter((f) => f.id() !== filterId);
    setFilters(newFilters);
    form.eligibleReviewerFilters = newFilters.map((f) => f.getParams());
  };

  const addDefaultAssignment = function () {
    const newDefaults = [
      ...(defaults || []),
      {
        filters: [],
        personIds: [],
      },
    ];
    setDefaults(newDefaults);
    form.defaults = newDefaults;
  };

  const deleteDefaultAssignment = function (idx: number) {
    const newDefaults = [...defaults];
    newDefaults.splice(idx, 1);
    setDefaults(newDefaults);
    form.defaults = newDefaults;
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
        <div className="mb-3">
          <button
            type="button"
            className="btn btn-success"
            data-bs-toggle="modal"
            data-bs-target="#filter-modal"
          >
            <span className="material-symbols-outlined">add</span> Add Reviewer
            Filter
          </button>
          <FilterModal id="filter-modal" addFilter={addFilter} />
          {(filters || []).map((filter) => (
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
          {(form.questions || []).map((question) => (
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
        <div>Default Reviewer Assignments</div>
        <ul className="list-group">
          {(defaults || []).map((defaultAssignment, idx) => (
            <li className="list-group-item" key={idx}>
              <DefaultAssignmentEditor
                defaultAssignment={defaultAssignment}
                id={`defaults-${idx}`}
                eligibleReviewerFilters={filters}
                onDelete={() => deleteDefaultAssignment(idx)}
              />
            </li>
          ))}
          <li className="list-group-item" key="new">
            <button
              className="btn btn-success mb-3"
              onClick={addDefaultAssignment}
            >
              <span className="material-symbols-outlined">add</span> Add Default
              Assignment
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
