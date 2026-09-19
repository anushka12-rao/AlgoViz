export interface EngineOptions {
  mode?: 'auto' | 'step';
}

export interface EngineRequest {
  algorithm: string;
  input: Record<string, any>;
  options?: EngineOptions;
}

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
  error: string;
  total_steps: number;
  events: any[];
}

export type EngineResponse = EngineSuccessResponse | EngineErrorResponse;

export class EngineTimeoutError extends Error {
  public readonly code = 'ENGINE_TIMEOUT';
  public readonly statusCode = 504;
  constructor(message = 'Algorithm execution exceeded the maximum time limit (3000ms)') {
    super(message);
    this.name = 'EngineTimeoutError';
  }
}

export class OutputLimitExceededError extends Error {
  public readonly code = 'OUTPUT_LIMIT_EXCEEDED';
  public readonly statusCode = 500;
  constructor(message = 'Algorithm visualization output exceeded the maximum allowed size') {
    super(message);
    this.name = 'OutputLimitExceededError';
  }
}

export class ConcurrencyLimitExceededError extends Error {
  public readonly code = 'CONCURRENCY_LIMIT_EXCEEDED';
  public readonly statusCode = 429;
  constructor(message = 'Server is processing maximum concurrent visualizers. Please retry shortly.') {
    super(message);
    this.name = 'ConcurrencyLimitExceededError';
  }
}

export class EngineExecutionError extends Error {
  public readonly code = 'ENGINE_EXECUTION_ERROR';
  public readonly statusCode = 500;
  constructor(message = 'Algorithm visualization engine encountered an unexpected internal error') {
    super(message);
    this.name = 'EngineExecutionError';
  }
}

export class ServiceUnavailableError extends Error {
  public readonly code = 'SERVICE_UNAVAILABLE';
  public readonly statusCode = 503;
  constructor(message = 'Visualization engine service is temporarily unavailable') {
    super(message);
    this.name = 'ServiceUnavailableError';
  }
}

export class EngineDomainError extends Error {
  public readonly code = 'ENGINE_DOMAIN_ERROR';
  public readonly statusCode = 422;
  constructor(message: string) {
    super(message);
    this.name = 'EngineDomainError';
  }
}
