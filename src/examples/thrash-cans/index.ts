import * as UnsulliedKnowledge from '../../framework';

// Load schema

// Load seed data
import * as seedData from './seed.json';

// Load config
import * as unsulliedConfig from './unsullied-config.json';

// Initialize framework
const unsulliedInterface = UnsulliedKnowledge.initialize(unsulliedConfig);

// Do things

// Generate tasks
const tasks = unsulliedInterface.schema.generateTasks();
console.log(JSON.stringify(tasks));
