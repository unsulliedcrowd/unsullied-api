import * as redis from 'redis';
import * as md5 from 'md5';

import { UnsulliedConfig } from '../..';

export interface Store<V> {
  has: (key: string) => Promise<boolean>
  get: (key: string) => Promise<V>
  set: (key: string, value: V) => Promise<V>
  getAll: () => Promise<V[]>
};

export class RedisStore<V> implements Store<V> {
  client: any;
  prefix: string;

  constructor(config: UnsulliedConfig, prefix = "") {
    // this.client = redis.createClient(config.redisUrl);
    this.prefix = prefix;
  }

  hashKey(key: string): string {
    return "__UnsulliedRedisStore__" + this.prefix + md5(key);
  }

  async has(key: string): Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      this.client.exists(this.hashKey(key), (err, res) => {
        if (err) return reject(err);
        console.log(`${this.hashKey(key)} in cache:`, res);
        return resolve(!!res);
      })
    });
  }

  async get(key: string, destringify: (str: string) => V = JSON.parse): Promise<V> {
    // console.log(`Getting ${key} from cache`);
    return new Promise<V>((resolve, reject) => {
      this.client.get(this.hashKey(key), (err, res) => {
        if (err) return reject(err);
        console.log("Just got:", res);
        return resolve(destringify(res));
      })
    });
  }

  async set(key: string, value: V, stringify: (value: V) => string = JSON.stringify): Promise<V> {
    // console.log(`Caching ${key}`);
    return new Promise<V>((resolve, reject) => {
      this.client.set(this.hashKey(key), stringify(value), (err, res) => {
        if (err) return reject(err);
        console.log("Just set:", value);
        return resolve(value);
      })
    });
  }

  async getAll(destringify: (str: string) => V = JSON.parse): Promise<V[]> {
    // console.log(`Getting ${key} from cache`);
    return new Promise<V[]>((resolve, reject) => {
      this.client.keys("__UnsulliedRedisStore__" + this.prefix + "*", (err, keys) => {
        this.client.mget(keys, (err, res) => {
          if (err) return reject(err);
          console.log("Just got:", res);
          return resolve(res.map(r => destringify(r)));
        })
      })
    });
  }

}
