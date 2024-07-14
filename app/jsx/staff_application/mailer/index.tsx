import { useState } from "react";
import { useRouteLoaderData, Link, useNavigate } from "react-router-dom";
import { Toast } from "react-bootstrap";

import { CompetitionData } from "../types/competition_data";
import { MailerData, MailHook } from "./types";
import { hookToText } from "./formatter";
import { AdminHeader } from "../admin/header";
import { EditHookModal } from "./edit_hook_modal";

export function MailerIndex() {
  const { wcif, user, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const { mailerSettings, hooks, templates } = useRouteLoaderData(
    "mailer",
  ) as MailerData;
  const [renderedTemplates, setRenderedTemplates] = useState(templates);
  const [deleteId, setDeleteId] = useState("");
  const [renderedHooks, setRenderedHooks] = useState(hooks);
  const [deleteHookId, setDeleteHookId] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [showEmailToast, setShowEmailToast] = useState(false);
  const [hookForModal, setHookForModal] = useState(null as MailHook | null);
  const navigate = useNavigate();

  const onDeleteClick = function (templateId: string) {
    event.preventDefault();
    setDeleteId(templateId);
  };

  const onDeleteHookClick = function (hookId: string) {
    event.preventDefault();
    setDeleteHookId(hookId);
  };

  const emailMe = async function (templateId: string) {
    event.preventDefault();
    await fetch(`/staff_api/${wcif.id}/send_email`, {
      method: "POST",
      body: JSON.stringify({
        templateId,
        userIds: [user.id],
      }),
      headers: { "Content-Type": "application/json" },
    });
    setShowEmailToast(true);
    setTimeout(() => setShowEmailToast(false), 5000);
  };

  const deleteTemplate = async function () {
    await fetch(`/staff_api/${wcif.id}/template/${deleteId}`, {
      method: "DELETE",
    });
    setRenderedTemplates(
      renderedTemplates.filter((template) => template.id !== deleteId),
    );
    navigate(".", { replace: true });
  };

  const deleteHook = async function () {
    await fetch(`/staff_api/${wcif.id}/hook/${deleteHookId}`, {
      method: "DELETE",
    });
    setRenderedHooks(renderedHooks.filter((hook) => hook.id !== deleteHookId));
    navigate(".", { replace: true });
  };

  const setSenderAddress = function (newAddress: string) {
    mailerSettings.senderAddress = newAddress;
  };
  const setSenderName = function (newName: string) {
    mailerSettings.senderName = newName;
  };
  const submitSettings = async function () {
    event.preventDefault();
    setSpinning(true);
    await fetch(`/staff_api/${wcif.id}/mailer_settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(mailerSettings),
    });
    setSpinning(false);
  };

  return (
    <>
      <AdminHeader />
      <h3>Email Settings</h3>
      <div className="row">
        <div className="col-4 mb-3">
          <label htmlFor="email-title" className="form-label">
            Email Sender Address
          </label>
          <input
            type="email"
            className="form-control"
            id="email-title"
            defaultValue={mailerSettings.senderAddress}
            onChange={(e) => setSenderAddress(e.target.value)}
          />
        </div>
        <div className="col-4 mb-3">
          <label htmlFor="email-title" className="form-label">
            Email Sender Name
          </label>
          <input
            type="text"
            className="form-control"
            id="email-title"
            defaultValue={mailerSettings.senderName}
            onChange={(e) => setSenderName(e.target.value)}
          />
        </div>
        <div className="col-4">
          <button
            className="btn btn-primary mb-3"
            type="submit"
            onClick={submitSettings}
          >
            Save
          </button>
          {spinning ? <>Saving...</> : null}
        </div>
      </div>
      <br />
      <h3>Email Templates</h3>
      <ul className="list-group">
        {renderedTemplates.map((template) => (
          <Link
            key={template.id}
            to={`/staff/${wcif.id}/mailer/template/${template.id}`}
          >
            <li className="list-group-item">
              <div className="row">
                <div className="col-8 my-auto">{template.title}</div>
                <div className="col-4">
                  <div
                    className="float-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-success"
                      onClick={(e) => {
                        e.preventDefault();
                        navigate(
                          `/staff/${wcif.id}/mailer/template/${template.id}/clone`,
                        );
                      }}
                    >
                      <span className="material-symbols-outlined">
                        content_copy
                      </span>{" "}
                      Copy
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={(e) => onDeleteClick(template.id)}
                      data-bs-toggle="modal"
                      data-bs-target="#delete-modal"
                    >
                      <span className="material-symbols-outlined">delete</span>{" "}
                      Delete
                    </button>
                    <button
                      className="btn btn-success"
                      onClick={(e) => emailMe(template.id)}
                    >
                      <span className="material-symbols-outlined">email</span>{" "}
                      Send to me
                    </button>
                  </div>
                </div>
              </div>
            </li>
          </Link>
        ))}
      </ul>
      <div className="modal fade" id="delete-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Delete this email template?</h1>
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
                onClick={(e) => deleteTemplate()}
                data-bs-dismiss="modal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <Link to="template/new" relative="path">
          <button type="button" className="btn btn-success">
            <span className="material-symbols-outlined">add</span>
            New template
          </button>
        </Link>
      </div>
      <Toast
        show={showEmailToast}
        className="position-fixed bottom-0 end-0 p-3"
      >
        <Toast.Body>Email sent!</Toast.Body>
      </Toast>
      <br />
      <h3>Hooks</h3>
      {renderedHooks.length ? (
        <ul className="list-group">
          {renderedHooks.map((hook) => (
            <li className="list-group-item" key={hook.id}>
              <div className="row">
                <div className="col-8 my-auto">
                  {hookToText(hook, settings, templates)}
                </div>
                <div className="col-4">
                  <div
                    className="float-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="btn btn-danger"
                      onClick={(e) => setDeleteHookId(hook.id)}
                      data-bs-toggle="modal"
                      data-bs-target="#delete-hook-modal"
                    >
                      <span className="material-symbols-outlined">delete</span>{" "}
                      Delete
                    </button>
                    <button
                      className="btn btn-success"
                      data-bs-toggle="modal"
                      data-bs-target="#hook-modal"
                      onClick={(e) => setHookForModal(hook)}
                    >
                      <span className="material-symbols-outlined">edit</span>{" "}
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="modal fade" id="delete-hook-modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">Delete this hook?</h1>
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
                onClick={(e) => deleteHook()}
                data-bs-dismiss="modal"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
      <div>
        <button
          type="button"
          className="btn btn-success"
          onClick={(e) => setHookForModal(null)}
          data-bs-toggle="modal"
          data-bs-target="#hook-modal"
        >
          <span className="material-symbols-outlined">add</span>
          New Hook
        </button>
      </div>
      <EditHookModal id="hook-modal" hook={hookForModal} />
    </>
  );
}
