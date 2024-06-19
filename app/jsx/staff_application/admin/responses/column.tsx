import { PersonalAttribute, ColumnType, ColumnParams } from "./api.proto";

export abstract class TableColumn {
  constructor(public params: ColumnParams) {}
  encode(): Uint8Array {
    return ColumnParams.encode(this.params).finish();
  }
  abstract id(): string;
  abstract name(): string;
}

class PersonalAttributeColumn extends TableColumn {
  id(): string {
    return `PA-${this.params.attribute.toString()}`;
  }
  name(): string {
    switch (this.params.attribute) {
      case PersonalAttribute.AGE:
        return "Age";
      case PersonalAttribute.DELEGATE_STATUS:
        return "Delegate";
    }
  }
}

class FormAnswerColumn extends TableColumn {
  id(): string {
    return `FA-${this.params.formId}-${this.params.questionId}`;
  }
  name(): string {
    // TODO: Pass in form data.
    return `${this.params.formId}-${this.params.questionId}`;
  }
}

export function decodeColumn(params: ColumnParams): TableColumn | null {
  switch (params.columnType) {
    case ColumnType.PERSONAL_ATTRIBUTE:
      return new PersonalAttributeColumn(params);
    case ColumnType.FORM_ANSWER:
      return new FormAnswerColumn(params);
  }
  return null;
}
