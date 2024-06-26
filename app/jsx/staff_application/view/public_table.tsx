import { useRouteLoaderData, Navigate, Link } from "react-router-dom";

import { createFilter } from "../filter/create_filter";
import { createComputer } from "../trait/create_computer";
import { CompetitionData } from "../types/competition_data";
import { SavedView } from "./types";
import { ViewTable } from "./table";

export function PublicTable() {
  const { user, wcif, settings, forms } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
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
      <h3>{view.title}</h3>
      {user.isAdmin ? (
        <div className="alert alert-primary">
          You are logged in as an admin.{" "}
          <Link to="./admin" relative="path">
            Edit or snapshot this view.
          </Link>
        </div>
      ) : null}
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
