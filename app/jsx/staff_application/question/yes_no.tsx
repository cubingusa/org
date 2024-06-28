import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { QuestionType, YesNoQuestion } from "./types";
import { TraitType } from "../trait/serialized";

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
}

function YesNoQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as YesNoQuestion;

  const updateAnswer = function (newAnswer: boolean) {
    props.myQuestion.booleanAnswer = newAnswer;
    props.onAnswerChange(props.myQuestion);
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
            defaultChecked={props.myQuestion.booleanAnswer === true}
            onClick={(e) => updateAnswer(true)}
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
            defaultChecked={props.myQuestion.booleanAnswer === false}
            onClick={(e) => updateAnswer(false)}
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
