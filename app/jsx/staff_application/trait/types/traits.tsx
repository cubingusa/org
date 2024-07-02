import { Competition } from "@wca/helpers";
import { TraitTypeApi } from "../api";
import { TraitType } from "../serialized";
import { BooleanTraitApi } from "./boolean";
import { DateTimeTraitApi } from "./date_time";
import { StringEnumTraitApi, NumberEnumTraitApi } from "./enum";
import { EventListTraitApi } from "./event_list";
import { NullTraitApi } from "./null";
import { NumberTraitApi } from "./number";
import { StringTraitApi } from "./string";

export function allTraitApis(wcif: Competition): TraitTypeApi[] {
  return [
    new BooleanTraitApi(wcif),
    new DateTimeTraitApi(wcif),
    new StringEnumTraitApi(wcif),
    new NumberEnumTraitApi(wcif),
    new EventListTraitApi(wcif),
    new NullTraitApi(wcif),
    new NumberTraitApi(wcif),
    new StringTraitApi(wcif),
  ];
}

export function getTraitApi(
  type: TraitType,
  wcif: Competition,
): TraitTypeApi | null {
  return allTraitApis(wcif).find((api) => api.type() == type);
}
