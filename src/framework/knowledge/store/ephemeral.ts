const rdf = require('rdf');

import { Schema } from '..';

import { Store } from '.';

export class EphemeralStore<V> implements Store<V> {
  schema: Schema;
  graph: any;

  constructor(schema: Schema) {
    // this.client = redis.createClient(config.redisUrl);
    this.schema = schema;
    // console.log(this.schema.graph.toArray());
    // this.graph = new rdf.Graph(this.schema.graph);
    this.graph = new rdf.Graph();
  }

  async has(key: string): Promise<boolean> {
    return false;
    // return new Promise<boolean>((resolve, reject) => {
    //   this.client.exists(this.hashKey(key), (err, res) => {
    //     if (err) return reject(err);
    //     console.log(`${this.hashKey(key)} in cache:`, res);
    //     return resolve(!!res);
    //   })
    // });
  }

  async get(key: string, destringify: (str: string) => V = JSON.parse): Promise<V> {
    return destringify("{}");
    // console.log(`Getting ${key} from cache`);
    // return new Promise<V>((resolve, reject) => {
    //   this.client.get(this.hashKey(key), (err, res) => {
    //     if (err) return reject(err);
    //     console.log("Just got:", res);
    //     return resolve(destringify(res));
    //   })
    // });
  }

  async set(key: string, value: V, stringify: (value: V) => string = JSON.stringify): Promise<V> {
    // const triples = [];
    // triples.reduce((graph, triple) => {
    //   const { subject, predicate, object } = triple;
    //   graph.add(rdf.environment.createTriple(subject, predicate, object));
    //   return graph;
    // }, );

    return value;

    // console.log(`Caching ${key}`);
    // return new Promise<V>((resolve, reject) => {
    //   this.client.set(this.hashKey(key), stringify(value), (err, res) => {
    //     if (err) return reject(err);
    //     console.log("Just set:", value);
    //     return resolve(value);
    //   })
    // });
  }

  async getAll(destringify: (str: string) => V = JSON.parse): Promise<V[]> {
    return [];
    // console.log(`Getting ${key} from cache`);
    // return new Promise<V[]>((resolve, reject) => {
    //   this.client.keys("__UnsulliedEphemeralStore__" + this.prefix + "*", (err, keys) => {
    //     this.client.mget(keys, (err, res) => {
    //       if (err) return reject(err);
    //       console.log("Just got:", res);
    //       return resolve(res.map(r => destringify(r)));
    //     })
    //   })
    // });
  }

}
