export interface TreeNodeRecord {
  id: number;
  val: number;
  left_id: number;
  right_id: number;
}

export type SortingAction =
  | 'INITIAL'
  | 'PASS_START'
  | 'COMPARE'
  | 'SWAP'
  | 'NO_SWAP'
  | 'PASS_END'
  | 'EARLY_EXIT'
  | 'BOUNDARY'
  | 'NEW_MIN'
  | 'EXTRACT_KEY'
  | 'SHIFT'
  | 'FOUND_POS'
  | 'INSERT_KEY'
  | 'SPLIT'
  | 'MERGE_START'
  | 'MERGE_COMPARE'
  | 'COPY_REMAINING_LEFT'
  | 'COPY_REMAINING_RIGHT'
  | 'MERGED_SECTION'
  | 'PARTITION_START'
  | 'SAME_INDEX'
  | 'GREATER'
  | 'PIVOT_PLACED'
  | 'SUBPARTS'
  | 'COMPLETE';

export type SearchingAction =
  | 'SEARCH_START'
  | 'CHECK'
  | 'MISMATCH'
  | 'MATCH'
  | 'STEP'
  | 'GREATER'
  | 'SMALLER'
  | 'COMPLETE';

export type EngineAction = SortingAction | SearchingAction | (string & {});

export interface EngineEvent {
  step_index: number;
  action: EngineAction;
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

export interface EngineRequest<TInput = Record<string, any>> {
  algorithm: string;
  input: TInput;
  options?: EngineOptions;
}

export interface SortingInput {
  array: number[];
}

export interface SearchingInput {
  array: number[];
  target: number;
}

export interface SortingFinalResult {
  final_array: number[];
}

export interface SearchingFinalResult {
  result_index: number;
  found: boolean;
}

export interface EngineSuccessResponse<TResult = Record<string, any>> {
  success: true;
  algorithm: string;
  category: string;
  total_steps: number;
  final_result: TResult;
  events: EngineEvent[];
}

export interface EngineErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type EngineResponse<TResult = Record<string, any>> =
  | EngineSuccessResponse<TResult>
  | EngineErrorResponse;

