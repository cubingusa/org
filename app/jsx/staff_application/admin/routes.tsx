import { Admin } from "./admin";
import { AdminHeader } from "./header";
import { Responses } from "./responses/base";
import { ApplicantLoader } from "./applicant_loader";
import { CompetitionData } from "../types/competition_data";

export function AdminRoutes() {
  return {
    path: "admin",
    loader: ApplicantLoader,
    element: <AdminHeader />,
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
        ],
      },
    ],
  };
}
