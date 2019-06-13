import * as schema from './schema';
import * as tasks from './tasks';
import * as crowd from './crowd';

export type UnsulliedConfig = {
  taskGenerationConfig: tasks.TaskGenerationConfig,
};

export type UnsulliedInterface = {
  schema: schema.Schema,
  crowd: crowd.Crowd,
};

export function initialize(config: UnsulliedConfig): UnsulliedInterface {
  const _schema = schema.Schema.load(config);
  const _crowd = crowd.Crowd.load(config);

  return {
    schema: _schema,
    crowd: _crowd,
  };
}

export * from './schema';
export * from './tasks';
export * from './crowd';

export default initialize;
