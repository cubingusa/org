import { MailTemplateLoader } from "./loader";
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
    ],
  };
}
