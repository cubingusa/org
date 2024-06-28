import { useState } from "react";
import { Form } from "../types/form";
import {
  Question,
  QuestionType,
  TextQuestion,
  TextQuestionType,
} from "../question/types";
import { allQuestionApis } from "../question/questions";

interface QuestionEditorProps {
  question: Question;
  deleteQuestion: Function;
}

export function QuestionEditor(props: QuestionEditorProps) {
  const question = props.question;
  const [questionType, setQuestionType] = useState(question.questionType || "");

  const updateQuestionType = function (newType: string) {
    switch (newType) {
      case QuestionType.Null:
      case QuestionType.Text:
      case QuestionType.YesNo:
      case QuestionType.Acknowledgement:
        Object.assign(question, { questionType: newType });
        break;
    }
    setQuestionType(newType);
  };

  const selectTextQuestionType = function (textQuestionType: TextQuestionType) {
    (question as TextQuestion).textQuestionType = textQuestionType;
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
          onChange={(e) => updateQuestionType(e.target.value)}
        >
          {allQuestionApis().map((api) => {
            return (
              <option value={api.type()} key={api.type()}>
                {api.questionTypeName()}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
  let questionDetails;
  switch (question.questionType) {
    case QuestionType.Text:
      questionDetails = (
        <div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name={"question-" + question.id + "-length"}
              id={"question-" + question.id + "-short"}
              defaultChecked={
                question.textQuestionType == TextQuestionType.Short
              }
              onChange={(e) => selectTextQuestionType(TextQuestionType.Short)}
            />
            <label
              className="form-check-label"
              htmlFor={"question-" + question.id + "-short"}
            >
              Short Answer
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              name={"question-" + question.id + "-length"}
              id={"question-" + question.id + "-long"}
              defaultChecked={
                question.textQuestionType == TextQuestionType.Long
              }
              onChange={(e) => selectTextQuestionType(TextQuestionType.Long)}
            />
            <label
              className="form-check-label"
              htmlFor={"question-" + question.id + "-long"}
            >
              Long Answer
            </label>
          </div>
        </div>
      );
      break;
  }
  return (
    <>
      {header}
      {questionDetails}
    </>
  );
}
