import { QuestionApi, QuestionDisplayProps } from "./api";
import { QuestionType, TextQuestion, TextQuestionType } from "./types";

export class TextQuestionApi implements QuestionApi {
  type(): QuestionType {
    return QuestionType.Text;
  }

  questionTypeName(): string {
    return "Text";
  }

  editor(): JSX.Element {
    return null;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return (
      <TextQuestionDisplay
        question={props.question}
        myQuestion={props.myQuestion}
        onAnswerChange={props.onAnswerChange}
      />
    );
  }
}

function TextQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as TextQuestion;

  const updateAnswer = function (newAnswer: string) {
    props.myQuestion.textAnswer = newAnswer;
    props.onAnswerChange(props.myQuestion);
  };

  switch (question.textQuestionType) {
    case TextQuestionType.Long:
      return (
        <div className="mb-3">
          <label htmlFor={"text-input-" + question.id} className="form-label">
            {question.name}
          </label>
          <textarea
            defaultValue={props.myQuestion.textAnswer}
            id={"text-input-" + question.id}
            className="form-control"
            onChange={(e) => updateAnswer(e.target.value)}
          />
        </div>
      );
    case TextQuestionType.Short:
      return (
        <div className="mb-3">
          <label htmlFor={"text-input-" + question.id} className="form-label">
            {question.name}
          </label>
          <input
            type="text"
            defaultValue={props.myQuestion.textAnswer}
            id={"text-input-" + question.id}
            className="form-control"
            onChange={(e) => updateAnswer(e.target.value)}
          />
        </div>
      );
  }
}
