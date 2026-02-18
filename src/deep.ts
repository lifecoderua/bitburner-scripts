/**
 * scan servers recursively and deploy scripts
 */

const RESERVED_HOME_RAM_GB = 100;

// import payload from './early-hack-template.js';
const visitedHosts = new Set(["home"]);
const exposedHosts = new Set(["home"]);
let ns: NS;
let payload: string = "early-hack-template.ts";
// let payload: string = "client.ts";
let args: any[] = ["earlyHackTemplate"];
let originalPayloadSha;

// gain control
function expose(host: string) {
  ns.print('## exposing ', host)
  if (ns.hasRootAccess(host)) {
    return;
  }

  let openPorts = 0;
  if (ns.fileExists("BruteSSH.exe")) {
      ns.brutessh(host);
      openPorts++;
  }
  if (ns.fileExists("FTPCrack.exe")) {
      ns.ftpcrack(host);
      openPorts++;
  }
  if (ns.fileExists("RelaySMTP.exe")) {
      ns.relaysmtp(host);
      openPorts++;
  }
  if (ns.fileExists("HTTPWorm.exe")) {
      ns.httpworm(host);
      openPorts++;
  }
  if (ns.fileExists("SQLInject.exe")) {
      ns.sqlinject(host);
      openPorts++;
  }
  if (ns.getServerNumPortsRequired(host) <= openPorts) {
    ns.nuke(host);
  }
  
  // TODO: plant backdoor? how?
}

// deploy and run payload
function deploy(host: string) {
  if (!ns.hasRootAccess(host)) {
    ns.print('PANIK ', host);
    return;
  }
  const homeRamAdjustment = host === 'home' ? RESERVED_HOME_RAM_GB : 0;

  ns.print('>> deploying ', host);
  exposedHosts.add(host);

  if (host === 'home') {
    // possibly doesn't work
    ns.kill('early-hack-template.ts', host, 'earlyHackTemplate');
  } else {
    ns.killall(host);
  }
  
  // ns.killall(host); // reset old scripts
  const scriptRam = ns.getScriptRam(payload);
  const maxRam = ns.getServerMaxRam(host) - homeRamAdjustment;
  //  - ns.getServerUsedRam(serverName);
  const treads = Math.floor(maxRam / scriptRam);
  if (treads > 0) {
    ns.scp(payload, host); // is it required? Does it use local on exec?
    // ns.exec("early-hack-template.script", serverName, 1, "n00dles"); // - parameterized
    ns.exec(payload, host, treads, ...args);
  }
}

function scanAndRun(parentHost?: string) {
  const hosts = ns.scan(parentHost);
  
  for (let host of hosts) {
    if (visitedHosts.has(host)) {
      continue;
    }

    ns.print('Enter ', host);
    visitedHosts.add(host);
    expose(host);
    deploy(host);
    
    scanAndRun(host);
  }
}

export async function main(theNS: NS) {
  ns = theNS;
  visitedHosts.clear();
  visitedHosts.add('home');
  // ns.alert(JSON.stringify(visitedHosts.keys()));

  exposedHosts.clear();
  exposedHosts.add('home');

  // TODO: -f flag to force override
  // TODO: infinite loop to repopulate
  // TODO: ? compare local and remote script
  // ns.read(payload);

  scanAndRun();
  deploy('home'); // update home pool

  const exposedHostsList = [...exposedHosts.keys()];
  if (!Math.bb) {
    Math.bb = {
      serverPool: [],
    };
  }
  Math.bb.serverPool = exposedHostsList;
  ns.toast(`Deep scan: ${JSON.stringify(exposedHostsList)}`);

  // await ns.sleep(60*1000);
}