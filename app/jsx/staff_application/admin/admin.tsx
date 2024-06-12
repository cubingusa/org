import { useState, useCallback } from "react";
import { useRouteLoaderData, Navigate, Link, Outlet } from "react-router-dom";
import { CompetitionData } from "../types/competition_data";
import { Form } from "../types/form";
import { FormEditor } from "./form_editor";

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
