import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { QuestionType, AcknowledgementQuestion, QuestionBase } from "./types";
import { TraitType } from "../trait/serialized";

export class AcknowledgementQuestionApi extends QuestionApi {
  type(): QuestionType {
    return QuestionType.Acknowledgement;
  }

  questionTypeName(): string {
    return "Acknowledgement";
  }

  getTraitType(): TraitType {
    return TraitType.BooleanTrait;
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return null;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return (
      <AcknowledgementQuestionDisplay
        question={props.question}
        myQuestion={props.myQuestion}
        onAnswerChange={props.onAnswerChange}
      />
    );
  }

  defaultParams(base: QuestionBase): AcknowledgementQuestion {
    return Object.assign(base as AcknowledgementQuestion, {
      questionType: QuestionType.Acknowledgement,
    });
  }
}

function AcknowledgementQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as AcknowledgementQuestion;

  const updateAnswer = function (newAnswer: boolean) {
    props.myQuestion.booleanAnswer = newAnswer;
    props.onAnswerChange(props.myQuestion);
  };

  return (
    <div className="form-check form-check-inline">
      <input
        className="form-check-input"
        type="checkbox"
        id={"acknowledgement-input-" + question.id + "-yes"}
        defaultChecked={props.myQuestion.booleanAnswer === true}
        onChange={(e) => updateAnswer(e.target.checked)}
      />
      <label
        className="form-check-label"
        htmlFor={"yes-no-input-" + question.id + "-yes"}
      >
        {question.name}
      </label>
    </div>
  );
}
