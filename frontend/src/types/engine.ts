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

export type DataStructureAction =
  | 'INIT'
  | 'PUSH'
  | 'POP'
  | 'TOP'
  | 'FRONT'
  | 'PUSH_FRONT'
  | 'PUSH_BACK'
  | 'POP_FRONT'
  | 'POP_BACK'
  | 'SEARCH'
  | 'EMPTY_CHECK'
  | 'CLEAR'
  | 'OVERFLOW'
  | 'UNDERFLOW';

export type TreeAction =
  | 'INIT'
  | 'BUILD_PREORDER'
  | 'INSERT'
  | 'TRAVERSAL'
  | 'LEVEL_ORDER'
  | 'METRICS'
  | 'INSERT_BATCH'
  | 'SEARCH'
  | 'DELETE'
  | 'SORTED_VIEW'
  | 'CLEAR';

export type GraphAction =
  | 'GRAPH_INIT'
  | 'ADD_EDGE'
  | 'GRAPH_PRINT'
  | 'BFS_START'
  | 'BFS_ENQUEUE'
  | 'BFS_DEQUEUE'
  | 'BFS_INSPECT'
  | 'BFS_COMPONENT_TRANSITION'
  | 'BFS_COMPLETE'
  | 'DFS_START'
  | 'DFS_ENTER'
  | 'DFS_INSPECT'
  | 'DFS_BACKTRACK'
  | 'DFS_COMPONENT_TRANSITION'
  | 'DFS_COMPLETE';

export type EngineAction =
  | SortingAction
  | SearchingAction
  | DataStructureAction
  | TreeAction
  | GraphAction
  | (string & {});

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

export type StackOp =
  | { op: 'push'; val: number }
  | { op: 'pop' }
  | { op: 'top' }
  | { op: 'empty' }
  | { op: 'clear' };

export interface StackInput {
  elements?: number[];
  operations?: StackOp[];
}

export type QueueOp =
  | { op: 'push'; val: number }
  | { op: 'pop' }
  | { op: 'front' }
  | { op: 'empty' }
  | { op: 'clear' };

export interface QueueInput {
  elements?: number[];
  operations?: QueueOp[];
}

export type LinkedListOp =
  | { op: 'push_front'; val: number }
  | { op: 'push_back'; val: number }
  | { op: 'pop_front' }
  | { op: 'pop_back' }
  | { op: 'search'; val: number }
  | { op: 'clear' };

export interface LinkedListInput {
  elements?: number[];
  operations?: LinkedListOp[];
}

export interface BinaryTreeInsertion {
  parent: number;
  val: number;
  side?: 'L' | 'R' | 'l' | 'r';
}

export interface BinaryTreeOp {
  op: 'inorder' | 'preorder' | 'postorder' | 'level_order' | 'metrics' | 'clear';
}

export interface BinaryTreeInput {
  preorder?: number[];
  insertions?: BinaryTreeInsertion[];
  operations?: BinaryTreeOp[];
}

export type BSTOp =
  | { op: 'insert'; val: number }
  | { op: 'search'; val: number }
  | { op: 'delete'; val: number }
  | { op: 'clear' }
  | { op: 'sorted' };

export interface BSTInput {
  values?: number[];
  search_target?: number;
  delete_target?: number;
  operations?: BSTOp[];
}

export interface GraphInput {
  vertices?: number;
  edges?: Array<[number, number]>;
  src?: number;
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

