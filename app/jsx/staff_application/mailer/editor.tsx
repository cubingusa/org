import { useState, useRef } from "react";
import {
  useRouteLoaderData,
  Link,
  useParams,
  useNavigate,
  redirect,
} from "react-router-dom";
import EmailEditor, { EditorRef, EmailEditorProps } from "react-email-editor";

import { CompetitionData } from "../types/competition_data";
import { MailTemplate } from "./types";
import { AdminHeader } from "../admin/header";

interface MailerEditorParams {
  mode: "clone" | "edit" | "new";
}
export function MailerEditor({ mode }: MailerEditorParams) {
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const inTemplate = useRouteLoaderData("template") as MailTemplate;
  const { templateId, competitionId } = useParams();
  const [spinning, setSpinning] = useState(false);
  const navigate = useNavigate();
  let template: MailTemplate;
  let isNew = false;
  let hasDesign = false;
  switch (mode) {
    case "clone":
      template = structuredClone(inTemplate);
      if (template === undefined) {
        throw redirect(`/staff/${competitionId}/mailer`);
      }
      template.id = "";
      template.title = "New Email Template";
      isNew = true;
      hasDesign = true;
      break;
    case "edit":
      template = inTemplate;
      if (template === undefined) {
        throw redirect(`/staff/${competitionId}/mailer`);
      }
      hasDesign = true;
      break;
    case "new":
      isNew = true;
      template = {
        id: "",
        title: "New Email Template",
        subjectLine: `[${wcif.shortName}]`,
        design: {},
        html: "",
      };
  }
  const emailEditorRef = useRef<EditorRef>(null);
  const [submitDisabled, setSubmitDisabled] = useState(true);

  const setTitle = function (newTitle: string) {
    template.title = newTitle;
  };

  const setSubjectLine = function (newSubjectLine: string) {
    template.subjectLine = newSubjectLine;
  };

  const submit = async function () {
    event.preventDefault();
    setSpinning(true);
    const url = isNew
      ? `/staff_api/${competitionId}/template`
      : `/staff_api/${competitionId}/template/${templateId}`;
    const unlayer = emailEditorRef.current?.editor;
    unlayer?.exportHtml(async (data) => {
      const { design, html } = data;
      template.design = design;
      template.html = html;
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
    });
  };

  const onReady: EmailEditorProps["onReady"] = (unlayer) => {
    if (hasDesign) {
      unlayer.loadDesign(template.design);
    }
    setSubmitDisabled(false);
  };

  return (
    <>
      <AdminHeader />
      <h3>Email Template Editor</h3>
      <div className="mb-3">
        <label htmlFor="email-title" className="form-label">
          Email Name (only visible to admins)
        </label>
        <input
          type="text"
          className="form-control"
          id="email-title"
          defaultValue={template.title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="email-title" className="form-label">
          Subject Line
        </label>
        <input
          type="text"
          className="form-control"
          id="email-title"
          defaultValue={template.subjectLine}
          onChange={(e) => setSubjectLine(e.target.value)}
        />
      </div>
      <div>
        You can use &#123;&#123;applicant.name&#125;&#125; to print the name of
        the applicant.
      </div>
      <EmailEditor ref={emailEditorRef} onReady={onReady} />
      <button
        className="btn btn-primary mb-3"
        type="submit"
        disabled={submitDisabled}
        onClick={submit}
      >
        Save
      </button>
    </>
  );
}