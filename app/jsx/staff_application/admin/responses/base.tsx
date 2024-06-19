import { useState } from "react";
import {
  useRouteLoaderData,
  Link,
  useParams,
  useNavigate,
  redirect,
} from "react-router-dom";
import { TableFilter, filterPasses } from "./filter";
import { TableColumn } from "./column";
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
    let settings = defaultSettings();
    Object.assign(settings, JSON.parse(atob(params.encodedSettings)));
    return settings;
  } catch (e) {
    throw redirect("..");
  }
}

function encodeTableSettings(settings: TableSettings): string {
  return btoa(JSON.stringify(settings));
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

  return (
    <table className="table">
      <thead>
        <tr>
          <th scope="col">Name</th>
          {settings.columns.map((column) => (
            <th key={column.formId + "-" + column.questionId} scope="col">
              {column.name}
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
                <td
                  key={
                    applicant.user.id +
                    "-" +
                    column.formId +
                    "-" +
                    column.questionId
                  }
                ></td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
  );
}
