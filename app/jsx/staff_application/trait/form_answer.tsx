import { ApplicantData } from "../types/applicant_data";
import { ApplicationSettings } from "../types/competition_data";
import { Question, QuestionType } from "../types/form";
import { Trait, TraitComputer } from "./api";
import { FormAnswerParams } from "./params";
import { StringTrait, BooleanTrait, NullTrait } from "./traits";

class FormAnswerComputer extends TraitComputer {
  constructor(
    private params: FormAnswerParams,
    private settings: ApplicationSettings,
  ) {
    super(params);
  }

  getQuestion(): Question | null {
    return this.settings.forms
      .find((f) => f.id == this.params.formId)
      ?.questions?.find((q) => q.id == this.params.questionId);
  }

  compute(applicant: ApplicantData): Trait {
    const question = this.getQuestion();
    if (question === null) {
      return new NullTrait({});
    }
    const myQuestion = applicant.forms
      .find((f) => f.formId == this.params.formId)
      ?.details?.questions?.find((q) => q.questionId == this.params.questionId);
    if (myQuestion === null) {
      return new NullTrait({});
    }
    switch (question.questionType) {
      case QuestionType.Null:
        return new NullTrait({});
      case QuestionType.Text:
        return new StringTrait({ val: myQuestion.textAnswer });
      case QuestionType.YesNo:
        return new BooleanTrait({ val: myQuestion.booleanAnswer });
      case QuestionType.MultipleChoice:
        // TODO: switch to EnumTrait.
        if (question.options.has(myQuestion.numberAnswer)) {
          return new StringTrait({
            val: question.options.get(myQuestion.numberAnswer),
          });
        } else {
          return new NullTrait({});
        }
    }
  }

  id(): string {
    return `FAC-${this.params.formId}-${this.params.questionId}`;
  }

  header(): JSX.Element {
    const question = this.getQuestion();
    return <>{question.name}</>;
  }
}
