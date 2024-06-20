import { useState, useEffect } from "react";
import {
  useRouteLoaderData,
  Link,
  useParams,
  useLocation,
  useNavigate,
  redirect,
} from "react-router-dom";
import { util } from "protobufjs";

import { TableFilter, filterPasses, decodeFilter } from "./filter";
import { ColumnParams, TableSettings } from "./api.proto";
import { TableColumn, decodeColumn } from "./column";
import { ColumnModal } from "./column_modal";
import { EditPropertiesModal } from "./edit_properties_modal";
import { ApplicantData } from "../../types/applicant_data";
import { CompetitionData } from "../../types/competition_data";

export interface TableConfig {
  filters: TableFilter[];
  columns: TableColumn[];
}

export function EncodedSettingsLoader({ params }: any): TableSettings {
  try {
    return TableSettings.decode(
      Uint8Array.from(atob(params.encodedSettings), (c) => c.charCodeAt(0)),
    );
  } catch (e) {
    throw redirect("..");
  }
}

function encodeConfig(config: TableConfig): string {
  let buffer = TableSettings.encode(
    TableSettings.fromObject({
      filters: config.filters.map((filter) => filter.params),
      columns: config.columns.map((column) => column.params),
    }),
  ).finish();
  return util.base64.encode(buffer, 0, buffer.length);
}

export function Responses() {
  const { encodedSettings } = useParams();
  const { wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const applicants = useRouteLoaderData("responses") as ApplicantData[];
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tableSettings =
    (useRouteLoaderData("responses_settings") as TableSettings) ||
    TableSettings.fromObject({});
  const [config, setConfig] = useState({
    filters: tableSettings.filters.map(decodeFilter),
    columns: tableSettings.columns.map((c) => decodeColumn(c, settings, wcif)),
  });
  const [selectedIds, setSelectedIds] = useState([] as Number[]);

  const updateConfig = function (newConfig: TableConfig) {
    setConfig(newConfig);
    navigate(
      pathname.replace(
        /\/responses.*/i,
        `/responses/${encodeConfig(newConfig)}`,
      ),
    );
  };

  const addColumn = function (params: ColumnParams) {
    const newColumn = decodeColumn(params, settings, wcif);
    if (config.columns.map((c) => c.id()).includes(newColumn.id())) {
      return;
    }
    config.columns.push(newColumn);
    updateConfig(config);
  };

  const filteredApplicants = applicants.filter((applicant) => {
    for (const filter of config.filters) {
      if (!filterPasses(filter, applicant)) {
        return false;
      }
    }
    return true;
  });

  const deleteColumn = function (columnId: string) {
    config.columns = config.columns.filter((c) => c.id() !== columnId);
    updateConfig(config);
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
            {config.columns.map((column) => (
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
              {config.columns.map((column) => (
                <td key={applicant.user.id + "-" + column.id()}>
                  {column.render(applicant)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
