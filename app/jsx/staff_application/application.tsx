import { useState } from "react";
import { Toast } from "react-bootstrap";
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
import { ReviewForm, SubmittedReview } from "./reviews/types";

interface ApplicationCallbacks {
  onSuccess: () => void;
  onFailure: () => void;
}

interface FormDisplayProps {
  form: Form;
  callbacks: ApplicationCallbacks;
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
    try {
      await fetch(`/staff_api/${wcif.id}/form_submission/${form.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(myForm.details),
      });
      setSpinning(false);
      props.callbacks.onSuccess();
    } catch (e) {
      props.callbacks.onFailure();
    }
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

interface ReviewFormDisplayProps {
  form: ReviewForm;
  review: SubmittedReview;
  id: string;
  declineReview: () => void;
  callbacks: ApplicationCallbacks;
}

function ReviewFormDisplay(props: ReviewFormDisplayProps) {
  const form = props.form;
  const review = props.review;
  const [spinning, setSpinning] = useState(false);
  const { wcif, forms } = useRouteLoaderData("competition") as CompetitionData;

  const submit = async function () {
    event.preventDefault();
    setSpinning(true);
    try {
      await fetch(`/staff_api/${wcif.id}/review/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(review),
      });
      setSpinning(false);
      props.callbacks.onSuccess();
    } catch (e) {
      props.callbacks.onFailure();
    }
  };

  let spinner;
  if (spinning) {
    spinner = <div>submitting...</div>;
  }

  return (
    <div className="card">
      <div className="card-body">
        <form>
          <div className="row">
            <div className="col-10">
              Candidate: {review.user.name}{" "}
              {review.user.wcaId ? (
                <a href={`https://wca.link/${review.user.wcaId}`}>
                  {review.user.wcaId}
                </a>
              ) : null}
            </div>
            <div className="col-2">
              <div className="float-end">
                <button
                  type="button"
                  className="btn btn-danger"
                  data-bs-toggle="modal"
                  data-bs-target={`#decline-review-modal-${props.id}`}
                >
                  <span className="material-symbols-outlined">close</span>{" "}
                  Decline
                </button>
              </div>
              <div
                className="modal fade"
                id={`decline-review-modal-${props.id}`}
              >
                <div className="modal-dialog">
                  <div className="modal-content">
                    <div className="modal-header">
                      <h1 className="modal-title fs-5">Decline this review?</h1>
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
                        onClick={(e) => props.declineReview()}
                        data-bs-dismiss="modal"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            Reviewers:
            {review.reviewers.map((reviewer) => reviewer.name).join(", ")}
          </div>
          <div>{form.description}</div>
          <hr />
          {form.questions.map((question, idx) => {
            let myQuestion = (review.questions || []).find(
              (sq) => sq.questionId == question.id,
            );
            if (myQuestion === undefined) {
              if (review.questions == null) {
                review.questions = [];
              }
              myQuestion = {
                questionId: question.id,
                numberAnswer: 0,
                booleanAnswer: false,
                textAnswer: "",
              };
              review.questions.push(myQuestion);
            }
            const api = getApi(question.questionType, wcif);
            if (api) {
              return (
                <div key={question.id}>
                  {api.form({
                    question,
                    myQuestion,
                    onAnswerChange: (q: SubmittedQuestion) =>
                      (review.questions[idx] = q),
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
  const { wcif, user, settings, forms, myReviews } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const [reviews, setReviews] = useState(myReviews);
  const { competitionId } = useParams();
  const [successToast, setSuccessToast] = useState(false);
  const [failureToast, setFailureToast] = useState(false);

  const callbacks: ApplicationCallbacks = {
    onSuccess: () => {
      setSuccessToast(true);
      setFailureToast(false);
      setTimeout(() => setSuccessToast(false), 5000);
    },
    onFailure: () => {
      setFailureToast(true);
      setSuccessToast(false);
      setTimeout(() => setFailureToast(false), 10000);
    },
  };

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
            if (!filter.apply({ user, forms, reviews: [] })) {
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
              <FormDisplay form={form} callbacks={callbacks}></FormDisplay>
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
  let reviewsSection;

  if (reviews.length > 0) {
    const reviewsAndForms = reviews.map((review) => {
      return {
        review,
        form: settings.reviewForms.find(
          (form) => form.id == review.reviewFormId,
        ),
      };
    });

    const declineReview = async (review: SubmittedReview) => {
      try {
        await fetch(`/staff_api/${wcif.id}/review/decline`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: review.user.id,
            reviewFormId: review.reviewFormId,
          }),
        });
        callbacks.onSuccess();
        setReviews(
          reviews.filter(
            (r) =>
              r.reviewFormId !== review.reviewFormId ||
              r.user.id !== review.user.id,
          ),
        );
      } catch (e) {
        callbacks.onFailure();
      }
    };
    reviewsSection = (
      <>
        <h3>Staff Reviews</h3>
        <div className="accordion" id="reviews-accordion">
          {reviewsAndForms.map(({ review, form }) => (
            <div
              className="accordion-item"
              key={`${review.reviewFormId}-${review.user.id}`}
            >
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={`#collapsed-form-${review.reviewFormId}-${review.user.id}`}
                >
                  {form.name} for {review.user.name}
                  {review.deadlineSeconds ? (
                    <>
                      {" "}
                      (Due{" "}
                      {DateTime.fromSeconds(
                        review.deadlineSeconds,
                      ).toLocaleString(DateTime.DATETIME_MED)}{" "}
                      )
                    </>
                  ) : null}
                </button>
              </h2>
              <div
                id={`collapsed-form-${review.reviewFormId}-${review.user.id}`}
                className="accordion-collapse collapse"
                data-bs-parent="#reviews-accordion"
              >
                <ReviewFormDisplay
                  form={form}
                  review={review}
                  id={`${review.reviewFormId}-${review.user.id}`}
                  declineReview={() => declineReview(review)}
                  callbacks={callbacks}
                />
              </div>
            </div>
          ))}
        </div>
        <p />
      </>
    );
  }

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
      {reviewsSection}
      <ViewList />
      <Toast
        show={successToast}
        className="position-fixed bottom-0 end-0 p-3 bg-success-subtle"
      >
        <Toast.Body>Saved successfully!</Toast.Body>
      </Toast>
      <Toast
        show={failureToast}
        className="position-fixed bottom-0 end-0 p-3 bg-danger-subtle"
      >
        <Toast.Body>Error submitting!</Toast.Body>
      </Toast>
    </div>
  );
}
