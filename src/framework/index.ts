import * as schema from './schema';
import * as tasks from './tasks';
import * as crowd from './crowd';

export type UnsulliedConfig = {
  schemaFile: string,
  taskGenerationConfig: tasks.TaskGenerationConfig,
};

export type UnsulliedInterface = {
  schema: schema.Schema,
  crowd: crowd.Crowd,
};

export async function initialize(config: UnsulliedConfig): Promise<UnsulliedInterface> {
  const _schema = await schema.Schema.load(config);
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
