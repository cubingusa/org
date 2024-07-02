import { TraitTypeApi, TraitComputer, Trait } from "../api";
import { ComputerParams } from "../params";
import { TraitType, SerializedTrait } from "../serialized";
import { FilterParams } from "../../filter/types/params";
import {
  defaultBooleanParams,
  BooleanFilterParams,
} from "../../filter/types/boolean";
import { BooleanFilterSelector } from "../../filter/selector/boolean";

type BooleanTraitParams =
  | {
      val: boolean | null;
    }
  | {
      serialized: SerializedTrait;
    };
export class BooleanTrait extends Trait {
  constructor(params: BooleanTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      if (params.serialized.numberValues.length == 0) {
        this.val = null;
      } else {
        this.val = params.serialized.numberValues[0] == 1;
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.BooleanTrait,
      numberValues: this.val == null ? [] : [this.val ? 1 : 0],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    switch (this.val) {
      case null:
        return <>&ndash</>;
      case true:
        return <span className="material-symbols-outlined">check</span>;
      case false:
        return <span className="material-symbols-outlined">close</span>;
    }
  }

  value(): boolean | null {
    return this.val;
  }

  private val: boolean | null;
}

export class BooleanTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.BooleanTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new BooleanTrait({ serialized });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    return defaultBooleanParams(params);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
    idBase: string,
  ): JSX.Element {
    return (
      <BooleanFilterSelector
        params={params as BooleanFilterParams}
        trait={params.trait}
        onFilterChange={onFilterChange}
        idBase={idBase}
      />
    );
  }
}
