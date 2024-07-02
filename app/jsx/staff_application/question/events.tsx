import { useState } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import { Question, QuestionType, EventsQuestion, QuestionBase } from "./types";
import { TraitType } from "../trait/serialized";
import { EventListTrait } from "../trait/types/event_list";
import { CompetitionData } from "../types/competition_data";
import { SubmittedQuestion } from "../types/personal_application_data";

export class EventsQuestionApi extends QuestionApi {
  type(): QuestionType {
    return QuestionType.Events;
  }

  questionTypeName(): string {
    return "Events";
  }

  getTraitType(): TraitType {
    return TraitType.EventListTrait;
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return <EventsQuestionEditor question={props.question} />;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return (
      <EventsQuestionDisplay
        question={props.question}
        myQuestion={props.myQuestion}
        onAnswerChange={props.onAnswerChange}
      />
    );
  }

  defaultParams(base: QuestionBase): EventsQuestion {
    return Object.assign(base as EventsQuestion, {
      questionType: QuestionType.Events,
      maxEvents: 1,
    });
  }

  toTrait(question: Question, myQuestion: SubmittedQuestion): EventListTrait {
    return new EventListTrait({ val: myQuestion.textListAnswer });
  }
}

function EventsQuestionDisplay(props: QuestionDisplayProps) {
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const [eventList, setEventList] = useState(
    props.myQuestion.textListAnswer || [],
  );
  let question = props.question as EventsQuestion;

  const toggleEvent = function (eventId: string) {
    if (props.myQuestion.textListAnswer == undefined) {
      props.myQuestion.textListAnswer = [];
    }
    if (props.myQuestion.textListAnswer.includes(eventId)) {
      props.myQuestion.textListAnswer = props.myQuestion.textListAnswer.filter(
        (e) => e != eventId,
      );
    } else {
      props.myQuestion.textListAnswer.push(eventId);
      while (props.myQuestion.textListAnswer.length > question.maxEvents) {
        props.myQuestion.textListAnswer.shift();
      }
    }
    props.onAnswerChange(props.myQuestion);
    setEventList([...props.myQuestion.textListAnswer]);
  };

  return (
    <div className="mb-3">
      <label
        htmlFor={"multiple-choice-input-" + question.id}
        className="form-label"
      >
        {question.name}
      </label>
      <div>
        {wcif.events.map((evt) => (
          <span
            key={evt.id}
            className={"cubing-icon event-" + evt.id}
            style={{
              fontSize: "32px",
              padding: "4px",
              cursor: "pointer",
              color: eventList.includes(evt.id.toString())
                ? "black"
                : "lightgray",
            }}
            onClick={(e) => toggleEvent(evt.id)}
          ></span>
        ))}
      </div>
    </div>
  );
}

function EventsQuestionEditor(props: QuestionEditorProps) {
  const question = props.question as EventsQuestion;

  return (
    <div>
      <label className="form-check-label" htmlFor={"question-" + question.id}>
        Max number of events
      </label>
      <div>
        <input
          className="form-control"
          type="number"
          id={"question-" + question.id}
          defaultValue={question.maxEvents}
          onChange={(e) => (question.maxEvents = +e.target.value)}
        />
      </div>
    </div>
  );
}
