import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  useLoaderData,
  useParams,
} from "react-router-dom";

import { CompetitionDataLoader } from "./data_loader";
import { CompetitionData } from "./types/competition_data";

function StaffApplication() {
  const { wcif, user } = useLoaderData();
  const { competitionId } = useParams();
  let adminText;
  if (user.is_admin) {
    adminText = <div>You are an admin</div>;
  }
  return (
    <div>
      <div>{wcif.name}</div>
      {adminText}
    </div>
  );
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="staff">
      <Route
        path=":competitionId"
        loader={({ params }) => {
          return CompetitionDataLoader(params);
        }}
        element={<StaffApplication />}
      ></Route>
    </Route>,
  ),
);

createRoot(document.getElementById("jsx-container")).render(
  <RouterProvider router={router} />,
);
