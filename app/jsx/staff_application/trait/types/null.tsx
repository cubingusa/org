import { TraitTypeApi, TraitComputer, Trait } from "../api";
import { ComputerParams } from "../params";
import { FilterParams } from "../../filter/types/params";
import { TraitType, SerializedTrait } from "../serialized";
import { defaultNullParams, NullFilterParams } from "../../filter/types/null";

type NullTraitParams =
  | {}
  | {
      serialized: SerializedTrait;
    };
export class NullTrait extends Trait {
  constructor(params: NullTraitParams) {
    super();
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.NullTrait,
      numberValues: [],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    return <>&ndash;</>;
  }

  value(): null {
    return null;
  }
}

export class NullTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.NullTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new NullTrait({ serialized });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    return defaultNullParams(params);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
  ): JSX.Element {
    return null;
  }
}
