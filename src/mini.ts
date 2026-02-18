import { main as earlyHackTemplate } from 'src/early-hack-template.ts';
// import Stats from './stats.tsx';
import { main as deepScan } from 'src/deep.ts';

declare global {
  interface Math { bb: any; }
}

const homeSizeOffsetGb = 60;

export async function main(ns: NS) {
  // ns.alert(JSON.stringify(window));
  // window.bb = {};
  Math.bb = {
    ns,
    reservedHomeRam: 40 * (2**30),
    serverPool: new Set('home'),
    // targetHost: 'n00dles',
    targetHost: 'phantasy',
    hasFormulas: ns.fileExists("Formulas.exe"),
    // highestHost: 'n00dles',
    highestHost: 'phantasy',
    earlyHackTemplate: {
      use: earlyHackTemplate,
      size: ns.getScriptRam('early-hack-template.ts'),
    },
    client: {
      size: ns.getScriptRam('client.ts'),
    },
    // TODO: (?) add base client.ts size for calculation?
    hack: {
      use: ns.hack,
      size: ns.getFunctionRamCost('hack'),
    },
    weaken: {
      use: ns.weaken,
      size: ns.getFunctionRamCost('weaken'),
    },
    grow: {
      use: ns.grow,
      size: ns.getFunctionRamCost('grow'),
    },
    // hack: runner,
    x: 2,
    // orchestrate HGWG threads utilisation per hostName
    commands: {
      template: [
        {
          h: {threads: 12, },
          g: {}
        }
      ],
    }
  };

  // ns.alert(Math.bb.earlyHackTemplate.size);
  ns.toast(`'noice' ${Math.bb.client.size}; ${Math.bb.grow.size}; ${ns.getFunctionRamCost('toast')}`);
  // window.bb = function(ns: NS) {
  //   ns.alert('oh');
  // };
  // window.bb(ns);

  await stats();

  // Main infinite loop
  await cycleHost();
}

async function stats() {
  const ns: NS = Math.bb.ns;
  const { targetHost:host } = Math.bb;

  // ns.openTail();
  ns.ui.openTail();
  // await ns.sleep(10000);
  const list = new Array(10);

  const srv = ns.getServer(host);
  const { moneyMax, moneyAvailable } = srv;
  const growthRatioRequired = Math.ceil((moneyMax || 1) / (moneyAvailable || 1));
  const growth = ns.growthAnalyze(host, growthRatioRequired);

  // Weaken = 0.05 SECURITY per thread
  // ns.weakenAnalyze(2, 1),
  // Growth = 0.024 SECURITY / thread
  // 2 weakean / 1 growth

  await deepScan(ns);

  let serverRankedUnsorted: Record<string, number> = {};
  Math.bb.serverPool.forEach((hostName: string) => {
    serverRankedUnsorted[hostName] = getServerRank(hostName);
  })
  const serverRanked = Object.entries(serverRankedUnsorted)
    .sort(([,a],[,b]) => b-a);

  const statList = {
    host,
    // formulas: typeof ns.formulas?.hacking?.growThreads === 'function',
    hasFormulas: Math.bb.hasFormulas,
    exposedHosts: Math.bb.serverPool,
    growthRatioRequired,
    hostInfo: ns.getServer(host),
    moneyMax,
    moneyMaxFormatted: ns.formatNumber(moneyMax || 1), 
    moneyAvailable,
    serverRank: getServerRank(host),
    serverRanked,
    getWeakenTime: ns.getWeakenTime(host),
    getGrowTime: ns.getGrowTime(host),
    // weakenAnalyze: ns.weakenAnalyze(host),
    // d: ns.formulas.hacking.weakenTime()
    weakenAnalyze: list.map((_,i) => ns.weakenAnalyze(12, 1)),
    wa: ns.weakenAnalyze(2, 1),
    wa2: ns.weakenAnalyze(12, 1),
    growthAnalyze: growth, 
    growthAnalyzeSecurity: ns.growthAnalyzeSecurity(growth, host),
    // fxd: ns
  };
  
  ns.print(JSON.stringify(statList, undefined, 2));
}

function getServerRank(host: string) {
  const ns: NS = Math.bb.ns;
  const {
    serverGrowth,
    moneyMax,
    requiredHackingSkill,
  } = {
    serverGrowth: 1,
    moneyMax: 1,
    requiredHackingSkill: 1,
    ...ns.getServer(host)
  };

  const { skills } = ns.getPlayer();

  // hackTime + growTime + weakTime
  const hackTime = ns.getHackTime(host);
  const weakenTime = ns.getWeakenTime(host);
  const growTime = ns.getGrowTime(host);

  const pros = (serverGrowth * moneyMax * (skills.hacking - requiredHackingSkill * 1.5));
  const cons = (hackTime + growTime + weakenTime);

  return pros / cons;
}

