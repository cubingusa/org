import {
  Link,
  Routes,
  Route,
  useRouteLoaderData,
  Navigate,
  useLocation,
  useParams,
} from "react-router-dom";
import classNames from "classnames";
import { CompetitionData } from "../types/competition_data";

export function AdminHeader() {
  const { user, wcif } = useRouteLoaderData("competition") as CompetitionData;
  const { competitionId } = useParams();
  const { pathname } = useLocation();
  if (user !== null && user.isAdmin) {
    const options = [
      {
        path: "",
        elt: (
          <>
            <span className="material-symbols-outlined">visibility</span> Public
            Application
          </>
        ),
      },
      {
        path: "/admin",
        elt: (
          <>
            <span className="material-symbols-outlined">edit</span> Edit
            Application
          </>
        ),
      },
      {
        path: "/view/admin",
        elt: (
          <>
            <span className="material-symbols-outlined">groups</span> Responses
          </>
        ),
      },
      {
        path: "/mailer",
        elt: (
          <>
            <span className="material-symbols-outlined">mail</span> Mailer
          </>
        ),
      },
      {
        path: "/reviews",
        elt: (
          <>
            <span className="material-symbols-outlined">reviews</span> Reviews
          </>
        ),
      },
    ];
    return (
      <>
        <h1>{wcif.name} Staff Admin</h1>
        <ul className="list-group">
          {options.map((option) => (
            <Link
              to={`/staff/${competitionId}${option.path}`}
              key={option.path}
            >
              <li
                className={classNames("list-group-item", {
                  active: pathname === `/staff/${competitionId}${option.path}`,
                })}
              >
                {option.elt}
              </li>
            </Link>
          ))}
        </ul>
        <p />
      </>
    );
  } else {
    return <Navigate to=".." />;
  }
}
