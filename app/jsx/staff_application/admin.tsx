import { useState, useCallback } from "react";
import { useRouteLoaderData, Navigate, Link } from "react-router-dom";
import { Form } from "types/form";

function FormEditor(props) {
  const [name, setName] = useState(props.form.name || "");
  const form = props.form;
  const deleteForm = props.deleteForm;

  const updateName = function (name) {
    form.name = name;
    setName(name);
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
            value={form.description}
            onChange={(e) => (form.description = e.target.value)}
            placeholder="Text to show at the top of the form"
          ></textarea>
        </div>
        <button
          type="button"
          className="btn btn-danger"
          onClick={(e) => deleteForm(form)}
        >
          <span className="material-symbols-outlined">delete</span> Delete
        </button>
      </div>
    </div>
  );
}

export function Admin() {
  const [spinning, setSpinning] = useState(false);
  const { wcif, user, settings } = useRouteLoaderData("competition");
  const [formCount, setFormCount] = useState((settings.forms || []).length);

  const submit = async function () {
    console.log(settings);
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
    if (settings.forms === undefined) {
      settings.forms = [];
    }
    if (settings.nextFormId === undefined) {
      settings.nextFormId = 0;
    }
    settings.forms.push({
      id: settings.nextFormId,
      name: "New Form",
      description: "",
      isOpen: false,
      deadline: null,
    });
    setFormCount(settings.forms.length);
    settings.nextFormId += 1;
  };

  const deleteForm = function (form) {
    settings.forms = settings.forms.filter((f) => f.id !== form.id);
    setFormCount(settings.forms.length);
  };

  if (user === null || !user.is_admin) {
    return <Navigate to="" />;
  }
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
            value={settings.description}
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
            <div className="accordion-item">
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
