export enum TraitType {
  BooleanTrait = "boolean",
  StringTrait = "string",
  NumberTrait = "number",
  NullTrait = "null",
  DateTimeTrait = "date_time",
  StringEnumTrait = "string_enum",
  NumberEnumTrait = "number_enum",
  EventListTrait = "event_list",
}

export interface SerializedTrait {
  traitType: TraitType;
  stringValues: string[];
  numberValues: number[];
}
