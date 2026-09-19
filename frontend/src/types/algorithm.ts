export type AlgorithmCategory =
  | 'sorting'
  | 'searching'
  | 'data_structures'
  | 'trees'
  | 'graphs';

export type AlgorithmInputType =
  | 'array'
  | 'array_and_target'
  | 'data_structure_ops'
  | 'tree_preorder'
  | 'bst_values'
  | 'graph_edges';

export interface ComplexityTimeDTO {
  best: string;
  average: string;
  worst: string;
}

export interface ComplexityDTO {
  time: ComplexityTimeDTO;
  space: string;
}

export interface AlgorithmDTO {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: ComplexityDTO;
  input_type: AlgorithmInputType;
  display_order: number;
}

export interface AlgorithmCatalogResponse {
  success: boolean;
  data: AlgorithmDTO[];
}

export interface AlgorithmDetailResponse {
  success: boolean;
  data: AlgorithmDTO;
}
