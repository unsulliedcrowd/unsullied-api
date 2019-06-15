import * as UnsulliedKnowledge from '../../framework';

// Load schema

// Load seed data
import * as seedData from './seed.json';

// Load config
import * as unsulliedConfig from './unsullied-config.json';

export async function runExample() {

  // Initialize framework
  const unsulliedInterface = await UnsulliedKnowledge.initialize(unsulliedConfig);

  // Do things

  // Generate tasks
  const tasks = unsulliedInterface.schema.generateTasks();
  console.log(JSON.stringify(tasks.map(task => task.toString())));


  // Create some workers

  // Assign tasks

  // Generate results

  // Aggregate results

}

runExample();
