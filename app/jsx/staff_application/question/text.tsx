import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { QuestionType, TextQuestion, TextQuestionType } from "./types";

export class TextQuestionApi implements QuestionApi {
  type(): QuestionType {
    return QuestionType.Text;
  }

  questionTypeName(): string {
    return "Text";
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return <TextQuestionEditor question={props.question} />;
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

function TextQuestionEditor(props: QuestionEditorProps) {
  const question = props.question as TextQuestion;
  const selectTextQuestionType = function (textQuestionType: TextQuestionType) {
    question.textQuestionType = textQuestionType;
  };

  return (
    <div>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          name={"question-" + question.id + "-length"}
          id={"question-" + question.id + "-short"}
          defaultChecked={question.textQuestionType == TextQuestionType.Short}
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
          defaultChecked={question.textQuestionType == TextQuestionType.Long}
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
}
