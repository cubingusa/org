export interface Property {
  // Unique within a competition.
  id: number;

  name: string;
  visible: boolean;
  values: Map<number, string>;
  nextValueId: number;
}
