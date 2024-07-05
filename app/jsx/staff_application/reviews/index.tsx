import { useState } from "react";
import { useRouteLoaderData, Link, useParams } from "react-router-dom";

import { ReviewsData, ReviewForm } from "./types";
import { ReviewFormEditor } from "./editor";
import { AdminHeader } from "../admin/header";

export function ReviewsIndex() {
  const { competitionId } = useParams();
  const settings = useRouteLoaderData("reviews") as ReviewsData;
  const [forms, setForms] = useState(settings.forms || []);
  const [spinning, setSpinning] = useState(false);

  const submit = async function () {
    event.preventDefault();
    setSpinning(true);
    await fetch(`/staff_api/${competitionId}/review/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSpinning(false);
  };

  const newForm = function () {
    event.preventDefault();
    if (settings.nextFormId === undefined) {
      settings.nextFormId = 0;
    }

    const newForms = [
      ...forms,
      {
        id: settings.nextFormId,
        name: "New Review Form",
        description: "",
        eligibleReviewerFilters: [],
        questions: [],
        nextQuestionId: 0,
        defaults: [],
      },
    ];
    settings.forms = newForms;
    settings.nextFormId += 1;
    setForms(newForms);
  };

  const deleteForm = function (form: ReviewForm) {
    settings.forms = settings.forms.filter((f) => f.id !== form.id);
    setForms(settings.forms);
  };

  let spinner;
  if (spinning) {
    spinner = <div>submitting...</div>;
  }

  return (
    <>
      <AdminHeader />
      <h3>Review Forms</h3>
      <div className="accordion" id="formAccordion">
        {forms.map((form) => (
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
              <ReviewFormEditor form={form} deleteForm={deleteForm} />
            </div>
          </div>
        ))}
      </div>
      <div>
        <button className="btn btn-success mb-3" onClick={newForm}>
          <span className="material-symbols-outlined">add</span> New Form
        </button>
      </div>
      <br />
      <button className="btn btn-primary mb-3" type="submit" onClick={submit}>
        Save
      </button>
      {spinner}
    </>
  );
}
