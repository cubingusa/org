import { useRouteLoaderData } from "react-router-dom";
import { FormEvent, useState } from "react";
import { EventId, getEventName } from "@wca/helpers";
import {
  PersonalAttribute,
  ColumnType,
  ColumnParams,
  FormMetadata,
} from "./api.proto";
import { CompetitionData } from "../../types/competition_data";

interface ColumnModalParams {
  id: string;
  addColumn: (params: ColumnParams) => void;
}

export function ColumnModal({ id, addColumn }: ColumnModalParams) {
  const [columnType, setColumnType] = useState(ColumnType.PERSONAL_ATTRIBUTE);
  const [personalAttributeType, setPersonalAttributeType] = useState(
    PersonalAttribute.AGE,
  );
  const { wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const [formId, setFormId] = useState(
    settings.forms.length > 0 ? settings.forms[0].id : null,
  );
  const selectedForm = settings.forms.find((form) => form.id == formId);
  const [questionId, setQuestionId] = useState(
    selectedForm?.questions.length > 0 ? selectedForm.questions[0].id : null,
  );
  const [formMetadata, setFormMetadata] = useState(FormMetadata.SUBMITTED);
  const [eventId, setEventId] = useState(wcif.events[0].id);
  const [propertyId, setPropertyId] = useState(
    settings.properties.length > 0 ? settings.properties[0].id : null,
  );
  let disabledSubmit = false;

  const doAddColumn = function () {
    switch (columnType) {
      case ColumnType.PERSONAL_ATTRIBUTE:
        let params = ColumnParams.fromObject({
          columnType,
          attribute: personalAttributeType,
        });
        if (
          personalAttributeType == PersonalAttribute.REGISTERED_FOR_EVENT ||
          personalAttributeType ==
            PersonalAttribute.PSYCH_SHEET_POSITION_FOR_EVENT
        ) {
          params.eventId = eventId;
        }
        addColumn(params);
        break;
      case ColumnType.FORM_ANSWER:
        addColumn(ColumnParams.fromObject({ columnType, questionId, formId }));
        break;
      case ColumnType.FORM_METADATA:
        addColumn(
          ColumnParams.fromObject({ columnType, formMetadata, formId }),
        );
        break;
      case ColumnType.PROPERTY:
        addColumn(ColumnParams.fromObject({ columnType, propertyId }));
        break;
    }
  };

  let detailsSection;
  switch (columnType) {
    case ColumnType.PERSONAL_ATTRIBUTE:
      let eventSection;
      if (
        personalAttributeType == PersonalAttribute.REGISTERED_FOR_EVENT ||
        personalAttributeType ==
          PersonalAttribute.PSYCH_SHEET_POSITION_FOR_EVENT
      ) {
        eventSection = (
          <select
            className="form-select"
            value={eventId}
            onChange={(e) => setEventId(e.target.value as EventId)}
          >
            {wcif.events.map((evt) => (
              <option value={evt.id}>{getEventName(evt.id)}</option>
            ))}
          </select>
        );
      }
      detailsSection = (
        <>
          <select
            className="form-select"
            value={personalAttributeType}
            onChange={(e) =>
              setPersonalAttributeType(+e.target.value as PersonalAttribute)
            }
          >
            <option value={PersonalAttribute.AGE}>Age</option>
            <option value={PersonalAttribute.DELEGATE_STATUS}>
              Delegate Status
            </option>
            <option value={PersonalAttribute.REGISTERED}>Registered</option>
            <option value={PersonalAttribute.LISTED_ORGANIZER}>
              Listed Organizer
            </option>
            <option value={PersonalAttribute.LISTED_DELEGATE}>
              Listed Delegate
            </option>
            <option value={PersonalAttribute.REGISTERED_FOR_EVENT}>
              Registered for Event
            </option>
            <option value={PersonalAttribute.PSYCH_SHEET_POSITION_FOR_EVENT}>
              Psych Sheet Position
            </option>
          </select>
          {eventSection}
        </>
      );
      break;
    case ColumnType.FORM_ANSWER:
    case ColumnType.FORM_METADATA:
      if (settings.forms.length == 0) {
        detailsSection = <div>You haven't added any forms yet!</div>;
        disabledSubmit = true;
      } else {
        const formSection = (
          <>
            <div className="row g-2 align-items-center">
              <div className="col-auto">
                <label htmlFor="form-selector" className="col-form-label">
                  Form
                </label>
              </div>
              <div className="col-auto">
                <select
                  className="form-select"
                  id="col-form-label"
                  value={formId}
                  onChange={(e) => setFormId(+e.target.value)}
                >
                  {settings.forms.map((form) => (
                    <option value={form.id} key={"form-" + form.id}>
                      {form.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        );
        let questionSection;
        if (
          columnType == ColumnType.FORM_ANSWER &&
          selectedForm?.questions.length > 0
        ) {
          questionSection = (
            <>
              <div className="row g-2 align-items-center">
                <div className="col-auto">
                  <label htmlFor="question-selector" className="col-form-label">
                    Question
                  </label>
                </div>
                <div className="col-auto">
                  <select
                    className="form-select"
                    id="col-question-label"
                    value={questionId}
                    onChange={(e) => setQuestionId(+e.target.value)}
                  >
                    {selectedForm.questions.map((question) => (
                      <option
                        value={question.id}
                        key={`question-${question.id}`}
                      >
                        {question.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          );
        } else if (columnType == ColumnType.FORM_METADATA) {
          questionSection = (
            <>
              <select
                className="form-select"
                value={formMetadata}
                onChange={(e) => setFormMetadata(+e.target.value)}
              >
                {[
                  { id: FormMetadata.SUBMITTED, name: "Submitted" },
                  { id: FormMetadata.SUBMIT_TIME, name: "Submitted Time" },
                  { id: FormMetadata.UPDATE_TIME, name: "Updated Time" },
                ].map(({ id, name }) => (
                  <option value={id} key={`fm-${id}`}>
                    {name}
                  </option>
                ))}
              </select>
            </>
          );
        } else {
          disabledSubmit = true;
          if (selectedForm !== null) {
            questionSection = <div>This form does not have any questions.</div>;
          }
        }
        detailsSection = (
          <>
            {formSection}
            {questionSection}
          </>
        );
      }
      break;
    case ColumnType.PROPERTY:
      if (settings.properties.length == 0) {
        detailsSection = <>You haven't created any properties!</>;
        disabledSubmit = true;
      } else {
        detailsSection = (
          <select
            className="form-select"
            value={propertyId}
            onChange={(e) => setPropertyId(+e.target.value)}
          >
            {settings.properties.map((property) => (
              <option value={property.id} key={property.id}>
                {property.name}
              </option>
            ))}
          </select>
        );
      }
  }

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Add Column</h1>
          </div>
          <div className="modal-body">
            {[
              { id: ColumnType.PERSONAL_ATTRIBUTE, name: "Personal Attribute" },
              { id: ColumnType.FORM_ANSWER, name: "Form Answer" },
              { id: ColumnType.FORM_METADATA, name: "Form Metadata" },
              { id: ColumnType.PROPERTY, name: "Property" },
            ].map(({ id, name }) => (
              <div className="form-check" key={id}>
                <input
                  className="form-check-input"
                  name="column-type"
                  type="radio"
                  id={"radio-" + id}
                  value={id}
                  defaultChecked={columnType == id}
                  onChange={(evt) => setColumnType(id)}
                />
                <label className="form-check-label" htmlFor={"radio-" + id}>
                  {name}
                </label>
              </div>
            ))}
            {detailsSection}
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
              onClick={doAddColumn}
              disabled={disabledSubmit}
            >
              <span className="material-symbols-outlined">add</span> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
