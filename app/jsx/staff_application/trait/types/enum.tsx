import { TraitTypeApi, TraitComputer, Trait } from "../api";
import { ComputerParams } from "../params";
import { TraitType, SerializedTrait } from "../serialized";
import { FilterParams } from "../../filter/types/params";
import {
  defaultStringEnumParams,
  StringEnumFilterParams,
  defaultNumberEnumParams,
  NumberEnumFilterParams,
  EnumFilterValue,
} from "../../filter/types/enum";
import {
  StringEnumFilterSelector,
  NumberEnumFilterSelector,
} from "../../filter/selector/enum";
import { TraitExtras, EnumExtras } from "../extras";

type EnumTraitParams<T> =
  | {
      val: T | null;
      extras: EnumExtras<T>;
    }
  | {
      serialized: SerializedTrait;
      extras: EnumExtras<T>;
    };
export abstract class EnumTrait<T> extends Trait {
  constructor(params: EnumTraitParams<T>) {
    super();
    this.allValues = params.extras.allValues;
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      this.val = this.deserialize(params.serialized);
    }
  }

  abstract deserialize(trait: SerializedTrait): T | null;
  abstract serialize(): SerializedTrait;

  render(): JSX.Element {
    if (!this.allValues.has(this.val)) {
      return <>&ndash;</>;
    } else {
      return <>{this.allValues.get(this.val)}</>;
    }
  }

  value(): T | null {
    return this.val;
  }

  protected val: T | null;
  private allValues: Map<T, string>;
}

export class StringEnumTrait extends EnumTrait<string> {
  deserialize(trait: SerializedTrait): string | null {
    if (trait.stringValues.length == 0) {
      return null;
    } else {
      return trait.stringValues[0];
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.StringEnumTrait,
      numberValues: [],
      stringValues: [this.val],
    };
  }
}

export class NumberEnumTrait extends EnumTrait<number> {
  deserialize(trait: SerializedTrait): number | null {
    if (trait.numberValues.length == 0) {
      return null;
    } else {
      return trait.numberValues[0];
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.NumberEnumTrait,
      numberValues: [this.val],
      stringValues: [],
    };
  }
}

export class NumberEnumTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.NumberEnumTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new NumberEnumTrait({
      serialized,
      extras: computer.extraDataForDeserialization() as EnumExtras<number>,
    });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    const values = [] as EnumFilterValue<number>[];
    (
      computer.extraDataForDeserialization() as EnumExtras<number>
    ).allValues.forEach((value, key) => {
      values.push({ key, value });
    });
    return defaultNumberEnumParams(params, values);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
    idBase: string,
  ): JSX.Element {
    return (
      <NumberEnumFilterSelector
        params={params as NumberEnumFilterParams}
        trait={params.trait}
        onFilterChange={onFilterChange}
        values={
          (computer.extraDataForDeserialization() as EnumExtras<number>)
            .allValues
        }
        idBase={idBase}
      />
    );
  }
}

export class StringEnumTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.StringEnumTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new StringEnumTrait({
      serialized,
      extras: computer.extraDataForDeserialization() as EnumExtras<string>,
    });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    const values = [] as EnumFilterValue<string>[];
    (
      computer.extraDataForDeserialization() as EnumExtras<string>
    ).allValues.forEach((value, key) => {
      values.push({ key, value });
    });
    return defaultStringEnumParams(params, values);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
    idBase: string,
  ): JSX.Element {
    return (
      <StringEnumFilterSelector
        params={params as StringEnumFilterParams}
        trait={params.trait}
        onFilterChange={onFilterChange}
        values={
          (computer.extraDataForDeserialization() as EnumExtras<string>)
            .allValues
        }
        idBase={idBase}
      />
    );
  }
}
