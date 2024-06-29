import { useState } from "react";
import { useRouteLoaderData, Link, useNavigate } from "react-router-dom";

import { CompetitionData } from "../types/competition_data";
import { MailerData } from "./types";
import { AdminHeader } from "../admin/header";

export function MailerIndex() {
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const { templates } = useRouteLoaderData("mailer") as MailerData;
  const [renderedTemplates, setRenderedTemplates] = useState(templates);
  const [deleteId, setDeleteId] = useState("");
  const navigate = useNavigate();

  const onDeleteClick = function (e: React.MouseEvent, templateId: string) {
    event.preventDefault();
    setDeleteId(templateId);
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

  return (
    <>
      <AdminHeader />
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
                      className="btn btn-danger"
                      onClick={(e) => onDeleteClick(e, template.id)}
                      data-bs-toggle="modal"
                      data-bs-target="#delete-modal"
                    >
                      <span className="material-symbols-outlined">delete</span>{" "}
                      Delete
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
    </>
  );
}
