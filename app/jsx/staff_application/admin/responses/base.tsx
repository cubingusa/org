import { useState } from "react";
import { useRouteLoaderData, Link } from "react-router-dom";
import { util } from "protobufjs";

import { ColumnModal } from "./column_modal";
import { FilterModal } from "../../filter/modal";
import { EditPropertiesModal } from "./edit_properties_modal";
import { Filter } from "../../filter/filter";
import { FilterParams } from "../../filter/types/params";
import { createFilter } from "../../filter/create_filter";
import { ComputerParams } from "../../trait/params";
import { TraitComputer } from "../../trait/api";
import { createComputer } from "../../trait/create_computer";
import { ApplicantData } from "../../types/applicant_data";
import { CompetitionData } from "../../types/competition_data";

export function Responses() {
  const { wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const applicants = useRouteLoaderData("responses") as ApplicantData[];
  const [selectedIds, setSelectedIds] = useState([] as Number[]);
  const [computers, setComputers] = useState([] as TraitComputer[]);
  const [filters, setFilters] = useState([] as Filter[]);

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

  const filteredApplicants = applicants.filter((applicant) => {
    return !filters.some((f) => !f.apply(applicant));
  });

  const onSelectAll = function (selected: boolean) {
    if (selected) {
      setSelectedIds(filteredApplicants.map((applicant) => applicant.user.id));
    } else {
      setSelectedIds([]);
    }
  };

  const onSelectPerson = function (
    selected: boolean,
    applicant: ApplicantData,
  ) {
    if (selected) {
      setSelectedIds([...selectedIds, applicant.user.id]);
    } else {
      setSelectedIds(selectedIds.filter((a) => a != applicant.user.id));
    }
  };

  return (
    <>
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
      ) : (
        <></>
      )}
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
      <table className="table" style={{ overflowX: "auto" }}>
        <thead>
          <tr>
            <th scope="col">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="select-all"
                  checked={selectedIds.length == filteredApplicants.length}
                  ref={(input) => {
                    if (!input) {
                      return;
                    }
                    if (
                      selectedIds.length > 0 &&
                      selectedIds.length < filteredApplicants.length
                    ) {
                      input.indeterminate = true;
                    } else {
                      input.indeterminate = false;
                    }
                  }}
                  onChange={(e) => onSelectAll(e.target.checked)}
                />
              </div>
            </th>
            <th scope="col">Name</th>
            {computers.map((column) => (
              <th key={column.id()} scope="col">
                <span
                  className="material-symbols-outlined"
                  onClick={(e) => deleteColumn(column.id())}
                  style={{ cursor: "pointer" }}
                >
                  delete
                </span>
                <br />
                {column.header()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredApplicants.map((applicant) => (
            <tr key={applicant.user.id}>
              <td>
                <div className="form-check">
                  <input
                    className="form-check-input person-selector"
                    type="checkbox"
                    checked={selectedIds.includes(applicant.user.id)}
                    onChange={(e) =>
                      onSelectPerson(e.target.checked, applicant)
                    }
                  />
                </div>
              </td>
              <td>
                {applicant.user.name}&nbsp;
                {applicant.user.wcaId ? (
                  <>
                    (
                    <Link to={"https://wca.link/" + applicant.user.wcaId}>
                      {applicant.user.wcaId}
                    </Link>
                    )
                  </>
                ) : null}
              </td>
              {computers.map((column) => (
                <td key={applicant.user.id + "-" + column.id()}>
                  {column.compute(applicant).render()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
