/**
 * find the path to target
 */
// import payload from './early-hack-template.js';
const visitedHosts = new Set(["home"]);
let ns: NS;

export async function main(theNS: NS) {
  ns = theNS;
  visitedHosts.clear();
  visitedHosts.add('home');

  scanAndRun('home', [], ns.args[0] as string || 'run4theh111z');
}

function scanAndRun(parentHost: string, path: string[], target: string) {
  const hosts = ns.scan(parentHost);
  
  for (let host of hosts) {
    if (visitedHosts.has(host)) {
      continue;
    }

    visitedHosts.add(host);

    if (host === target) {
      ns.alert(['', ...path, parentHost, target].join('; connect '));
    }
    
    scanAndRun(host, [...path, parentHost], target);
  }
}