export interface TreeNodeRecord {
  id: number;
  val: number;
  left_id: number;
  right_id: number;
}

export interface EngineEvent {
  step_index: number;
  action: string;
  message: string;
  canonical_duration_ms: number;
  active_indices?: number[];
  array_state?: number[];
  tree_state?: TreeNodeRecord[];
  graph_adj?: number[][];
  graph_traversal?: number[];
  graph_queue?: number[];
  graph_visited?: boolean[];
  current_vertex?: number;
  sorted_boundary?: number;
  range_st?: number;
  range_end?: number;
  range_mid?: number;
  pivot_idx?: number;
  pivot_val?: number;
  stats?: Record<string, number>;
}

export interface EngineOptions {
  mode?: 'auto' | 'step';
}

export interface EngineRequest {
  algorithm: string;
  input: Record<string, any>;
  options?: EngineOptions;
}

export interface EngineSuccessResponse {
  success: true;
  algorithm: string;
  category: string;
  total_steps: number;
  final_result: Record<string, any>;
  events: EngineEvent[];
}

export interface EngineErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type EngineResponse = EngineSuccessResponse | EngineErrorResponse;
