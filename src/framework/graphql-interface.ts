import { $$asyncIterator } from 'iterall';
import { GraphQLServer, PubSub } from 'graphql-yoga';

import { Observable } from 'rxjs';
require('rxjs-to-async-iterator');

import {
  UnsulliedInterface,
  ConfigState,
  CrowdState,
  TaskState,
  KnowledgeState,
} from '.';

const typeDefs = `


  type ConfigState {
    schemaFile: String
  }

  type CrowdState {
    stats: CrowdStats!
  }

  type CrowdStats {
    availableWorkersTotal: Int!
  }

  type TaskStats {
    availableTasksTotal: Int!
  }

  type TaskState {
    stats: TaskStats!
  }

  type ResultStats {
    totalResults: Int!
  }

  type KnowledgeState {
    stats: ResultStats!
  }

  type State {
    currentTime: Float!
    config: ConfigState!
    crowd: CrowdState!
    tasks: TaskState!
    results: KnowledgeState!
  }

  type MicroTask {
    taskType: String!
    taskParams: [String]!
    interfaceType: String!
    interfaceParams: [String]!
    resultType: String!
    resultParams: [String]!
  }

  type TaskResult {
    isSubmitted: Boolean!
  }

  type Profile {
    id: ID!
    name: String
  }

  type Worker {
    profile: Profile!
    currentState: WorkerState!
  }

  type WorkerState {
    isOnline: Boolean!
    currentTask: MicroTask
  }

  type Query {
    currentState: State!
    workerState(workerId: ID!): WorkerState!
  }

  type Mutation {
    registerWorker(name: String): Worker!
    submitTaskResult(taskString: String!, taskResultString: String!): TaskResult!
  }

  type Subscription {
    currentState: State!
    workerState(workerId: ID!): WorkerState!
  }

`

const existingChannels = {

};

const resolvers = {
  ConfigState: {
    schemaFile: (state: ConfigState) => state.schemaFile,
  },
  CrowdState: {
    stats: (state: CrowdState) => state.stats,
  },
  TaskState: {
    stats: (state: TaskState) => state.stats,
  },
  KnowledgeState: {
    stats: (state: KnowledgeState) => state.stats,
  },
  State: {
    config: state => state.config,
  },
  Query: {
    currentState: (parent, args, { unsullied }) => {
      const state = (unsullied as UnsulliedInterface).control.currentState;
      console.log('Queried state:', state);
      return state;
    },
    workerState: (parent, { workerId }, { unsullied }) => {
      if (!((unsullied as UnsulliedInterface).control.crowdControl.workerIsAvailable(workerId))) throw new Error(`Worker with ID "${workerId}" is not available.`);
      const worker = (unsullied as UnsulliedInterface).control.crowdControl.getAvailableWorker(workerId);

      const state = worker.currentState;
      console.log('Queried state:', state);
      return state;
    },
  },
  Mutation: {
    async registerWorker(parent, { name }, { unsullied }) {
      const worker = (unsullied as UnsulliedInterface).control.crowdControl.registerWorker({ name });

      return worker;
    },
    async submitTaskResult(parent, { taskString, taskResultString }, { unsullied }) {
      await (unsullied as UnsulliedInterface).control.taskControl.submitTaskResult(taskString, taskResultString);
      return { isSubmitted: true };
    },
  },
  Subscription: {
    currentState: {
      subscribe: (parent, args, { unsullied, pubsub }) => {
        const it = pubsub.asyncIterator(STATE_CHANNEL);
        return it;
      },
    },
    workerState: {
      subscribe: (parent, { workerId }, { unsullied, pubsub }) => {
        if (!((unsullied as UnsulliedInterface).control.crowdControl.workerIsAvailable(workerId))) throw new Error(`Worker with ID "${workerId}" is not available.`);
        const channel = "workerState" + workerId;

        let exists = channel in existingChannels;

        const worker = (unsullied as UnsulliedInterface).control.crowdControl.getAvailableWorker(workerId);
        console.log(exists, worker);

        const it = pubsub.asyncIterator(channel);

        if (!exists) {
          worker.subject.subscribe({
            next: state => {
              // console.log('Publishing state:', state);
              pubsub.publish(channel, { workerState: state });
            },
          });

          existingChannels[channel] = true;
        } else {
          pubsub.publish(channel, { workerState: worker.currentState });
        }

        return it;
      },
    }
  },
}

export const STATE_CHANNEL = 'state';
export function makeGraphQLConfig(unsullied: UnsulliedInterface) {
  const pubsub = new PubSub();

  (unsullied as UnsulliedInterface).control.observable.subscribe({
    next: state => {
      // console.log('Publishing state:', state);
      pubsub.publish(STATE_CHANNEL, { currentState: state });
    },
  });

  return { typeDefs, resolvers, context: { unsullied, pubsub } };
}

// const server = new GraphQLServer()
