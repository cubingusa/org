import { useState } from "react";
import { DateTime } from "luxon";
import { useRouteLoaderData, useParams, Link } from "react-router-dom";
import { createFilter } from "./filter/create_filter";
import { CompetitionData } from "./types/competition_data";
import {
  SubmittedForm,
  SubmittedQuestion,
} from "./types/personal_application_data";
import { Form } from "./types/form";
import { getApi } from "./question/questions";
import { ViewList } from "./view/list";

interface FormDisplayProps {
  form: Form;
}

function FormDisplay(props: FormDisplayProps) {
  const form = props.form;
  const [spinning, setSpinning] = useState(false);
  const { wcif, forms } = useRouteLoaderData("competition") as CompetitionData;
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
          {form.questions.map((question, idx) => {
            let myQuestion = myForm.details.questions.find(
              (sq) => sq.questionId == question.id,
            );
            if (myQuestion === undefined) {
              myQuestion = {
                questionId: question.id,
                numberAnswer: 0,
                booleanAnswer: false,
                textAnswer: "",
              };
              myForm.details.questions.push(myQuestion);
            }
            const api = getApi(question.questionType, wcif);
            if (api) {
              return (
                <div key={question.id}>
                  {api.form({
                    question,
                    myQuestion,
                    onAnswerChange: (q: SubmittedQuestion) =>
                      (myForm.details.questions[idx] = q),
                  })}
                </div>
              );
            } else {
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
  const { wcif, user, settings, forms } = useRouteLoaderData(
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
  let formsSection = (
    <div className="accordion" id="formAccordion">
      {(settings.forms || [])
        .filter((form) => {
          if (!form.isOpen) {
            return false;
          }
          if (form.deadlineSeconds) {
            const closeTime = DateTime.fromSeconds(form.deadlineSeconds);
            if (closeTime < DateTime.now()) {
              return false;
            }
          }
          for (const filterParams of form.filters || []) {
            const filter = createFilter(filterParams, settings, wcif);
            if (!filter.apply({ user, forms })) {
              return false;
            }
          }
          return true;
        })
        .map((form) => (
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
                {form.deadlineSeconds ? (
                  <>
                    {" "}
                    (Closes{" "}
                    {DateTime.fromSeconds(form.deadlineSeconds).toLocaleString(
                      DateTime.DATETIME_MED,
                    )}{" "}
                    )
                  </>
                ) : null}
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
        ))}
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
      to {user.email}. If you would like to submit an application for another
      person, please <a href="/logout">log out</a> and log back in using their
      account.
    </div>
  );
  let props = (
    <>
      {user.properties.map(({ key, value }) => {
        const prop = settings.properties.find((p) => p.id == key);
        if (prop === undefined) {
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
      {formsSection}
      <p />
      <ViewList />
    </div>
  );
}
