import { AlgorithmRepository } from '../repositories/algorithm.repository';
import { AlgorithmDTO, AdminAlgorithmDTO, AlgorithmEntity } from '../types/algorithm';

export class AlgorithmService {
  private repository: AlgorithmRepository;

  constructor(repository?: AlgorithmRepository) {
    this.repository = repository || new AlgorithmRepository();
  }

  public getPublicCatalog(): AlgorithmDTO[] {
    const entities = this.repository.findAllEnabled();
    return entities.map(entity => this.mapToDTO(entity));
  }

  public getAllAlgorithms(): AdminAlgorithmDTO[] {
    const entities = this.repository.findAll();
    return entities.map(entity => this.mapToAdminDTO(entity));
  }

  public setAlgorithmEnabled(id: string, enabled: boolean): AdminAlgorithmDTO | null {
    const entity = this.repository.setEnabled(id, enabled);
    if (!entity) {
      return null;
    }
    return this.mapToAdminDTO(entity);
  }

  public getAlgorithmById(id: string): AlgorithmDTO | null {
    const entity = this.repository.findEnabledById(id);
    if (!entity) {
      return null;
    }
    return this.mapToDTO(entity);
  }

  private mapToDTO(entity: AlgorithmEntity): AlgorithmDTO {
    return {
      id: entity.id,
      name: entity.name,
      category: entity.category,
      description: entity.description,
      complexity: {
        time: {
          best: entity.time_complexity_best,
          average: entity.time_complexity_avg,
          worst: entity.time_complexity_worst,
        },
        space: entity.space_complexity,
      },
      input_type: entity.input_type,
      display_order: entity.display_order,
    };
  }

  private mapToAdminDTO(entity: AlgorithmEntity): AdminAlgorithmDTO {
    return {
      ...this.mapToDTO(entity),
      is_enabled: entity.is_enabled === 1,
    };
  }
}

