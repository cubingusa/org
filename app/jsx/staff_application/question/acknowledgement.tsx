import { QuestionApi, QuestionDisplayProps } from "./api";
import { QuestionType, AcknowledgementQuestion } from "./types";

export class AcknowledgementQuestionApi implements QuestionApi {
  type(): QuestionType {
    return QuestionType.Acknowledgement;
  }

  questionTypeName(): string {
    return "Acknowledgement";
  }

  editor(): JSX.Element {
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
