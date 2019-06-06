import test from 'ava';
import * as Unsullied from '../dist';

test("It works", t => {
  return t.not(Unsullied, undefined);
});
