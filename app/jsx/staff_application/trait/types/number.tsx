import { TraitTypeApi, TraitComputer, Trait } from "../api";
import { ComputerParams } from "../params";
import { TraitType, SerializedTrait } from "../serialized";
import {
  defaultNumberParams,
  NumberFilterParams,
} from "../../filter/types/number";
import { NumberFilterSelector } from "../../filter/selector/number";

type NumberTraitParams =
  | {
      val: number | null;
    }
  | {
      serialized: SerializedTrait;
    };
export class NumberTrait extends Trait {
  constructor(params: NumberTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      if (params.serialized.numberValues.length == 0) {
        this.val = null;
      } else {
        this.val = params.serialized.numberValues[0];
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.NumberTrait,
      numberValues: this.val == null ? [] : [this.val],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    return this.val == null ? <>&ndash;</> : <>{this.val}</>;
  }

  value(): number | null {
    return this.val;
  }

  private val: number | null;
}

export class NumberTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.NumberTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new NumberTrait({ serialized });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    return defaultNumberParams(params);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
  ): JSX.Element {
    return (
      <NumberFilterSelector
        params={params as NumberFilterParams}
        trait={params.trait}
        onFilterChange={onFilterChange}
      />
    );
  }
}
