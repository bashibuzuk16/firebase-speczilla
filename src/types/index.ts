export interface DataRow {
  id: string;
  pos: string;
  name: string;
  type_original: string;
  code: string;
  manufacturer: string;
  measure: string;
  quantity: string;
  weight: string;
  note: string;
  article: string;
  rag_text: string;
  artikul: string;
  category: string;
  sub_category: string;
  description: string;
  material: string;
  type_extracted: string;
  connection_type: string;
  size: string;
  allies: string;
  function: string;
  Artikul_fact: string;
  potential_artikuls: string[];
  manual_check_needed: boolean;
  matching_thoughts: string;
  found_in_pdf_on_pages: number[];
  [key: string]: any; // для дополнительных полей
}

export interface ColumnDefinition {
  key: string;
  header: string;
  editable: boolean;
}