import { $$asyncIterator } from 'iterall';
import { GraphQLServer, PubSub } from 'graphql-yoga';
import { GraphQLUpload } from 'apollo-upload-server'

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
  scalar Upload

  type File {
    path: String!
    filename: String!
    mimetype: String!
    encoding: String!
  }

  type TaskGenerationConfig {
    initialLocation: String!
  }

  type ConfigState {
    schemaFile: String
    taskGenerationConfig: TaskGenerationConfig!
  }

  type CrowdState {
    stats: CrowdStats!
  }

  type CrowdStats {
    seenWorkersTotal: Int!
    availableWorkersTotal: Int!
  }

  type TaskStats {
    availableTasksTotal: Int!
  }

  type TaskState {
    stats: TaskStats!
  }

  type KnowledgeStats {
    totalEntityTypes: Int!
  }

  type KnowledgeState {
    stats: KnowledgeStats!
    knownClasses: [String]!
  }

  type State {
    currentTime: Float!
    config: ConfigState!
    crowd: CrowdState!
    tasks: TaskState!
    knowledge: KnowledgeState!
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
    configState: ConfigState!
    workerState(workerId: ID!): WorkerState!
  }

  type Mutation {
    registerWorker(name: String): Worker!
    submitTaskResult(taskString: String!, taskResultString: String!, file: Upload): TaskResult!
  }

  type Subscription {
    currentState: State!
    configState: ConfigState!
    workerState(workerId: ID!): WorkerState!
  }

`

const existingChannels = {

};

const resolvers = {
  Upload: GraphQLUpload,
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
    configState: (parent, args, { unsullied }) => {
      const state = (unsullied as UnsulliedInterface).control.configControl.currentState;
      console.log('Queried configState:', state);
      return state;
    },
    workerState: (parent, { workerId }, { unsullied }) => {
      if (!((unsullied as UnsulliedInterface).control.crowdControl.workerExists(workerId))) throw new Error(`Worker with ID "${workerId}" does not exist.`);
      const worker = (unsullied as UnsulliedInterface).control.crowdControl.getWorker(workerId);

      const state = worker.currentState;
      // console.log('Queried state:', state);
      return state;
    },
  },
  Mutation: {
    async registerWorker(parent, { name }, { unsullied }) {
      const worker = await (unsullied as UnsulliedInterface).control.crowdControl.registerWorker({ name });

      return worker;
    },
    async submitTaskResult(parent, { taskString, taskResultString, file }, { unsullied }) {
      let _file;
      if (file) {
        const _file = await file;
        console.log('Got file!', _file.filename);
      }

      (unsullied as UnsulliedInterface).control.knowledgeControl.submitTaskResult(taskString, taskResultString, _file);
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
    configState: {
      subscribe: (parent, args, { unsullied, pubsub }) => {
        const it = pubsub.asyncIterator(CONFIG_CHANNEL);
        return it;
      },
    },
    workerState: {
      subscribe: (parent, { workerId }, { unsullied, pubsub }) => {
        if (!((unsullied as UnsulliedInterface).control.crowdControl.workerExists(workerId))) throw new Error(`Worker with ID "${workerId}" is not available.`);
        const channel = "workerState" + workerId;

        let exists = channel in existingChannels;

        const worker = (unsullied as UnsulliedInterface).control.crowdControl.getWorker(workerId);
        // console.log(exists, worker);

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

export const CONFIG_CHANNEL = 'config';
export const STATE_CHANNEL = 'state';
export function makeGraphQLConfig(unsullied: UnsulliedInterface) {
  const pubsub = new PubSub();

  (unsullied as UnsulliedInterface).control.observable.subscribe({
    next: state => {
      // console.log('Publishing state:', state);
      pubsub.publish(CONFIG_CHANNEL, { configState: state.config });
      pubsub.publish(STATE_CHANNEL, { currentState: state });
    },
  });

  return { typeDefs, resolvers, context: { unsullied, pubsub } };
}

// const server = new GraphQLServer()
