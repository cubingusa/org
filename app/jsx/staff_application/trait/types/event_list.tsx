import { TraitTypeApi, TraitComputer, Trait } from "../api";
import { ComputerParams } from "../params";
import { TraitType, SerializedTrait } from "../serialized";
import { FilterParams } from "../../filter/types/params";
import {
  defaultEventListParams,
  EventListFilterParams,
} from "../../filter/types/event_list";
import { EventListFilterSelector } from "../../filter/selector/event_list";

type EventListTraitParams =
  | {
      val: string[];
    }
  | {
      serialized: SerializedTrait;
    };
export class EventListTrait extends Trait {
  constructor(params: EventListTraitParams) {
    super();
    if ("val" in params) {
      this.val = params.val;
    } else if ("serialized" in params) {
      this.val = params.serialized.stringValues;
    }
  }

  serialize(): SerializedTrait {
    return {
      traitType: TraitType.EventListTrait,
      numberValues: [],
      stringValues: this.val,
    };
  }

  render(): JSX.Element {
    return (
      <>
        {(this.val || []).map((evt) => (
          <span
            key={evt}
            className={"cubing-icon event-" + evt}
            style={{
              fontSize: "16px",
              padding: "4px",
            }}
          ></span>
        ))}
      </>
    );
  }

  value(): string[] {
    return this.val;
  }

  private val: string[];
}

export class EventListTraitApi extends TraitTypeApi {
  type(): TraitType {
    return TraitType.EventListTrait;
  }

  deserialize(serialized: SerializedTrait, computer: TraitComputer): Trait {
    return new EventListTrait({ serialized });
  }

  defaultFilterParams(
    params: ComputerParams,
    computer: TraitComputer,
  ): FilterParams {
    return defaultEventListParams(params, this.wcif);
  }

  filterSelector(
    params: FilterParams | null,
    computer: TraitComputer,
    onFilterChange: (params: FilterParams) => void,
    idBase: string,
  ): JSX.Element {
    return (
      <EventListFilterSelector
        params={params as EventListFilterParams}
        trait={params.trait}
        onFilterChange={onFilterChange}
        idBase={idBase}
      />
    );
  }
}
