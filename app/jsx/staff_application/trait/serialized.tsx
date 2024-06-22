export enum TraitType {
  BooleanTrait = "boolean",
  StringTrait = "string",
  NumberTrait = "number",
  NullTrait = "null",
}

export interface SerializedTrait {
  traitType: TraitType;
  stringValues: string[];
  numberValues: number[];
}
