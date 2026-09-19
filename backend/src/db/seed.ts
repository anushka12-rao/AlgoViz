import Database from 'better-sqlite3';
import { ALGORITHM_SEEDS, AlgorithmSeedItem } from './seeds/algorithms.data';

export function seedAlgorithms(db: Database.Database, seeds: AlgorithmSeedItem[] = ALGORITHM_SEEDS): void {
  const upsertStmt = db.prepare(`
    INSERT INTO algorithms (
      id,
      name,
      category,
      description,
      time_complexity_best,
      time_complexity_avg,
      time_complexity_worst,
      space_complexity,
      input_type,
      display_order,
      is_enabled
    ) VALUES (
      @id,
      @name,
      @category,
      @description,
      @time_complexity_best,
      @time_complexity_avg,
      @time_complexity_worst,
      @space_complexity,
      @input_type,
      @display_order,
      @is_enabled
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      description = excluded.description,
      time_complexity_best = excluded.time_complexity_best,
      time_complexity_avg = excluded.time_complexity_avg,
      time_complexity_worst = excluded.time_complexity_worst,
      space_complexity = excluded.space_complexity,
      input_type = excluded.input_type,
      display_order = excluded.display_order
  `);

  const runSeedTx = db.transaction((items: AlgorithmSeedItem[]) => {
    for (const item of items) {
      upsertStmt.run(item);
    }
  });

  runSeedTx(seeds);
}
