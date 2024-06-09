import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
} from "react-router-dom";

import { Admin } from "./admin";
import { Application } from "./application";
import { CompetitionDataLoader } from "./data_loader";
import { CompetitionData } from "./types/competition_data";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="staff">
      <Route
        path=":competitionId"
        loader={({ params }) => {
          return CompetitionDataLoader(params);
        }}
        id="competition"
      >
        <Route index element={<Application />} id="application"></Route>
        <Route path="admin" element={<Admin />}></Route>
      </Route>
    </Route>,
  ),
);

createRoot(document.getElementById("jsx-container")).render(
  <RouterProvider router={router} />,
);
