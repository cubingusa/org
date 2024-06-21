export interface PropertyVal {
  id: number;
  value: string;
}

export interface Property {
  // Unique within a competition.
  id: number;

  name: string;
  visible: boolean;
  values: PropertyVal[];
  nextValueId: number;
}
