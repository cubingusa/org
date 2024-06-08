import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  useLoaderData,
  useParams,
} from "react-router-dom";
import { CompetitionDataLoader, CompetitionData } from './data_loader'

function StaffApplication() {
  const competition = useLoaderData();
  const { competitionId } = useParams();
  return <div>{ competition.wcif.name }</div>;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="staff">
      <Route path=":competitionId"
             loader={({ params }) => {
               return CompetitionDataLoader(params)
             }}
             element={<StaffApplication/>}></Route>
    </Route>,
  ),
);

createRoot(document.getElementById("jsx-container")).render(
  <RouterProvider router={router} />,
);
