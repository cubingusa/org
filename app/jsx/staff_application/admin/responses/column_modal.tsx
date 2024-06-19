import { useRouteLoaderData } from "react-router-dom";
import { FormEvent, useState } from "react";
import { ColumnParams, ColumnType, PersonalAttribute } from "./column";
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
  const { settings } = useRouteLoaderData("competition") as CompetitionData;
  const [formId, setFormId] = useState(
    settings.forms.length > 0 ? settings.forms[0].id : null,
  );
  const selectedForm = settings.forms.find((form) => form.id == formId);
  const [questionId, setQuestionId] = useState(
    selectedForm?.questions.length > 0 ? selectedForm.questions[0].id : null,
  );
  let disabledSubmit = false;

  const doAddColumn = function () {
    switch (columnType) {
      case ColumnType.PERSONAL_ATTRIBUTE:
        addColumn({
          columnType,
          attribute: personalAttributeType,
        });
        break;
      case ColumnType.FORM_ANSWER:
        addColumn({ columnType, questionId, formId });
        break;
    }
  };

  let detailsSection;
  switch (columnType) {
    case ColumnType.PERSONAL_ATTRIBUTE:
      detailsSection = (
        <select
          className="form-select"
          value={personalAttributeType}
          onChange={(e) =>
            setPersonalAttributeType(e.target.value as PersonalAttribute)
          }
        >
          <option value={PersonalAttribute.AGE}>Age</option>
          <option value={PersonalAttribute.DELEGATE_STATUS}>
            Delegate Status
          </option>
        </select>
      );
      break;
    case ColumnType.FORM_ANSWER:
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
        if (selectedForm?.questions.length > 0) {
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
                        key={"question-" + question.id}
                      >
                        {question.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
            ].map(({ id, name }) => {
              return (
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
              );
            })}
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
