import { useState } from "react";
import { useRouteLoaderData, useParams, Link } from "react-router-dom";
import { CompetitionData } from "./types/competition_data";
import {
  PersonalApplicationData,
  SubmittedForm,
  SubmittedQuestion,
} from "./types/personal_application_data";
import {
  Form,
  Question,
  QuestionType,
  TextQuestion,
  TextQuestionType,
  YesNoQuestion,
} from "./types/form";

interface QuestionDisplayProps {
  question: Question;
  myQuestion: SubmittedQuestion;
}

function TextQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as TextQuestion;

  const updateAnswer = function (newAnswer: string) {
    props.myQuestion.textAnswer = newAnswer;
  };

  switch (question.textQuestionType) {
    case TextQuestionType.Long:
      return (
        <div className="mb-3">
          <label htmlFor={"text-input-" + question.id} className="form-label">
            {question.name}
          </label>
          <textarea
            defaultValue={props.myQuestion.textAnswer}
            id={"text-input-" + question.id}
            className="form-control"
            onChange={(e) => updateAnswer(e.target.value)}
          />
        </div>
      );
    case TextQuestionType.Short:
      return (
        <div className="mb-3">
          <label htmlFor={"text-input-" + question.id} className="form-label">
            {question.name}
          </label>
          <input
            type="text"
            defaultValue={props.myQuestion.textAnswer}
            id={"text-input-" + question.id}
            className="form-control"
            onChange={(e) => updateAnswer(e.target.value)}
          />
        </div>
      );
  }
}

function YesNoQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as YesNoQuestion;

  const updateAnswer = function (newAnswer: boolean) {
    props.myQuestion.booleanAnswer = newAnswer;
  };

  return (
    <>
      <div className="mb-3">
        <label htmlFor={"yes-no-input-" + question.id} className="form-label">
          {question.name}
        </label>
      </div>
      <div className="mb-3">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            id={"yes-no-input-" + question.id + "-yes"}
            defaultChecked={props.myQuestion.booleanAnswer === true}
            onClick={(e) => updateAnswer(true)}
          />
          <label
            className="form-check-label"
            htmlFor={"yes-no-input-" + question.id + "-yes"}
          >
            Yes
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            id={"yes-no-input-" + question.id + "-no"}
            defaultChecked={props.myQuestion.booleanAnswer === false}
            onClick={(e) => updateAnswer(false)}
          />
          <label
            className="form-check-label"
            htmlFor={"yes-no-input-" + question.id + "-no"}
          >
            No
          </label>
        </div>
      </div>
    </>
  );
}

interface FormDisplayProps {
  form: Form;
}

function FormDisplay(props: FormDisplayProps) {
  const form = props.form;
  const [spinning, setSpinning] = useState(false);
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const { forms } = useRouteLoaderData(
    "application",
  ) as PersonalApplicationData;
  const myForm: SubmittedForm = forms.find((sf) => sf.formId == form.id) || {
    formId: form.id,
    submittedAtTs: 0,
    updatedAtTs: 0,
    details: {
      questions: [],
    },
  };

  const submit = async function () {
    event.preventDefault();
    setSpinning(true);
    await fetch(`/staff_api/${wcif.id}/form_submission/${form.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(myForm.details),
    });
    setSpinning(false);
  };

  let spinner;
  if (spinning) {
    spinner = <div>submitting...</div>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <form>
          <div>{form.description}</div>
          <hr />
          {form.questions.map((question) => {
            let myQuestion = myForm.details.questions.find(
              (sq) => sq.questionId == question.id,
            );
            if (myQuestion === undefined) {
              myQuestion = {
                questionId: question.id,
              };
              myForm.details.questions.push(myQuestion);
            }
            switch (question.questionType) {
              case QuestionType.Text:
                return (
                  <TextQuestionDisplay
                    question={question}
                    myQuestion={myQuestion}
                    key={question.id}
                  />
                );
              case QuestionType.YesNo:
                return (
                  <YesNoQuestionDisplay
                    question={question}
                    myQuestion={myQuestion}
                    key={question.id}
                  />
                );
              default:
                return null;
            }
          })}
          <div>
            <button
              className="btn btn-primary mb-3"
              type="submit"
              onClick={submit}
            >
              Submit
            </button>
            {spinner}
          </div>
        </form>
      </div>
    </div>
  );
}

export function Application() {
  const { wcif, user, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const { competitionId } = useParams();
  let adminText;
  if (user?.isAdmin) {
    adminText = (
      <div className="alert alert-primary">
        You are logged in as an admin.{" "}
        <Link to="admin" relative="path">
          Visit the admin page.
        </Link>
      </div>
    );
  }

  let failure;
  if (!settings.isVisible) {
    failure = (
      <div className="alert alert-primary">
        Check back here soon for more information!
      </div>
    );
  } else if (user === null) {
    failure = (
      <div className="alert alert-primary">
        In order to apply to join our volunteer staff, you need to{" "}
        <a href="/login">log in with your WCA account</a>.
      </div>
    );
  }
  if (failure) {
    return (
      <div>
        <h3>{wcif.name} Staff Application</h3>
        {failure}
        {adminText}
      </div>
    );
  }
  let forms = (
    <div className="accordion" id="formAccordion">
      {(settings.forms || []).map((form) => {
        if (form.isOpen) {
          return (
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
                <FormDisplay form={form}></FormDisplay>
              </div>
            </div>
          );
        }
        return null;
      })}
    </div>
  );
  let nameElt = !!user.wcaId ? (
    <a href={"https://wca.link/" + user.wcaId}>{user.name}</a>
  ) : (
    <>{user.name}</>
  );
  let loggedIn = (
    <div>
      You are logged in as {nameElt}. Updates to your application will be sent
      to {user.email}. If you would like to submit your application for another
      person, please <a href="/logout">log out</a> and log back in using their
      account.
    </div>
  );
  let props = (
    <>
      {user.properties.map(({ key, value }) => {
        const prop = settings.properties.find((p) => p.id == key);
        if (prop === null) {
          return null;
        }
        const val = prop.values.find((val) => val.id == value);
        if (val == undefined) {
          return null;
        }
        return (
          <div key={key}>
            <b>{prop.name}</b>:{" "}
            <span className="badge text-bg-primary">{val.value}</span>
          </div>
        );
      })}
    </>
  );

  return (
    <div>
      <h3>{wcif.name} Staff Application</h3>
      {adminText}
      <div>{settings.description}</div>
      <p />
      {loggedIn}
      <p />
      {props}
      <p />
      {forms}
    </div>
  );
}
