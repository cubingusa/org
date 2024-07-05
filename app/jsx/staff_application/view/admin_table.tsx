import { useState } from "react";
import { useRouteLoaderData, Link } from "react-router-dom";
import { DateTime } from "luxon";

import { ColumnModal } from "./column_modal";
import { EditPropertiesModal } from "./edit_properties_modal";
import { SendEmailModal } from "./send_email_modal";
import { ReviewsModal } from "./reviews_modal";
import { Filter } from "../filter/filter";
import { FilterModal } from "../filter/modal";
import { FilterParams } from "../filter/types/params";
import { createFilter } from "../filter/create_filter";
import { ComputerParams } from "../trait/params";
import { TraitComputer } from "../trait/api";
import { createComputer } from "../trait/create_computer";
import { CompetitionData } from "../types/competition_data";
import { SavedView, ExportedRow, ViewData } from "./types";
import { ViewTable } from "./table";
import { ViewSaver } from "./saver";
import { AdminHeader } from "../admin/header";

interface AdminTableParams {
  adminRouterId: string;
}
export function AdminTable({ adminRouterId }: AdminTableParams) {
  const { user, wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const view: SavedView = (useRouteLoaderData("view") as SavedView) || {
    id: "",
    title: "",
    filters: [],
    columns: [],

    isPublic: false,
    visibleTo: [],
    exportTimeSeconds: 0,
    exportedRows: [],
  };
  const { templates, applicants, reviewSettings } = useRouteLoaderData(
    adminRouterId,
  ) as ViewData;
  const [selectedIds, setSelectedIds] = useState([] as number[]);
  const [computers, setComputers] = useState(
    view.columns.map((params) => createComputer(params, settings, wcif)),
  );
  const [filters, setFilters] = useState(
    view.filters.map((params) => createFilter(params, settings, wcif)),
  );

  const addColumn = function (trait: ComputerParams) {
    const newComputer = createComputer(trait, settings, wcif);
    if (computers.map((c) => c.id()).includes(newComputer.id())) {
      return;
    }
    setComputers([...computers, newComputer]);
  };

  const deleteColumn = function (columnId: string) {
    setComputers(computers.filter((c) => c.id() !== columnId));
  };

  const addFilter = function (params: FilterParams) {
    const newFilter = createFilter(params, settings, wcif);
    if (filters.map((c) => c.id()).includes(newFilter.id())) {
      return;
    }
    setFilters([...filters, newFilter]);
    setSelectedIds([]);
  };

  const deleteFilter = function (filterId: string) {
    setFilters(filters.filter((f) => f.id() !== filterId));
  };

  const exportedRows: ExportedRow[] = applicants
    .filter((applicant) => {
      return !filters.some((f) => !f.apply(applicant));
    })
    .map((applicant) => {
      return {
        userName: applicant.user.name,
        userId: applicant.user.id,
        userWcaId: applicant.user.wcaId,
        cells: computers.map((computer) =>
          computer.compute(applicant).serialize(),
        ),
      };
    });

  return (
    <>
      <AdminHeader />
      {view.exportTimeSeconds > 0 && view.isPublic ? (
        <div className="alert alert-primary">
          This view was last snapshotted{" "}
          {DateTime.fromSeconds(view.exportTimeSeconds).toLocaleString(
            DateTime.DATETIME_MED,
          )}{" "}
          <Link to=".." relative="path">
            View the public snapshot of this view.
          </Link>
        </div>
      ) : null}
      {filters.length > 0 ? (
        <p>
          Filters:&nbsp;
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
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#email-modal"
        disabled={selectedIds.length == 0}
      >
        <span className="material-symbols-outlined">mail</span> Email
      </button>
      <SendEmailModal
        id="email-modal"
        personIds={selectedIds}
        templates={templates}
      />
      &nbsp;
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#properties-modal"
        disabled={selectedIds.length == 0}
      >
        <span className="material-symbols-outlined">edit</span> Edit{" "}
        {selectedIds.length} {selectedIds.length == 1 ? "person" : "people"}
      </button>
      <EditPropertiesModal id="properties-modal" personIds={selectedIds} />
      &nbsp;
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#reviews-modal"
        disabled={selectedIds.length == 0}
      >
        <span className="material-symbols-outlined">reviews</span> Request
        Reviews
      </button>
      <ReviewsModal
        id="reviews-modal"
        personIds={selectedIds}
        allApplicants={applicants}
        reviewSettings={reviewSettings}
      />
      &nbsp;
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#filter-modal"
      >
        <span className="material-symbols-outlined">add</span> Add Filter
      </button>
      <FilterModal id="filter-modal" addFilter={addFilter} />
      &nbsp;
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#column-modal"
      >
        <span className="material-symbols-outlined">add</span> Add Column
      </button>
      <ColumnModal id="column-modal" addColumn={addColumn} />
      &nbsp;
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="collapse"
        data-bs-target="#save-collapse"
      >
        <span className="material-symbols-outlined">save</span> Save this view
      </button>
      <div className="row">
        <div className="collapse" id="save-collapse">
          <div className="card card-body">
            <ViewSaver
              view={{
                id: view.id,
                title: view.title,
                filters: filters.map((f) => f.getParams()),
                columns: computers.map((c) => c.getParams()),
                exportTimeSeconds: view.exportTimeSeconds,
                exportedRows: exportedRows,
                isPublic: view.isPublic,
                visibleTo: view.visibleTo,
              }}
              collapseId="#save-collapse"
            />
          </div>
        </div>
      </div>
      <ViewTable
        admin={true}
        computers={computers}
        rows={exportedRows}
        updateSelectedIds={setSelectedIds}
        deleteColumn={deleteColumn}
      />
    </>
  );
}
