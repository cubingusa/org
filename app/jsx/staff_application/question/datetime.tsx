import { useState, useEffect } from "react";
import { useRouteLoaderData } from "react-router-dom";
import { DateTime } from "luxon";

import { QuestionApi, QuestionDisplayProps, QuestionEditorProps } from "./api";
import {
  QuestionType,
  DateTimeQuestion,
  QuestionBase,
  Question,
} from "./types";
import { DateTimeExtras } from "../trait/extras";
import { DateTimeTrait } from "../trait/traits";
import { TraitType } from "../trait/serialized";
import { CompetitionData } from "../types/competition_data";
import { SubmittedQuestion } from "../types/personal_application_data";

export class DateTimeQuestionApi extends QuestionApi {
  type(): QuestionType {
    return QuestionType.DateTime;
  }

  questionTypeName(): string {
    return "Date and Time";
  }

  getTraitType(): TraitType {
    return TraitType.DateTimeTrait;
  }

  editor(props: QuestionEditorProps): JSX.Element {
    return <DateTimeQuestionEditor question={props.question} />;
  }

  form(props: QuestionDisplayProps): JSX.Element {
    return (
      <DateTimeQuestionDisplay
        question={props.question}
        myQuestion={props.myQuestion}
        onAnswerChange={props.onAnswerChange}
      />
    );
  }

  defaultParams(base: QuestionBase): DateTimeQuestion {
    return Object.assign(base as DateTimeQuestion, {
      questionType: QuestionType.DateTime,
      userLocalTime: false,
      startTimeSeconds: DateTime.local().toSeconds(),
      endTimeSeconds: DateTime.local().toSeconds(),
    });
  }

  getTraitExtraData(question: Question): DateTimeExtras {
    return {
      timeZone: (question as DateTimeQuestion).userLocalTime
        ? null
        : this.wcif.schedule.venues[0].timezone,
    };
  }

  toTrait(question: Question, myQuestion: SubmittedQuestion): DateTimeTrait {
    return new DateTimeTrait({
      val: DateTime.fromSeconds(myQuestion.numberAnswer),
      extras: this.getTraitExtraData(question),
    });
  }
}

function DateTimeQuestionEditor(props: QuestionEditorProps) {
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  const question = props.question as DateTimeQuestion;
  const [userLocalTime, setUserLocalTime] = useState(
    question.userLocalTime || false,
  );
  const tz = userLocalTime
    ? DateTime.local().zoneName
    : wcif.schedule.venues[0].timezone;
  const [startTime, setStartTime] = useState(
    question.startTimeSeconds || DateTime.now().toSeconds(),
  );
  const [endTime, setEndTime] = useState(
    question.endTimeSeconds || DateTime.now().toSeconds(),
  );

  const updateUserLocalTime = function (newValue: boolean) {
    question.userLocalTime = newValue;
    setUserLocalTime(newValue);
  };

  const updateStartTime = function (newStart: string) {
    const ts = DateTime.fromISO(newStart, { zone: tz }).toSeconds();
    question.startTimeSeconds = ts;
    setStartTime(ts);
  };

  const updateEndTime = function (newEnd: string) {
    const ts = DateTime.fromISO(newEnd, { zone: tz }).toSeconds();
    question.endTimeSeconds = ts;
    setEndTime(ts);
  };

  return (
    <>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          id={`local-time-${question.id}`}
          checked={userLocalTime}
          onChange={(e) => updateUserLocalTime(true)}
        />
        <label
          className="form-check-label"
          htmlFor={`local-time-${question.id}`}
        >
          Local time
        </label>
      </div>
      <div className="form-check form-check-inline">
        <input
          className="form-check-input"
          type="radio"
          id={`com-time-${question.id}`}
          checked={!userLocalTime}
          onChange={(e) => updateUserLocalTime(false)}
        />
        <label
          className="form-check-label"
          htmlFor={`comp-time-${question.id}`}
        >
          Competition time ({wcif.schedule.venues[0].timezone})
        </label>
      </div>
      <div className="input-group mb-3">
        <span className="input-group-text">Earliest</span>
        <input
          type="datetime-local"
          className="form-control"
          value={DateTime.fromSeconds(question.startTimeSeconds || 0, {
            zone: tz,
          }).toFormat("yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => updateStartTime(e.target.value)}
        />
        <span className="input-group-text">Latest</span>
        <input
          type="datetime-local"
          className="form-control"
          value={DateTime.fromSeconds(question.endTimeSeconds || 0, {
            zone: tz,
          }).toFormat("yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => updateEndTime(e.target.value)}
        />
      </div>
    </>
  );
}

function DateTimeQuestionDisplay(props: QuestionDisplayProps) {
  const { wcif } = useRouteLoaderData("competition") as CompetitionData;
  let question = props.question as DateTimeQuestion;
  const tz = question.userLocalTime
    ? DateTime.local().zoneName
    : wcif.schedule.venues[0].timezone;
  if (props.myQuestion.numberAnswer < question.startTimeSeconds) {
    props.myQuestion.numberAnswer = question.startTimeSeconds;
    props.onAnswerChange(props.myQuestion);
  }

  const updateAnswer = function (newAnswer: string) {
    props.myQuestion.numberAnswer = DateTime.fromISO(newAnswer, {
      zone: tz,
    }).toSeconds();
    props.onAnswerChange(props.myQuestion);
  };

  return (
    <>
      <div className="mb-3">
        <label
          htmlFor={"date-time-input-" + question.id}
          className="form-label"
        >
          {question.name}
        </label>
        <input
          type="datetime-local"
          id={`date-time-input-${question.id}`}
          className="form-control"
          defaultValue={DateTime.fromSeconds(
            props.myQuestion.numberAnswer,
          ).toFormat("yyyy-MM-dd'T'HH:mm")}
          min={DateTime.fromSeconds(question.startTimeSeconds, {
            zone: tz,
          }).toFormat("yyyy-MM-dd'T'HH:mm")}
          max={DateTime.fromSeconds(question.endTimeSeconds, {
            zone: tz,
          }).toFormat("yyyy-MM-dd'T'HH:mm")}
          onChange={(e) => updateAnswer(e.target.value)}
        />
      </div>
    </>
  );
}
