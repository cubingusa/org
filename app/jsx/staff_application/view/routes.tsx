import { ViewLoader } from "./loader";

import { AdminTable } from "./admin_table";
import { AdminBase } from "./admin_base";
import { PublicTable } from "./public_table";
import { AdminViewLoader } from "./loader";

export function ViewRoutes() {
  return {
    path: "view",
    children: [
      {
        path: "admin",
        id: "admin",
        loader: AdminViewLoader,
        children: [
          {
            index: true,
            element: <AdminBase />,
          },
          {
            path: "new",
            element: <AdminTable adminRouterId="admin" />,
          },
        ],
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
            element: <AdminTable adminRouterId="view_admin" />,
            loader: AdminViewLoader,
            id: "view_admin",
          },
        ],
      },
    ],
  };
}
