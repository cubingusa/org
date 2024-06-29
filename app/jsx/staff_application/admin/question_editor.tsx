import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { Form } from "../types/form";
import {
  Question,
  QuestionType,
  TextQuestion,
  TextQuestionType,
} from "../question/types";
import { CompetitionData } from "../types/competition_data";
import { getApi, allQuestionApis } from "../question/questions";

interface QuestionEditorProps {
  question: Question;
  deleteQuestion: (question: Question) => void;
}

export function QuestionEditor(props: QuestionEditorProps) {
  const question = props.question;
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const [questionType, setQuestionType] = useState(question.questionType || "");

  const updateQuestionType = function (newType: QuestionType) {
    Object.assign(
      question,
      getApi(newType, wcif).defaultParams({
        id: question.id,
        name: question.name,
        required: question.required,
      }),
    );
    setQuestionType(newType);
  };

  const header = (
    <div className="row">
      <div className="col">
        <input
          type="text"
          className="form-control"
          placeholder="Question Text"
          defaultValue={question.name}
          onChange={(e) => (question.name = e.target.value)}
        />
      </div>
      <div className="col">
        <div className="form-check form-switch">
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id={"required-" + question.id}
            defaultChecked={question.required}
            onChange={(e) => (question.required = e.target.checked)}
          />
          <label
            className="form-check-label"
            htmlFor={"required-" + question.id}
          >
            Required
          </label>
        </div>
      </div>
      <div className="col">
        <select
          className="form-select"
          value={questionType}
          onChange={(e) => updateQuestionType(e.target.value as QuestionType)}
        >
          {allQuestionApis(wcif).map((api) => {
            return (
              <option value={api.type()} key={api.type()}>
                {api.questionTypeName()}
              </option>
            );
          })}
        </select>
      </div>
      <div className="col">
        <button
          type="button"
          className="btn btn-danger"
          onClick={(e) => props.deleteQuestion(question)}
        >
          <span className="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  );
  const questionApi = getApi(question.questionType, wcif);
  const questionDetails = questionApi?.editor({ question: question });
  return (
    <>
      {header}
      {questionDetails == null ? null : <br />}
      {questionDetails}
    </>
  );
}
