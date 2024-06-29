import { useState } from "react";
import {
  useRouteLoaderData,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";

import { CompetitionData } from "../types/competition_data";
import { MailerData, MailTemplate } from "./types";
import { AdminHeader } from "../admin/header";

export function MailerEditor() {
  const { templates } = useRouteLoaderData("mailer") as MailerData;
  const { templateId, competitionId } = useParams();
  const [spinning, setSpinning] = useState(false);
  let template = templates.find((t) => t.id == templateId);
  const isNew = template === undefined;
  const navigate = useNavigate();

  if (isNew) {
    template = {
      id: "",
      title: "New Email Template",
    };
  }

  const setTitle = function (newTitle: string) {
    template.title = newTitle;
  };

  const submit = async function () {
    event.preventDefault();
    setSpinning(true);
    const url = isNew
      ? `/staff_api/${competitionId}/template`
      : `/staff_api/${competitionId}/template/${templateId}`;
    const response = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(template),
    });
    setSpinning(false);
    if (response.status == 200) {
      const body = (await response.json()) as MailTemplate;
      window.location.replace(
        `/staff/${competitionId}/mailer/template/${body.id}`,
      );
    }
  };

  return (
    <>
      <AdminHeader />
      <h3>Email Template Editor</h3>
      <div className="mb-3">
        <label htmlFor="email-title" className="form-label">
          Email Title
        </label>
        <input
          type="text"
          className="form-control"
          id="email-title"
          defaultValue={template.title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <button className="btn btn-primary mb-3" type="submit" onClick={submit}>
        Save
      </button>
    </>
  );
}
