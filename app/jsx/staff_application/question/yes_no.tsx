import { useState } from "react";
import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { Question, QuestionType, YesNoQuestion, QuestionBase } from "./types";
import { BooleanTrait } from "../trait/traits";
import { TraitType } from "../trait/serialized";
import { SubmittedQuestion } from "../types/personal_application_data";

export class YesNoQuestionApi extends QuestionApi {
  type(): QuestionType {
    return QuestionType.YesNo;
  }

  questionTypeName(): string {
    return "Yes / No";
  }

  getTraitType(): TraitType {
    return TraitType.BooleanTrait;
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return null;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return (
      <YesNoQuestionDisplay
        question={props.question}
        myQuestion={props.myQuestion}
        onAnswerChange={props.onAnswerChange}
      />
    );
  }

  defaultParams(base: QuestionBase): YesNoQuestion {
    return Object.assign(base as YesNoQuestion, {
      questionType: QuestionType.YesNo,
    });
  }

  toTrait(question: Question, myQuestion: SubmittedQuestion): BooleanTrait {
    return new BooleanTrait({ val: myQuestion.booleanAnswer });
  }
}

function YesNoQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as YesNoQuestion;
  const [answer, setAnswer] = useState(props.myQuestion.booleanAnswer);

  const updateAnswer = function (newAnswer: boolean) {
    props.myQuestion.booleanAnswer = newAnswer;
    props.onAnswerChange(props.myQuestion);
    setAnswer(newAnswer);
  };

  return (
    <>
      <div className="mb-3">
        <label htmlFor={"yes-no-input-" + question.id} className="form-label">
          {question.name}
        </label>
      </div>
      <div className="mb-3">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            id={"yes-no-input-" + question.id + "-yes"}
            checked={answer === true}
            onChange={(e) => updateAnswer(true)}
          />
          <label
            className="form-check-label"
            htmlFor={"yes-no-input-" + question.id + "-yes"}
          >
            Yes
          </label>
        </div>
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="radio"
            id={"yes-no-input-" + question.id + "-no"}
            checked={answer === false}
            onChange={(e) => updateAnswer(false)}
          />
          <label
            className="form-check-label"
            htmlFor={"yes-no-input-" + question.id + "-no"}
          >
            No
          </label>
        </div>
      </div>
    </>
  );
}
