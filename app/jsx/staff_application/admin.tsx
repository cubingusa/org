import { useState, useCallback } from "react";
import { useRouteLoaderData, Navigate, Link, Outlet } from "react-router-dom";
import { CompetitionData } from "./types/competition_data";
import { Form, Question, TextQuestion, TextQuestionType } from "./types/form";

interface QuestionEditorProps {
  question: Question;
  deleteQuestion: Function;
}

function QuestionEditor(props: QuestionEditorProps) {
  const question = props.question;
  const [questionType, setQuestionType] = useState(question.questionType || "");
  const types = {
    null: "Question Type",
    text: "Text",
    yes_no: "Yes / No",
  };

  const updateQuestionType = function (newType: string) {
    switch (newType) {
      case "null":
        Object.assign(question, { questionType: "null" });
        break;
      case "text":
        Object.assign(question, { questionType: "text" });
        break;
      case "yes_no":
        Object.assign(question, { questionType: "yes_no" });
        break;
    }
    setQuestionType(newType);
  };

  const selectTextQuestionType = function (textQuestionType: TextQuestionType) {
    console.log(textQuestionType);
    (question as TextQuestion).textQuestionType = textQuestionType;
  };

  const header = (
    <div className="row">
      <div className="col">
        <input
          type="text"
          className="form-control"
          placeholder="Question Text"
          defaultValue={question.name}
          onChange={(e) => (question.name = e.target.value)}
        />
      </div>
      <div className="col">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={"required-" + question.id}
            defaultChecked={question.required}
            onChange={(e) => (question.required = e.target.checked)}
          />
          <label
            className="form-check-label"
            htmlFor={"required-" + question.id}
          >
            Required
          </label>
        </div>
      </div>
      <div className="col">
        <select
          className="form-select"
          value={questionType}
          onChange={(e) => updateQuestionType(e.target.value)}
        >
          {Object.entries(types).map(([typeId, description]) => {
            return (
              <option value={typeId} key={typeId}>
                {description}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
  let questionDetails;
  switch (question.questionType) {
    case "text":
      questionDetails = (
        <div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name={"question-" + question.id + "-length"}
              id={"question-" + question.id + "-short"}
              defaultChecked={
                question.textQuestionType == TextQuestionType.Short
              }
              onChange={(e) => selectTextQuestionType(TextQuestionType.Short)}
            />
            <label
              className="form-check-label"
              htmlFor={"question-" + question.id + "-short"}
            >
              Short Answer
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name={"question-" + question.id + "-length"}
              id={"question-" + question.id + "-long"}
              defaultChecked={
                question.textQuestionType == TextQuestionType.Long
              }
              onChange={(e) => selectTextQuestionType(TextQuestionType.Long)}
            />
            <label
              className="form-check-label"
              htmlFor={"question-" + question.id + "-long"}
            >
              Long Answer
            </label>
          </div>
        </div>
      );
      break;
  }
  return (
    <>
      {header}
      {questionDetails}
    </>
  );
}

interface FormEditorProps {
  form: Form;
  deleteForm: Function;
}

function FormEditor(props: FormEditorProps) {
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

export function Admin() {
  const [spinning, setSpinning] = useState(false);
  const { wcif, user, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const [formCount, setFormCount] = useState((settings.forms || []).length);

  const submit = async function () {
    event.preventDefault();
    setSpinning(true);
    await fetch(`/staff_api/${wcif.id}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSpinning(false);
  };

  const newForm = function () {
    event.preventDefault();
    settings.forms.push({
      id: settings.nextFormId,
      name: "New Form",
      description: "",
      isOpen: false,
      deadline: null,
      nextQuestionId: 0,
      questions: [],
    });
    setFormCount(settings.forms.length);
    settings.nextFormId += 1;
  };

  const deleteForm = function (form: Form) {
    settings.forms = settings.forms.filter((f) => f.id !== form.id);
    setFormCount(settings.forms.length);
  };

  let spinner;
  if (spinning) {
    spinner = <div>submitting...</div>;
  }
  return (
    <div>
      <h1>{wcif.name} Staff Admin</h1>
      <div>
        You're viewing the admin settings. Return to the{" "}
        <Link to="..">public application</Link>.
      </div>
      <hr />
      <form>
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="visible"
            defaultChecked={settings.isVisible}
            onChange={(e) => (settings.isVisible = e.target.checked)}
          />
          <label className="form-check-label" htmlFor="visible">
            Make staff application visible
          </label>
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            className="form-control"
            id="description"
            defaultValue={settings.description}
            onChange={(e) => (settings.description = e.target.value)}
            placeholder="Text to show at the top of the application page"
          ></textarea>
        </div>
        <h3>Forms</h3>
        <div>
          You can create forms for staff to fill out, either to apply to join
          staff or to collect information from them after they've already been
          accepted.
        </div>
        <div className="accordion" id="formAccordion">
          {(settings.forms || []).map((form) => (
            <div className="accordion-item" key={form.id}>
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  id={"header-" + form.id}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={"#collapsed-form-" + form.id}
                >
                  {form.name}
                </button>
              </h2>
              <div
                id={"collapsed-form-" + form.id}
                className="accordion-collapse collapse"
                data-bs-parent="#formAccordion"
              >
                <FormEditor form={form} deleteForm={deleteForm}></FormEditor>
              </div>
            </div>
          ))}
        </div>
        <div>
          <button className="btn btn-success mb-3" onClick={newForm}>
            <span className="material-symbols-outlined">add</span> New Form
          </button>
        </div>
        <button className="btn btn-primary mb-3" type="submit" onClick={submit}>
          Save
        </button>
        {spinner}
      </form>
    </div>
  );
}

export function AdminGuard() {
  const { user } = useRouteLoaderData("competition") as CompetitionData;
  if (user !== null && user.isAdmin) {
    return <Outlet />;
  } else {
    return <Navigate to=".." />;
  }
}
