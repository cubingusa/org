import { useState } from "react";
import {
  useRouteLoaderData,
  Link,
  useParams,
  useNavigate,
  redirect,
} from "react-router-dom";
import { TableFilter, filterPasses } from "./filter";
import { TableColumn, decodeColumn, ColumnParams } from "./column";
import { ColumnModal } from "./column_modal";
import { ApplicantData } from "../../types/applicant_data";
import { CompetitionData } from "../../types/competition_data";

interface TableSettings {
  filters: TableFilter[];
  columns: TableColumn[];
}

function defaultSettings(): TableSettings {
  return {
    filters: [],
    columns: [],
  };
}

export function EncodedSettingsLoader({ params }: any): TableSettings {
  try {
    let parsedSettings = JSON.parse(atob(params.encodedSettings));
    return {
      filters: parsedSettings.filters || [],
      columns: (parsedSettings.columns || []).map((column: any) =>
        decodeColumn(column),
      ),
    };
  } catch (e) {
    throw redirect("..");
  }
}

function encodeTableSettings(settings: TableSettings): string {
  return btoa(
    JSON.stringify({
      filters: settings.filters,
      columns: settings.columns.map((col) => col.encode()),
    }),
  );
}

export function Responses() {
  const { encodedSettings } = useParams();
  const applicants = useRouteLoaderData("responses") as ApplicantData[];
  const navigate = useNavigate();
  const baseSettings = useRouteLoaderData(
    "responses_settings",
  ) as TableSettings;
  const [settings, setSettings] = useState(baseSettings || defaultSettings());

  const updateSettings = function (newSettings: TableSettings) {
    setSettings(newSettings);
    navigate(`../{encodeTableSettings(newSettings)}`);
  };

  const addColumn = function (params: ColumnParams) {
    settings.columns.push(decodeColumn(params));
    updateSettings(settings);
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
            {settings.columns.map((column) => (
              <th key={column.id()} scope="col">
                {column.name()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {applicants
            .filter((applicant) => {
              for (const filter of settings.filters) {
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
                {settings.columns.map((column) => (
                  <td key={applicant.user.id + "-" + column.id()}></td>
                ))}
              </tr>
            ))}
        </tbody>
      </table>
    </>
  );
}