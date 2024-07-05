import { useState } from "react";
import { DateTime } from "luxon";
import { useRouteLoaderData, Link } from "react-router-dom";
import { CompetitionData } from "../types/competition_data";
import { Form } from "../types/form";
import { Property } from "../types/property";
import { FormEditor } from "./form_editor";
import { PropertyEditor } from "./property_editor";
import { AdminHeader } from "./header";

export function Admin() {
  const [spinning, setSpinning] = useState(false);
  const { wcif, user, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const [formCount, setFormCount] = useState((settings.forms || []).length);
  const [propertyCount, setPropertyCount] = useState(
    (settings.properties || []).length,
  );

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
    if (settings.forms === undefined) {
      settings.forms = [];
      settings.nextFormId = 0;
    }
    settings.forms.push({
      id: settings.nextFormId,
      name: "New Form",
      description: "",
      isOpen: false,
      deadlineSeconds: DateTime.now().toSeconds(),
      nextQuestionId: 0,
      questions: [],
      filters: [],
    });
    setFormCount(settings.forms.length);
    settings.nextFormId += 1;
  };

  const deleteForm = function (form: Form) {
    settings.forms = settings.forms.filter((f) => f.id !== form.id);
    setFormCount(settings.forms.length);
  };

  const newProperty = function () {
    event.preventDefault();
    if (settings.properties === undefined) {
      settings.properties = [];
      settings.nextPropertyId = 0;
    }
    settings.properties.push({
      id: settings.nextPropertyId,
      name: "New Property",
      visible: false,
      values: [],
      nextValueId: 0,
    });
    setPropertyCount(settings.properties.length);
    settings.nextPropertyId++;
  };

  const deleteProperty = function (property: Property) {
    settings.properties = settings.properties.filter(
      (p) => p.id !== property.id,
    );
    setPropertyCount(settings.properties.length);
  };

  let spinner;
  if (spinning) {
    spinner = <div>submitting...</div>;
  }
  return (
    <>
      <AdminHeader />
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
        <h3>Properties</h3>
        <div>
          You can add properties that can be applied to applicants, for example
          whether their application has been accepted or not, or what team they
          have been accepted to.
        </div>
        <div className="accordion" id="propertyAccordion">
          {(settings.properties || []).map((property) => (
            <div className="accordion-item" key={property.id}>
              <h2 className="accordion-header">
                <button
                  className="accordion-button collapsed"
                  id={"header-" + property.id}
                  type="button"
                  data-bs-toggle="collapse"
                  data-bs-target={"#collapsed-property-" + property.id}
                >
                  {property.name}
                </button>
              </h2>
              <div
                id={"collapsed-property-" + property.id}
                className="accordion-collapse collapse"
                data-bs-parent="#propertyAccordion"
              >
                <PropertyEditor
                  property={property}
                  deleteProperty={deleteProperty}
                ></PropertyEditor>
              </div>
            </div>
          ))}
        </div>
        <div>
          <button className="btn btn-success mb-3" onClick={newProperty}>
            <span className="material-symbols-outlined">add</span> New Property
          </button>
        </div>
        <br />
        <button className="btn btn-primary mb-3" type="submit" onClick={submit}>
          Save
        </button>
        {spinner}
      </form>
    </>
  );
}
