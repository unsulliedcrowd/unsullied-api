import { $$asyncIterator } from 'iterall';
import { GraphQLServer, PubSub } from 'graphql-yoga';

import { Observable } from 'rxjs';
require('rxjs-to-async-iterator');

import {
  UnsulliedInterface,
  ConfigState,
  CrowdState,
  TaskState,
  ResultState,
} from '.';

const typeDefs = `
  type Query {
    currentState: State!
  }

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

  type ResultState {
    stats: ResultStats!
  }

  type State {
    currentTime: Float!
    config: ConfigState!
    crowd: CrowdState!
    tasks: TaskState!
    results: ResultState!
  }

  type Subscription {
    currentState: State!
  }

  type Profile {
    id: ID!
    name: String
  }

  type Worker {
    profile: Profile!
  }

  type Mutation {
    registerWorker(name: String): Worker!
  }

`

const resolvers = {
  Query: {
    currentState: (parent, args, { unsullied }) => {
      const state = (unsullied as UnsulliedInterface).control.currentState;
      console.log('Queried state:', state);
      return state;
    },
  },
  ConfigState: {
    schemaFile: (state: ConfigState) => state.schemaFile,
  },
  CrowdState: {
    stats: (state: CrowdState) => state.stats,
  },
  TaskState: {
    stats: (state: TaskState) => state.stats,
  },
  ResultState: {
    stats: (state: ResultState) => state.stats,
  },
  State: {
    config: state => state.config,
  },
  Subscription: {
    currentState: {
      subscribe: (parent, args, { unsullied, pubsub }) => {
        const it = pubsub.asyncIterator(STATE_CHANNEL);
        return it;
      },
    }
  },
  Mutation: {
    async registerWorker(parent, { name }, { unsullied }) {
      const worker = (unsullied as UnsulliedInterface).control.crowdControl.registerWorker({ name });

      return worker;
    },
  }
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
