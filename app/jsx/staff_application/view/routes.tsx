import { ViewLoader } from "./loader";

import { ApplicantLoader } from "../admin/applicant_loader";
import { AdminTable } from "./admin_table";
import { PublicTable } from "./public_table";

export function ViewRoutes() {
  return {
    path: "view",
    loader: ApplicantLoader,
    id: "applicants",
    children: [
      {
        path: "admin",
        // TODO: make a new page admin view homepage.
        element: <AdminTable />,
      },
      {
        path: ":viewId",
        loader: ViewLoader,
        id: "view",
        children: [
          {
            index: true,
            element: <PublicTable />,
          },
          {
            path: "admin",
            element: <AdminTable />,
            loader: ApplicantLoader,
            id: "admin",
          },
        ],
      },
    ],
  };
}