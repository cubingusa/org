import { useState } from "react";
import { useRouteLoaderData, Link, useNavigate } from "react-router-dom";

import { CompetitionData } from "../types/competition_data";
import { SavedView, ExportedRow } from "./types";
import { AdminHeader } from "../admin/header";

export function AdminBase() {
  const { views, wcif } = useRouteLoaderData("competition") as CompetitionData;
  const [deleteId, setDeleteId] = useState("");
  const navigate = useNavigate();

  const onDeleteClick = function (e: React.MouseEvent, viewId: string) {
    event.preventDefault();
    setDeleteId(viewId);
  };

  const deleteView = async function () {
    await fetch(`/staff_api/${wcif.id}/view/${deleteId}`, {
      method: "DELETE",
    });
    navigate(".", { replace: true });
  };

  return (
    <>
      <AdminHeader />
      {views.length > 0 ? (
        <>
          <h3>Saved Views</h3>
          <ul className="list-group">
            {views.map((view) => (
              <Link
                key={view.id}
                to={`/staff/${wcif.id}/view/${view.id}/admin`}
              >
                <li className="list-group-item">
                  <div className="row">
                    <div className="col-8 my-auto">
                      {view.title}&nbsp;
                      <span className="material-symbols-outlined">
                        {view.isPublic ? "visibility" : "visibility_off"}
                      </span>
                    </div>
                    <div className="col-4">
                      <div
                        className="float-end"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="btn btn-danger"
                          onClick={(e) => onDeleteClick(e, view.id)}
                          data-bs-toggle="modal"
                          data-bs-target="#delete-modal"
                        >
                          <span className="material-symbols-outlined">
                            delete
                          </span>{" "}
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
                  <h1 className="modal-title fs-5">Delete this view?</h1>
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
                    onClick={(e) => deleteView()}
                    data-bs-dismiss="modal"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
      <div>
        <Link to="new" relative="path">
          <button type="button" className="btn btn-success">
            <span className="material-symbols-outlined">add</span>
            New view
          </button>
        </Link>
      </div>
    </>
  );
}
