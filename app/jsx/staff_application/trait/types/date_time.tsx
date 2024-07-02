import { DateTime } from "luxon";

import { TraitTypeApi, TraitComputer, Trait } from "../api";
import { DateTimeExtras, TraitExtras } from "../extras";
import { ComputerParams } from "../params";
import { TraitType, SerializedTrait } from "../serialized";
import { FilterParams } from "../../filter/types/params";
import {
  defaultDateTimeParams,
  DateTimeFilterParams,
} from "../../filter/types/date_time";
import { DateTimeFilterSelector } from "../../filter/selector/date_time";

type DateTimeTraitParams =
  | {
      val: DateTime | null;
      extras: TraitExtras;
    }
  | {
      serialized: SerializedTrait;
      extras: TraitExtras;
    };
export class DateTimeTrait extends Trait {
  constructor(params: DateTimeTraitParams) {
    super();
    this.extras = params.extras as DateTimeExtras;
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      if (params.serialized.numberValues.length > 0) {
        this.val = DateTime.fromSeconds(params.serialized.numberValues[0]);
      } else {
        this.val = null;
      }
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.DateTimeTrait,
      numberValues: this.val == null ? [] : [this.val.toSeconds()],
      stringValues: [],
    };
  }

  render(): JSX.Element {
    if (this.val == null) {
      return <>&ndash;</>;
    }
    const val =
      this.extras.timeZone == null
        ? this.val
        : this.val.setZone(this.extras.timeZone);
    return <>{val.toLocaleString(DateTime.DATETIME_MED)}</>;
  }

  value(): DateTime | null {
    return this.val;
  }

  private val: DateTime | null;
  private extras: DateTimeExtras;
}

export class DateTimeTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.DateTimeTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new DateTimeTrait({
      serialized,
      extras: computer.extraDataForDeserialization(),
    });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    return defaultDateTimeParams(params);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
    idBase: string,
  ): JSX.Element {
    return (
      <DateTimeFilterSelector
        params={params as DateTimeFilterParams}
        trait={params.trait}
        onFilterChange={onFilterChange}
        idBase={idBase}
      />
    );
  }
}
