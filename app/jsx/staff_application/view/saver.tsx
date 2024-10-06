import { useState } from "react";
import { useRouteLoaderData, useParams, useNavigate } from "react-router-dom";
import { DateTime } from "luxon";

import { ColumnModal } from "./column_modal";
import { EditPropertiesModal } from "./edit_properties_modal";
import { Filter } from "../filter/filter";
import { FilterModal } from "../filter/modal";
import { FilterParams } from "../filter/types/params";
import { createFilter } from "../filter/create_filter";
import { ComputerParams } from "../trait/params";
import { TraitComputer } from "../trait/api";
import { createComputer } from "../trait/create_computer";
import { ApplicantData } from "../types/applicant_data";
import { CompetitionData } from "../types/competition_data";
import { SavedView, ExportedRow } from "./types";
import { ViewTable } from "./table";

interface ViewSaverParams {
  view: SavedView;
  collapseId: string;
}
export function ViewSaver({ view, collapseId }: ViewSaverParams) {
  const { user, wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const { competitionId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState(view.title);
  const [id, setId] = useState(view.id);
  const [isPublic, setIsPublic] = useState(view.isPublic);
  const [filters, setFilters] = useState(
    view.visibleTo.map((params) => createFilter(params, settings, wcif)),
  );

  const addFilter = function (params: FilterParams) {
    const newFilter = createFilter(params, settings, wcif);
    if (filters.map((c) => c.id()).includes(newFilter.id())) {
      return;
    }
    setFilters([...filters, newFilter]);
  };

  const deleteFilter = function (filterId: string) {
    setFilters(filters.filter((f) => f.id() !== filterId));
  };

  const saveView = async function () {
    let valid = true;
    if (title === "") {
      document.getElementById("titleEditor").classList.add("is-invalid");
      valid = false;
    } else {
      document.getElementById("titleEditor").classList.remove("is-invalid");
    }
    if (id === "") {
      document.getElementById("idEditor").classList.add("is-invalid");
      valid = false;
    } else {
      document.getElementById("idEditor").classList.remove("is-invalid");
    }
    if (!valid) {
      return;
    }
    view.id = id;
    view.title = title;
    view.isPublic = isPublic;
    view.visibleTo = filters.map((filter) => filter.getParams());
    view.exportTimeSeconds = DateTime.now().toSeconds();
    await fetch(`/staff_api/${wcif.id}/view/${view.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(view),
    });
    // TODO: show that it is in progress.
    // TODO: error handling.
  };
  // TODO: don't include review-based filters.

  return (
    <>
      <div className="row">
        <div className="col-3 mb-3">
          <label htmlFor="titleEditor" className="form-label">
            Title
          </label>
          <input
            type="text"
            className="form-control"
            id="titleEditor"
            defaultValue={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="col-9 mb-3">
          <label htmlFor="idEditor" className="form-label">
            URL
          </label>
          <div className="input-group">
            <span className="input-group-text">
              https://cubingusa.org/staff/{competitionId}/view/
            </span>
            <input
              type="text"
              className="form-control"
              id="idEditor"
              defaultValue={id}
              onChange={(e) => setId(e.target.value)}
            />
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-3">
          <div className="form-switch">
            <input
              type="checkbox"
              className="form-check-input"
              role="switch"
              id="isPublicEditor"
              defaultChecked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            &nbsp;
            <label htmlFor="isPublicEditor" className="form-label">
              {" "}
              Visible to Staff
            </label>
          </div>
        </div>

        <div className="col-auto">
          {isPublic ? (
            <button
              type="button"
              className="btn btn-success"
              data-bs-toggle="modal"
              data-bs-target="#saved-view-filter-modal"
            >
              <span className="material-symbols-outlined">add</span> Add Filter
            </button>
          ) : null}
        </div>
        <div className="col-auto">
          {filters.length > 0 && isPublic ? (
            <p>
              {filters.map((filter) => (
                <span key={filter.id()}>
                  <span className="badge text-bg-primary">
                    {filter.description()}
                  </span>
                  <span
                    className="material-symbols-outlined"
                    onClick={(e) => deleteFilter(filter.id())}
                    style={{ cursor: "pointer" }}
                  >
                    delete
                  </span>
                </span>
              ))}
            </p>
          ) : null}
        </div>
      </div>
      <FilterModal id="saved-view-filter-modal" addFilter={addFilter} />
      &nbsp;
      <button
        type="submit"
        className="btn btn-success"
        onClick={(e) => saveView()}
        data-bs-toggle="collapse"
        data-bs-target={collapseId}
      >
        <span className="material-symbols-outlined">save</span> Save
      </button>
    </>
  );
}
