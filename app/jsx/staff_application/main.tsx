import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  useRouteLoaderData,
} from "react-router-dom";

import { AdminRoutes } from "./admin/routes";
import { ViewRoutes } from "./view/routes";
import { Application } from "./application";
import { CompetitionDataLoader } from "./data_loader";
import { CompetitionData } from "./types/competition_data";

const router = createBrowserRouter([
  {
    path: "staff",
    children: [
      {
        path: ":competitionId",
        loader: CompetitionDataLoader,
        id: "competition",
        children: [
          {
            index: true,
            element: <Application />,
            id: "application",
          },
          AdminRoutes(),
          ViewRoutes(),
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("jsx-container")).render(
  <RouterProvider router={router} />,
);
