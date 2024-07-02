import { TraitTypeApi, TraitComputer, Trait } from "../api";
import { ComputerParams } from "../params";
import { TraitType, SerializedTrait } from "../serialized";
import { FilterParams } from "../../filter/types/params";
import {
  defaultStringParams,
  StringFilterParams,
} from "../../filter/types/string";
import { StringFilterSelector } from "../../filter/selector/string";

type StringTraitParams =
  | {
      val: string | null;
    }
  | {
      serialized: SerializedTrait;
    };
export class StringTrait extends Trait {
  constructor(params: StringTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      if (params.serialized.stringValues.length == 0) {
        this.val = null;
      } else {
        this.val = params.serialized.stringValues[0];
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.StringTrait,
      numberValues: [],
      stringValues: this.val == null ? [] : [this.val],
    };
  }

  render(): JSX.Element {
    return this.val == null ? <>&ndash;</> : <>{this.val}</>;
  }

  value(): string | null {
    return this.val;
  }

  private val: string | null;
}

export class StringTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.StringTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new StringTrait({ serialized });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    return defaultStringParams(params);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
    idBase: string,
  ): JSX.Element {
    return (
      <StringFilterSelector
        params={params as StringFilterParams}
        trait={params.trait}
        onFilterChange={onFilterChange}
        idBase={idBase}
      />
    );
  }
}
