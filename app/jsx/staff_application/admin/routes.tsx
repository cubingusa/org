import {
  Routes,
  Route,
  useRouteLoaderData,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Admin } from "./admin";
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
  return (
    <Routes>
      <Route path="" element={<AdminGuard />}>
        <Route index element={<Admin />}></Route>
      </Route>
    </Routes>
  );
}
