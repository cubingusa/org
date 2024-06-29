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
        element: <MailerEditor />,
      },
      {
        path: "template/:templateId",
        element: <MailerEditor />,
      },
    ],
  };
}
