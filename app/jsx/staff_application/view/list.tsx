import { useRouteLoaderData, Link } from "react-router-dom";

import { ViewMetadata } from "./types";
import { CompetitionData } from "../types/competition_data";
import { createFilter } from "../filter/create_filter";

export function ViewList() {
  const { views, user, settings, wcif, forms } = useRouteLoaderData(
    "competition",
  ) as CompetitionData;
  const visibleViews = views.filter((view) => {
    for (const filterParams of view.visibleTo) {
      const filter = createFilter(filterParams, settings, wcif);
      if (!filter.apply({ user, forms, reviews: [] })) {
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
          <Link to={`/staff/${wcif.id}/view/${view.id}`} key={idx}>
            <li className="list-group-item">{view.title}</li>
          </Link>
        ))}
      </ul>
    </>
  );
}
