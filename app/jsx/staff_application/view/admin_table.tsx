import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";

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
import { AdminHeader } from "../admin/header";

export function AdminTable() {
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
  const applicants = useRouteLoaderData("applicants") as ApplicantData[];
  const [selectedIds, setSelectedIds] = useState([] as Number[]);
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
