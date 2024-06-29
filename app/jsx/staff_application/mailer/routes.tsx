import { MailTemplateLoader } from "./loader";
import { MailerEditor } from "./editor";
import { MailerIndex } from "./index";

export function MailerRoutes() {
  return {
    path: "mailer",
    loader: MailTemplateLoader,
    id: "mailer",
    children: [
      {
        index: true,
        element: <MailerIndex />,
      },
      {
        path: "template/new",
        element: <MailerEditor mode="new" />,
      },
      {
        path: "template/:templateId",
        children: [
          {
            index: true,
            element: <MailerEditor mode="edit" />,
          },
          {
            path: "clone",
            element: <MailerEditor mode="clone" />,
          },
        ],
      },
    ],
  };
}
