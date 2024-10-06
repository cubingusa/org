import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { Question, QuestionType, NumberQuestion, QuestionBase } from "./types";
import { NumberTrait } from "../trait/types/number";
import { TraitType } from "../trait/serialized";
import { SubmittedQuestion } from "../types/personal_application_data";

export class NumberQuestionApi extends QuestionApi {
  type(): QuestionType {
    return QuestionType.Number;
  }

  questionTypeName(): string {
    return "Number";
  }

  getTraitType(): TraitType {
    return TraitType.NumberTrait;
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return <NumberQuestionEditor question={props.question} />;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return (
      <NumberQuestionDisplay
        question={props.question}
        myQuestion={props.myQuestion}
        onAnswerChange={props.onAnswerChange}
      />
    );
  }

  defaultParams(base: QuestionBase): NumberQuestion {
    return Object.assign(base as NumberQuestion, {
      questionType: QuestionType.Number,
      minValue: 0,
      maxValue: 100,
    });
  }

  toTrait(question: Question, myQuestion: SubmittedQuestion): NumberTrait {
    return new NumberTrait({ val: myQuestion.numberAnswer });
  }
}

function NumberQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as NumberQuestion;

  const updateAnswer = function (newAnswer: number) {
    props.myQuestion.numberAnswer = newAnswer;
    props.onAnswerChange(props.myQuestion);
  };

  return (
    <div className="mb-3">
      <label htmlFor={"number-input-" + question.id} className="form-label">
        {question.name}
      </label>
      <input
        type="number"
        className="form-control"
        defaultValue={props.myQuestion.numberAnswer}
        min={question.minValue}
        max={question.maxValue}
        onChange={(e) => updateAnswer(+e.target.value)}
      />
    </div>
  );
}

function NumberQuestionEditor(props: QuestionEditorProps) {
  const question = props.question as NumberQuestion;

  return (
    <div>
      <div className="form-check form-check-inline">
        <label
          className="form-check-label"
          htmlFor={"question-" + question.id + "-min"}
        >
          Minimum
        </label>
        <input
          className="form-control"
          type="number"
          defaultValue={question.minValue}
          max={question.maxValue}
          name={"question-" + question.id + "-min"}
          id={"question-" + question.id + "-min"}
          onChange={(e) => (question.minValue = +e.target.value)}
        />
      </div>
      <div className="form-check form-check-inline">
        <label
          className="form-check-label"
          htmlFor={"question-" + question.id + "-max"}
        >
          Maximum
        </label>
        <input
          className="form-control"
          type="number"
          defaultValue={question.maxValue}
          min={question.minValue}
          name={"question-" + question.id + "-max"}
          id={"question-" + question.id + "-max"}
          onChange={(e) => (question.maxValue = +e.target.value)}
        />
      </div>
    </div>
  );
}
