export interface AdminAlgorithm {
  id: string;
  name: string;
  category: string;
  description: string;
  complexity: {
    time: {
      best: string;
      average: string;
      worst: string;
    };
    space: string;
  };
  input_type: string;
  display_order: number;
  is_enabled: boolean;
}

export interface AdminAlgorithmsResponse {
  success: boolean;
  data: AdminAlgorithm[];
}

export interface AdminAlgorithmResponse {
  success: boolean;
  data: AdminAlgorithm;
}
