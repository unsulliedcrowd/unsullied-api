import * as schema from './schema';
import * as tasks from './tasks';
import * as crowd from './crowd';
import * as observables from './observables';

export type UnsulliedConfig = {
  schemaFile: string,
  redisUrl: string,
  taskGenerationConfig: tasks.TaskGenerationConfig,
};

export type UnsulliedInterface = {
  schema: schema.Schema,
  crowd: crowd.Crowd,
  control: observables.UnsulliedControl,
};

export async function initialize(config: UnsulliedConfig): Promise<UnsulliedInterface> {
  const _schema = await schema.Schema.load(config);
  const _crowd = crowd.Crowd.load(config);

  const control = new observables.UnsulliedControl(config);

  return {
    schema: _schema,
    crowd: _crowd,
    control,
  };
}

export * from './schema';
export * from './tasks';
export * from './crowd';
export * from './observables';

export * from './graphql-interface';

export default initialize;
