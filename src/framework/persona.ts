export type Persona = {
  age: number,
  location: string,
  eagerness: string,
  knowledgeDomains: string[],
};

export module Persona {
  export const DEFAULT = {
    age: -1,
    location: "<unkown>",
    eagerness: "<unkown>",
    knowledgeDomains: []
  };
};
