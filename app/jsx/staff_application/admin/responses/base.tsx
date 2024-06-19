import { useState } from "react";
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
import { ApplicantData } from "../../types/applicant_data";
import { CompetitionData } from "../../types/competition_data";

export interface TableConfig {
  filters: TableFilter[];
  columns: TableColumn[];
}

export function EncodedSettingsLoader({ params }: any): TableConfig {
  try {
    let parsedSettings = TableSettings.decode(
      Uint8Array.from(atob(params.encodedSettings), (c) => c.charCodeAt(0)),
    );
    return {
      filters: parsedSettings.filters.map(decodeFilter),
      columns: parsedSettings.columns.map(decodeColumn),
    };
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
  const applicants = useRouteLoaderData("responses") as ApplicantData[];
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const baseConfig = useRouteLoaderData("responses_settings") as TableConfig;
  const [config, setConfig] = useState(
    baseConfig || { filters: [], columns: [] },
  );

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
    config.columns.push(decodeColumn(params));
    updateConfig(config);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-success"
        data-bs-toggle="modal"
        data-bs-target="#column-modal"
      >
        <span className="material-symbols-outlined">add</span> Add Column
      </button>
      <ColumnModal id="column-modal" addColumn={addColumn} />
      <div className="modal fade" id="column-modal">
        <div className="modal-dialog">
          <div className="modal-content"></div>
        </div>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Name</th>
            {config.columns.map((column) => (
              <th key={column.id()} scope="col">
                {column.name()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applicants
            .filter((applicant) => {
              for (const filter of config.filters) {
                if (!filterPasses(filter, applicant)) {
                  return false;
                }
              }
              return true;
            })
            .map((applicant) => (
              <tr key={applicant.user.id}>
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
                  <td key={applicant.user.id + "-" + column.id()}></td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}
