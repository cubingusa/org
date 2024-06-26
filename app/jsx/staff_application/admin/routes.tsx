import { Admin } from "./admin";

export function AdminRoutes() {
  return {
    path: "admin",
    children: [
      {
        index: true,
        element: <Admin />,
      },
    ],
  };
}
