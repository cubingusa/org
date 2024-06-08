import { createRoot } from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
  Route,
  useParams,
} from "react-router-dom";

function StaffApplication() {
  const { competitionId } = useParams();
  return <div>{competitionId}</div>;
}

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route path="staff">
      <Route path=":competitionId" element={<StaffApplication />}></Route>
    </Route>,
  ),
);

createRoot(document.getElementById("jsx-container")).render(
  <RouterProvider router={router} />,
);
