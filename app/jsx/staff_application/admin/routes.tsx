import {
  Routes,
  Route,
  useRouteLoaderData,
  redirect,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Admin } from "./admin";
import { Responses, EncodedSettingsLoader } from "./responses";
import { ApplicantLoader } from "./applicant_loader";
import { CompetitionData } from "../types/competition_data";

function AdminGuard() {
  const { user } = useRouteLoaderData("competition") as CompetitionData;
  if (user !== null && user.isAdmin) {
    return <Outlet />;
  } else {
    return <Navigate to=".." />;
  }
}

export function AdminRoutes() {
  return {
    path: "admin",
    loader: ApplicantLoader,
    element: <AdminGuard />,
    children: [
      {
        index: true,
        element: <Admin />,
      },
      {
        path: "responses",
        loader: ApplicantLoader,
        id: "responses",
        children: [
          {
            index: true,
            element: <Responses />,
          },
          {
            path: ":encodedSettings",
            element: <Responses />,
            loader: EncodedSettingsLoader,
            id: "responses_settings",
          },
        ],
      },
    ],
  };
}
