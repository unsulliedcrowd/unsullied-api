export interface Store<V> {
  has: (key: string) => Promise<boolean>
  get: (key: string) => Promise<V>
  set: (key: string, value: V) => Promise<V>
  getAll: () => Promise<V[]>
};

export * from './ephemeral';
export * from './redis';
