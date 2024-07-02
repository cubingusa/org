import { Trait, TraitComputer } from "./api";
import { SerializedTrait, TraitType } from "./serialized";
import { EnumExtras, DateTimeExtras } from "./extras";
import { BooleanTrait } from "./types/boolean";
import { StringTrait } from "./types/string";
import { NumberTrait } from "./types/number";
import { NullTrait } from "./types/null";
import { DateTimeTrait } from "./types/date_time";
import { StringEnumTrait, NumberEnumTrait } from "./types/enum";
import { EventListTrait } from "./types/event_list";

export function deserialize(
  serialized: SerializedTrait,
  computer: TraitComputer,
): Trait {
  switch (serialized.traitType) {
    case TraitType.BooleanTrait:
      return new BooleanTrait({ serialized });
    case TraitType.StringTrait:
      return new StringTrait({ serialized });
    case TraitType.NumberTrait:
      return new NumberTrait({ serialized });
    case TraitType.NullTrait:
      return new NullTrait({ serialized });
    case TraitType.DateTimeTrait:
      return new DateTimeTrait({
        serialized,
        extras: computer.extraDataForDeserialization() as DateTimeExtras,
      });
    case TraitType.StringEnumTrait:
      return new StringEnumTrait({
        serialized,
        extras: computer.extraDataForDeserialization() as EnumExtras<string>,
      });
    case TraitType.NumberEnumTrait:
      return new NumberEnumTrait({
        serialized,
        extras: computer.extraDataForDeserialization() as EnumExtras<number>,
      });
    case TraitType.EventListTrait:
      return new EventListTrait({ serialized });
  }
}
