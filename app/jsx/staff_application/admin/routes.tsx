import { Routes, Route } from "react-router-dom";
import { Admin, AdminGuard } from "./admin";

export function AdminRoutes() {
  return (
    <Routes>
      <Route path="" element={<AdminGuard />}>
        <Route index element={<Admin />}></Route>
      </Route>
    </Routes>
  );
}
