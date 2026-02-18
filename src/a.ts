import { echo } from './b.js'
import { tsecho } from './lib/c'

export function main(ns: NS) {
  echo();
  tsecho(ns);
}