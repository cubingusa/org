import { useState } from "react";
import { useRouteLoaderData, Link } from "react-router-dom";
import { util } from "protobufjs";

import { ColumnModal } from "./column_modal";
import { EditPropertiesModal } from "./edit_properties_modal";
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

  const addColumn = function (trait: ComputerParams) {
    const newComputer = createComputer(trait, settings, wcif);
    if (computers.map((c) => c.id()).includes(newComputer.id())) {
      return;
    }
    setComputers([...computers, newComputer]);
  };

  const filteredApplicants = applicants.filter((applicant) => {
    return true;
  });

  const deleteColumn = function (columnId: string) {
    setComputers(computers.filter((c) => c.id() !== columnId));
  };

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
      &nbsp;
      <EditPropertiesModal id="properties-modal" personIds={selectedIds} />
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
