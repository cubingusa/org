import { FilterParams } from "../filter/types/params";
import { ComputerParams } from "../trait/params";
import { SerializedTrait } from "../trait/serialized";

export interface ExportedRow {
  userName: string;
  userId: number;
  userWcaId: string | null;
  cells: SerializedTrait[];
}

export interface SavedView {
  id: string;
  title: string;
  filters: FilterParams[];
  columns: ComputerParams[];

  isPublic: boolean;
  visibleTo: FilterParams[];
  exportTimeSeconds: number;
  exportedRows: ExportedRow[];
}

export interface ViewMetadata {
  id: string;
  title: string;
  isPublic: boolean;
  visibleTo: FilterParams[];
}
