import { useState } from "react";

import { QuestionEditor } from "./question_editor";
import { Form, Question } from "../types/form";

interface FormEditorProps {
  form: Form;
  deleteForm: Function;
}

export function FormEditor(props: FormEditorProps) {
  const [name, setName] = useState(props.form.name || "");
  const [numQuestions, setNumQuestions] = useState(props.form.questions.length);
  const form = props.form;
  const deleteForm = props.deleteForm;

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
      questionType: "null",
    });
    form.nextQuestionId++;
    setNumQuestions(form.questions.length);
  };

  const deleteQuestion = function (question: Question) {
    form.questions = form.questions.filter((q) => q.id !== question.id);
    setNumQuestions(form.questions.length);
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
        <div className="form-check form-switch">
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
