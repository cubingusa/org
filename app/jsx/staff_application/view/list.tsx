import { useRouteLoaderData } from "react-router-dom";

import { ViewMetadata } from "./types";
import { CompetitionData } from "../types/competition_data";
import { PersonalApplicationData } from "../types/personal_application_data";
import { createFilter } from "../filter/create_filter";

export function ViewList() {
  const { views, user, settings, wcif } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const { forms } = useRouteLoaderData(
    "application",
  ) as PersonalApplicationData;
  const visibleViews = views.filter((view) => {
    for (const filterParams of view.visibleTo) {
      const filter = createFilter(filterParams, settings, wcif);
      if (!filter.apply({ user, forms })) {
        return false;
      }
    }
    return true;
  });
  if (!visibleViews.length) {
    return null;
  }
  return (
    <>
      <h3>Staff List{visibleViews.length > 1 ? "s" : ""}</h3>
      <ul className="list-group">
        {visibleViews.map((view, idx) => (
          <li className="list-group-item" key={idx}>
            {view.title}
            {user.isAdmin ? (
              <span className="material-symbols-outlined">edit</span>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}
