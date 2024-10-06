import { useRouteLoaderData, useParams } from "react-router-dom";
import { useState } from "react";
import { Toast } from "react-bootstrap";
import { ViewData } from "./types";
import { MailMetadata } from "../mailer/types";

interface SendEmailModalParams {
  id: string;
  personIds: number[];
  templates: MailMetadata[];
}

export function SendEmailModal({
  id,
  personIds,
  templates,
}: SendEmailModalParams) {
  const { competitionId } = useParams();
  const [templateId, setTemplateId] = useState(
    templates.length ? templates[0].id : "",
  );
  const [successToast, setSuccessToast] = useState(false);
  const [failureToast, setFailureToast] = useState(false);

  const disabledSubmit = templates.length == 0;

  const doSubmit = async function () {
    try {
      await fetch(`/staff_api/${competitionId}/send_email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userIds: personIds,
          templateId,
        }),
      });
      setSuccessToast(true);
      setFailureToast(false);
      setTimeout(() => setSuccessToast(false), 5000);
    } catch (e) {
      setFailureToast(true);
      setSuccessToast(false);
      setTimeout(() => setFailureToast(false), 10000);
    }
  };

  return (
    <div className="modal fade" id={id}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h1 className="modal-title fs-5">Send Email</h1>
          </div>
          <div className="modal-body">
            {templates.length ? (
              <>
                <label htmlFor="template-selector">Value</label>
                <select
                  className="form-select"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                >
                  {templates.map((t) => (
                    <option value={t.id} key={"template-" + t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>You haven't created any email templates yet.</>
            )}
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
              Send
            </button>
          </div>
        </div>
      </div>
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
