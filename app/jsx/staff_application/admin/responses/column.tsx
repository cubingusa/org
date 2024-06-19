export enum ColumnType {
  PERSONAL_ATTRIBUTE = "personal_attribute",
  FORM_ANSWER = "form_answer",
}

export enum PersonalAttribute {
  AGE = "age",
  DELEGATE_STATUS = "delegate_status",
}

interface PersonalAttributeParams {
  columnType: ColumnType.FORM_ANSWER;
  attribute: PersonalAttribute;
}

class PersonalAttributeColumn implements TableColumn {
  constructor(params: any) {
    this.params = Object.assign({
      columnType: ColumnType.FORM_ANSWER,
      attribute: PersonalAttribute.AGE,
    });
  }

  encode(): any {
    return this.params;
  }
  id(): string {
    return this.params.attribute;
  }
  name(): string {
    switch (this.params.attribute) {
      case PersonalAttribute.AGE:
        return "Age";
      case PersonalAttribute.DELEGATE_STATUS:
        return "Delegate";
    }
  }

  params: PersonalAttributeParams;
}

interface FormAnswerParams {
  columnType: ColumnType.FORM_ANSWER;
  formId: number;
  questionId: number;
}

class FormAnswerColumn implements TableColumn {
  constructor(params: any) {
    this.params = Object.assign(
      {
        columnType: ColumnType.FORM_ANSWER,
        formId: 0,
        questionId: 0,
      },
      params,
    );
  }

  encode(): any {
    return this.params;
  }
  id(): string {
    return this.params.formId + "-" + this.params.questionId;
  }
  name(): string {
    // TODO: Pass in form data.
    return this.params.formId + "-" + this.params.questionId;
  }

  params: FormAnswerParams;
}

export interface TableColumn {
  encode(): any;
  id(): string;
  name(): string;
}

export function decodeColumn(params: any): TableColumn | null {
  if (params.columnType === undefined) {
    return null;
  }
  switch (params.columnType) {
    case ColumnType.PERSONAL_ATTRIBUTE:
      return new PersonalAttributeColumn(params);
    case ColumnType.FORM_ANSWER:
      return new FormAnswerColumn(params);
  }
}

export type ColumnParams = PersonalAttributeParams | FormAnswerParams;
