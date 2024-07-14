import { useRouteLoaderData } from "react-router-dom";
import { FormEvent, useState } from "react";
import { EventId, getEventName } from "@wca/helpers";
import { CompetitionData } from "../types/competition_data";
import {
  MailerData,
  MailHook,
  HookType,
  PropertyAssignedMailHook,
  FormSubmittedMailHook,
} from "./types";

interface EditHookModalParams {
  id: string;
  hook: MailHook;
}
export function EditHookModal({ id, hook }: EditHookModalParams) {
  const { settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const { templates } = useRouteLoaderData("mailer") as MailerData;
  if (hook == null) {
    hook = {
      id: "",
      type: "FormSubmitted",
      formId: settings.forms.length == 0 ? 0 : settings.forms[0].id,
      templateId: templates.length == 0 ? "" : templates[0].id,
      recipient: "User",
    };
  }
  const [hookType, setHookType] = useState(hook.type);
  const updateHookType = function (hookType: HookType): void {
    switch (hookType) {
      case "FormSubmitted":
        hook = Object.assign(hook, {
          type: hookType,
          formId: settings.forms.length == 0 ? 0 : settings.forms[0].id,
        });
      case "PropertyAssigned":
        hook = Object.assign(hook, {
          type: hookType,
          propertyId:
            settings.properties.length == 0 ? 0 : settings.properties[0].id,
          propertyValue:
            settings.properties.length == 0 ||
            settings.properties[0].values.length == 0
              ? 0
              : settings.properties[0].values[0].id,
        });
    }
    setHookType(hookType);
  };
  const [propertyId, setPropertyId] = useState(
    hook.type == "PropertyAssigned" ? hook.propertyId : 0,
  );
  const updatePropertyId = function (propertyId: number) {
    (hook as PropertyAssignedMailHook).propertyId = propertyId;
    setPropertyId(propertyId);
  };
  const property = settings.properties.find((p) => p.id == propertyId);

  const [recipient, setRecipient] = useState(hook.recipient);
  const updateRecipient = function (recipient: string) {
    hook.recipient = recipient;
    setRecipient(recipient);
  };

  let disabledSubmit = false;
  const hookTypeSection = (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <label htmlFor="trigger-select" className="col-form-label">
          Trigger
        </label>
      </div>
      <div className="col-auto">
        <select
          className="form-select"
          value={hookType}
          onChange={(e) => updateHookType(e.target.value as HookType)}
          id="trigger-select"
        >
          <option value="PropertyAssigned">
            Property assigned to applicant
          </option>
          <option value="FormSubmitted">Applicant submits form</option>
        </select>
      </div>
    </div>
  );

  let detailsSection;
  switch (hookType) {
    case "PropertyAssigned":
      const propertyHook = hook as PropertyAssignedMailHook;
      if (property == undefined || property.values.length == 0) {
        disabledSubmit = true;
      }

      const propertySection =
        settings.properties.length > 0 ? (
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <label htmlFor="property-selector" className="col-form-label">
                Property
              </label>
            </div>
            <div className="col-auto">
              <select
                className="form-select"
                id="property-selector"
                value={propertyId}
                onChange={(e) => updatePropertyId(+e.target.value)}
              >
                {settings.properties.map((p) => (
                  <option value={p.id} key={"property-" + p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <>You haven't created any properties for this competition.</>
        );
      let valuesSection;
      if (settings.properties.length >= 0) {
        valuesSection =
          property == undefined ? (
            <>Hmm, something's gone wrong.</>
          ) : (
            <div className="row g-2 align-items-center">
              <div className="col-auto">
                <label htmlFor="value-selector" className="col-form-label">
                  Value
                </label>
              </div>
              <div className="col-auto">
                <select
                  className="form-select"
                  id="value-selector"
                  defaultValue={propertyHook.propertyValue}
                  onChange={(e) =>
                    (propertyHook.propertyValue = +e.target.value)
                  }
                >
                  <option value={-1}>Delete property</option>
                  {property.values.map(({ id, value }) => (
                    <option value={id} key={"val-" + id}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
      }

      detailsSection = (
        <>
          {propertySection}
          {valuesSection}
        </>
      );
      break;
    case "FormSubmitted":
      const formHook = hook as FormSubmittedMailHook;
      if (settings.forms.length == 0) {
        disabledSubmit = true;
      }
      detailsSection =
        settings.forms.length == 0 ? (
          <>You haven't created any forms yet.</>
        ) : (
          <div className="row g-2 align-items-center">
            <div className="col-auto">
              <label htmlFor="form-selector" className="col-form-label">
                Form
              </label>
            </div>
            <div className="col-auto">
              <select
                className="form-select"
                id="form-selector"
                defaultValue={formHook.formId}
                onChange={(e) => (formHook.formId = +e.target.value)}
              >
                {settings.forms.map((form) => (
                  <option key={form.id} value={form.id}>
                    {form.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );
  }

  const templateSection = (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <label htmlFor="template-select" className="col-form-label">
          Template
        </label>
      </div>
      <div className="col-auto">
        <select
          className="form-select"
          id="template-select"
          defaultValue={hook.templateId}
          onChange={(e) => (hook.templateId = e.target.value)}
        >
          {templates.map((template) => (
            <option key={template.id} value={template.id}>
              {template.title}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
  if (templates.length == 0) {
    disabledSubmit = true;
  }

  const changeRecipient = function (newRecipient: string) {
    if (newRecipient == "User") {
      updateRecipient("User");
    } else {
      updateRecipient("");
    }
  };

  const recipientSection = (
    <div className="row g-2 align-items-center">
      <div className="col-auto">
        <label htmlFor="recipient-select" className="col-form-label">
          Recipient
        </label>
      </div>
      <div className="col-auto">
        <select
          className="form-select"
          id="recipient-select"
          value={recipient == "User" ? "User" : "Other"}
          onChange={(e) => changeRecipient(e.target.value)}
        >
          <option value="User">Applicant</option>
          <option value="Other">Other</option>
        </select>
      </div>
      {recipient == "User" ? null : (
        <div className="col-auto">
          <input
            type="text"
            className="form-control"
            value={recipient}
            onChange={(e) => updateRecipient(e.target.value)}
          />
        </div>
      )}
    </div>
  );

  const doSubmit = async function () {
    const url =
      hook.id == ""
        ? `/staff_api/${wcif.id}/hook`
        : `/staff_api/${wcif.id}/hook/${hook.id}`;
    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(hook),
    });
    window.location.reload();
  };

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Edit Hook</h1>
          </div>
          <div className="modal-body">
            {hookTypeSection}
            {detailsSection}
            {templateSection}
            {recipientSection}
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
              className="btn btn-success"
              data-bs-dismiss="modal"
              onClick={doSubmit}
              disabled={disabledSubmit}
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
