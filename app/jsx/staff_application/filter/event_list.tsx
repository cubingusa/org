import { Competition } from "@wca/helpers";

import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import {
  EventListFilterParams,
  EventListFilterType,
  eventListTypes,
} from "./types/event_list";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { EventListTrait } from "../trait/types/event_list";
import { ApplicationSettings } from "../types/competition_data";

export class EventListFilter extends Filter {
  constructor(
    private params: EventListFilterParams,
    settings: ApplicationSettings,
    wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const eventListTrait = trait as EventListTrait;
    switch (this.params.eventListType) {
      case EventListFilterType.Includes:
        return eventListTrait.value().includes(this.params.referenceEvent);
      case EventListFilterType.DoesNotInclude:
        return !eventListTrait.value().includes(this.params.referenceEvent);
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.eventListType) {
      case EventListFilterType.Includes:
        return (
          <>
            {subDescription} contains {this.params.referenceEvent}
          </>
        );
      case EventListFilterType.DoesNotInclude:
        return (
          <>
            {subDescription} does not contain {this.params.referenceEvent}
          </>
        );
    }
  }

  id(): string {
    return `ELF-${this.idBase()}-${this.params.eventListType}-${this.params.referenceEvent}`;
  }
}
