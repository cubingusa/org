export interface EnumExtras<T> {
  allValues: Map<T, string>;
}

export interface DateTimeExtras {
  // If timeZone is null, use user local timezone.
  timeZone: string | null;
}

export interface NullExtras {}

export type TraitExtras =
  | EnumExtras<string>
  | EnumExtras<number>
  | DateTimeExtras
  | NullExtras;
