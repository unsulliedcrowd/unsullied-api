import { GraphQLServer } from 'graphql-yoga'
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

  const { typeDefs, resolvers, context } = UnsulliedKnowledge.makeGraphQLConfig(unsulliedInterface);

  const server = new GraphQLServer({
    typeDefs,
    resolvers,
    context: request => ({
      ...request,
      ...context
    }),
  })

  // Start the server when executed directly
  if (require.main === module) {
    server.start({
      subscriptions: {
        onConnect:(...args) => {
          console.log('Connection!');
        },
        onDisconnect:(...args) => {
          console.log('Disconnect!', args);
        },
        keepAlive: 3000
      }
    },() => console.log(`Server is running on http://localhost:4000`))
  }
}

runExample();
