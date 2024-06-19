import {
  Link,
  Routes,
  Route,
  useRouteLoaderData,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";
import classNames from "classnames";
import { CompetitionData } from "../types/competition_data";

export function AdminHeader() {
  const location = useLocation();
  const { user, wcif } = useRouteLoaderData("competition") as CompetitionData;
  const { pathname } = location;
  if (user !== null && user.isAdmin) {
    return (
      <>
        <h1>{wcif.name} Staff Admin</h1>
        <ul className="list-group">
          <Link to="..">
            <li className={classNames("list-group-item")}>
              <span className="material-symbols-outlined">visibility</span>{" "}
              Public Application
            </li>
          </Link>
          <Link to=".">
            <li
              className={classNames("list-group-item", {
                active: pathname.endsWith("/admin"),
              })}
            >
              <span className="material-symbols-outlined">edit</span> Edit
              Application
            </li>
          </Link>
          <Link to="responses">
            <li
              className={classNames("list-group-item", {
                active: pathname.includes("/admin/responses"),
              })}
            >
              <span className="material-symbols-outlined">groups</span>{" "}
              Responses
            </li>
          </Link>
        </ul>
        <p />
        <Outlet />
      </>
    );
    return <Outlet />;
  } else {
    return <Navigate to=".." />;
  }
}
