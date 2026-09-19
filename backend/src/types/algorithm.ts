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

export interface AlgorithmEntity {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  time_complexity_best: string;
  time_complexity_avg: string;
  time_complexity_worst: string;
  space_complexity: string;
  input_type: AlgorithmInputType;
  display_order: number;
  is_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface AlgorithmDTO {
  id: string;
  name: string;
  category: AlgorithmCategory;
  description: string;
  complexity: {
    time: {
      best: string;
      average: string;
      worst: string;
    };
    space: string;
  };
  input_type: AlgorithmInputType;
  display_order: number;
}
