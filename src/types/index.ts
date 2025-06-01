export interface DataRow {
  [key: string]: any; // Allows for arbitrary properties
  id: string;
}

export interface ColumnDefinition {
  key: string;
  header: string;
  editable?: boolean;
}