async function cycleHost() {
  const ns: NS = Math.bb.ns;

  // test on the "home" only
  const exposedServers = ["home"];
  const states = ['W', 'G', 'W', 'H'];
  let phase = 0;
  let nextTime = 0;
  // TODO: may be over the top - but with 20/200 halts
  const DRIFT_TIME = 200; // extra pause
  const SLEEP_TIME = 2000;

  let debugRun = true;
  // WGWH
  while (debugRun) {
    // DEBUG early exit
    // debugRun = false;
    const host = Math.bb.targetHost;
    let server = ns.getServer(host);
    
    const hackTime = ns.getHackTime(host);
    const weakenTime = ns.getWeakenTime(host);
    const growTime = ns.getGrowTime(host);

    let initState = true;
    let threadsRemain = 0;

    ns.print(`Phase [${states[phase]}], threadsRemain [${threadsRemain}]`);

    switch (states[phase]) {      
      case 'W':
        if (initState) {
          threadsRemain = (ns.getServerSecurityLevel(host) - ns.getServerMinSecurityLevel(host)) / ns.weakenAnalyze(1, 1);
          initState = false;
        }
        threadsRemain -= await spawn('weaken', threadsRemain, nextTime);
        if (threadsRemain <= 0) {
          nextTime += weakenTime + DRIFT_TIME;
          threadsRemain = 0;
        }
        break;
      case 'G':
        if (initState) {
          threadsRemain = Math.bb.hasFormulas
            ? ns.formulas.hacking.growThreads(
              server,
              ns.getPlayer(),
              ns.getServerMaxMoney(host),
            )
            : ns.growthAnalyze(host, 1);
          initState = false;
        }
        threadsRemain -= await spawn('grow', threadsRemain, nextTime);
        if (threadsRemain <= 0) {
          nextTime += growTime + DRIFT_TIME;
          threadsRemain = 0;
        } 
        break;
      case 'H':
        if (initState) {
          // exhaust 50%
          // TODO: with formulas - mock host for max money
          const exhaustRate = 0.5;

          const hackPercent = Math.bb.hasFormulas
            ? ns.formulas.hacking.hackPercent(server, ns.getPlayer())
            : ns.hackAnalyze(host);
          threadsRemain = Math.ceil(exhaustRate / hackPercent);
          initState = false;
        }
        threadsRemain -= await spawn('hack', threadsRemain, nextTime);
        if ((server.moneyMax || 1) * 0.2 > (server.moneyAvailable || 1)) {
          threadsRemain = 0;
        }
        if (threadsRemain <= 0) {
          nextTime += hackTime + DRIFT_TIME;
          threadsRemain = 0;
        } 
        break;
    }
    
    if (threadsRemain > 0) {
      // thread supply is not fulfilled, wait for new workers
      await ns.sleep(SLEEP_TIME);
      nextTime = Math.max(nextTime - SLEEP_TIME, 0);
    } else {
      threadsRemain = 0;
      phase += 1;
      phase %= states.length;
      initState = true;
    }
  }
}

function getAvailableThreads(host: string, action: string, threadsRemains: number) {
  const ns: NS = Math.bb.ns;
  const { client } = Math.bb;

  // preserve xGb for home
  const homeOffset = host === 'home' ? homeSizeOffsetGb : 0;
  const scriptSize = client.size + Math.bb[action].size;
  const isGW = ['grow', 'weaken'].includes(action);

  const srv = ns.getServer(host);
  const freeRam = srv.maxRam - srv.ramUsed - homeOffset;
  const threadsMultiplier = isGW ? srv.cpuCores : 1;
  const maxHostVirtualThreads = threadsMultiplier * Math.floor(freeRam / scriptSize);
  const spawnVirtualThreadsCount = Math.min(maxHostVirtualThreads, threadsRemains);
  const spawnRealThreadsCount = Math.ceil(spawnVirtualThreadsCount / threadsMultiplier);

  return spawnRealThreadsCount;
}

/**
 * Spawn max available threads of command
 * 
 * timeShift - ms time shift, for hack/grow/weaken commands
 * 
 * return spawned threads count
 */
async function spawn(action: string, maxThreads: number, timeShift: number) {
  // for GW use ns.getServer(ns.getHostname()).cpuCores
  // TODO!!! iterate servers, call client.ts, HGW specifically
  const ns: NS = Math.bb.ns;
  // const { serverPool } = Math.bb;
  // TODO: DEBUG
  const serverPool = ['home']; 
  
  let threadsRemains = maxThreads;

  serverPool.forEach((host: string) => {
    const spawnRealThreadsCount = getAvailableThreads(host, action, threadsRemains);

    if (!threadsRemains || spawnRealThreadsCount <= 0) {
      return;
    }
    
    threadsRemains -= spawnRealThreadsCount;
    ns.exec('client.ts', host, spawnRealThreadsCount, action, timeShift);
  });
  
  const threadsSpawned = maxThreads - threadsRemains;

  return threadsSpawned;
}