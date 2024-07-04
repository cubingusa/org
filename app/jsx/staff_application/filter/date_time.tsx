import { useState } from "react";
import { DateTime } from "luxon";

import { Competition } from "@wca/helpers";

import {
  DateTimeFilterParams,
  DateTimeFilterType,
  DateTimeFilterTimeZone,
  dateTimeFilterUsesReference,
} from "./types/date_time";
import { FilterParams } from "./types/params";
import { FilterType } from "./types/base";
import { Filter } from "./filter";
import { Trait } from "../trait/api";
import { ComputerParams } from "../trait/params";
import { DateTimeTrait } from "../trait/types/date_time";
import { ApplicationSettings } from "../types/competition_data";

export class DateTimeFilter extends Filter {
  constructor(
    private params: DateTimeFilterParams,
    settings: ApplicationSettings,
    private wcif: Competition,
  ) {
    super(params, settings, wcif);
  }

  protected applyImpl(trait: Trait): boolean {
    const dateTimeTrait = trait as DateTimeTrait;
    if (
      dateTimeTrait.value() === null &&
      this.params.dateTimeType !== DateTimeFilterType.IsNull
    ) {
      return false;
    }
    switch (this.params.dateTimeType) {
      case DateTimeFilterType.IsBefore:
        return dateTimeTrait.value().toSeconds() < this.params.referenceSeconds;
      case DateTimeFilterType.IsAfter:
        return dateTimeTrait.value().toSeconds() > this.params.referenceSeconds;
      case DateTimeFilterType.IsNull:
        return dateTimeTrait.value() === null;
      case DateTimeFilterType.NotNull:
        return dateTimeTrait.value() !== null;
    }
  }

  description(): JSX.Element {
    const subDescription = this.computer.header();
    switch (this.params.dateTimeType) {
      case DateTimeFilterType.IsNull:
        return <>{subDescription} is null</>;
      case DateTimeFilterType.NotNull:
        return <>{subDescription} is not null</>;
    }
    let referenceTime = DateTime.fromSeconds(
      this.params.referenceSeconds,
    ) as DateTime;
    if (this.params.timeZone == DateTimeFilterTimeZone.Competition) {
      referenceTime = referenceTime.setZone(
        this.wcif.schedule.venues[0].timezone,
      );
    }
    switch (this.params.dateTimeType) {
      case DateTimeFilterType.IsBefore:
        return (
          <>
            {subDescription} is before{" "}
            {referenceTime.toLocaleString(DateTime.DATETIME_MED)}
          </>
        );
      case DateTimeFilterType.IsAfter:
        return (
          <>
            {subDescription} is after{" "}
            {referenceTime.toLocaleString(DateTime.DATETIME_MED)}
          </>
        );
    }
  }

  id(): string {
    if (dateTimeFilterUsesReference(this.params.dateTimeType)) {
      return `NF-${this.idBase()}-${this.params.dateTimeType}-${this.params.referenceSeconds}`;
    } else {
      return `NF-${this.idBase()}-${this.params.dateTimeType}`;
    }
  }
}
