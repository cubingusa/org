import { useRouteLoaderData, Navigate, Link } from "react-router-dom";

import { createFilter } from "../filter/create_filter";
import { createComputer } from "../trait/create_computer";
import { PersonalApplicationData } from "../types/personal_application_data";
import { CompetitionData } from "../types/competition_data";
import { SavedView } from "./types";
import { ViewTable } from "./table";

export function PublicTable() {
  const { user, wcif, settings } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const { forms } = useRouteLoaderData(
    "application",
  ) as PersonalApplicationData;
  if (!user.isAdmin) {
    return <Navigate to="../.." />;
  }
  const view: SavedView = useRouteLoaderData("view") as SavedView;
  if (!view) {
    return <Navigate to="../.." />;
  }
  for (const filterParams of view.filters) {
    const filter = createFilter(filterParams, settings, wcif);
    if (!filter.apply({ user, forms })) {
      return <Navigate to="../.." />;
    }
  }
  const computers = view.columns.map((column) =>
    createComputer(column, settings, wcif),
  );

  return (
    <>
      <h3>{view.title}</h3>( user.admin ? (
      <p>
        <Link to="./admin">
          <i>Edit this view</i>
        </Link>
      </p>
      ) : null )
      <ViewTable
        admin={false}
        computers={computers}
        rows={view.exportedRows}
        updateSelectedIds={null}
        deleteColumn={null}
      />
    </>
  );
}
