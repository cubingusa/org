import { useState } from "react";
import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import {
  Question,
  QuestionType,
  MultipleChoiceQuestion,
  QuestionBase,
} from "./types";
import { TraitType } from "../trait/serialized";
import { EnumExtras } from "../trait/extras";

export class MultipleChoiceQuestionApi extends QuestionApi {
  type(): QuestionType {
    return QuestionType.MultipleChoice;
  }

  questionTypeName(): string {
    return "Multiple Choice";
  }

  getTraitType(): TraitType {
    return TraitType.NumberEnumTrait;
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return <MultipleChoiceQuestionEditor question={props.question} />;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return (
      <MultipleChoiceQuestionDisplay
        question={props.question}
        myQuestion={props.myQuestion}
        onAnswerChange={props.onAnswerChange}
      />
    );
  }

  getTraitExtraData(question: Question): EnumExtras<number> {
    const map = new Map<number, string>();
    (question as MultipleChoiceQuestion).options.forEach((o) =>
      map.set(o.id, o.value),
    );
    return {
      allValues: map,
    };
  }

  defaultParams(base: QuestionBase): MultipleChoiceQuestion {
    return Object.assign(base as MultipleChoiceQuestion, {
      questionType: QuestionType.MultipleChoice,
      nextOptionId: 0,
      options: [],
    });
  }
}

function MultipleChoiceQuestionDisplay(props: QuestionDisplayProps) {
  let question = props.question as MultipleChoiceQuestion;

  const updateAnswer = function (newAnswer: number) {
    if (newAnswer == -1) {
      delete props.myQuestion.numberAnswer;
    } else {
      props.myQuestion.numberAnswer = newAnswer;
    }
    props.onAnswerChange(props.myQuestion);
  };

  return (
    <div className="mb-3">
      <label
        htmlFor={"multiple-choice-input-" + question.id}
        className="form-label"
      >
        {question.name}
      </label>
      <select
        defaultValue={props.myQuestion.textAnswer}
        id={"multiple-choice-input-" + question.id}
        className="form-select"
        onChange={(e) => updateAnswer(+e.target.value)}
      >
        <option value={-1}></option>
        {question.options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.value}
          </option>
        ))}
      </select>
    </div>
  );
}

function MultipleChoiceQuestionEditor(props: QuestionEditorProps) {
  const question = props.question as MultipleChoiceQuestion;

  const [optionCount, setOptionCount] = useState(question.options.length);

  const addOption = function (e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    question.options.push({
      id: question.nextOptionId,
      value: "",
    });
    question.nextOptionId++;
    setOptionCount(question.options.length);
  };

  const deleteOption = function (optionId: number) {
    question.options = question.options.filter((o) => o.id !== optionId);
    setOptionCount(question.options.length);
  };

  return (
    <>
      <ul className="list-group">
        {question.options.map((option) => (
          <li className="list-group-item" key={option.id}>
            <div className="row">
              <div className="col-8 my-auto">
                <input
                  type="text"
                  className="form-control"
                  defaultValue={option.value}
                  onChange={(e) => (option.value = e.target.value)}
                />
              </div>
              <div className="col-4">
                <div className="float-end">
                  <button
                    className="btn btn-danger mb-3"
                    onClick={(e) => deleteOption(option.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button className="btn btn-primary mb-3" onClick={(e) => addOption(e)}>
        Add Option
      </button>
    </>
  );
}
