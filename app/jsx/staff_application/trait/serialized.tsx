export enum TraitType {
  BooleanTrait = "boolean",
  StringTrait = "string",
  NumberTrait = "number",
  NullTrait = "null",
  DateTimeTrait = "date_time",
}

export interface SerializedTrait {
  traitType: TraitType;
  stringValues: string[];
  numberValues: number[];
}
