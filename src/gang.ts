let wrap: { ns: NS };

const KARMA_REQUIRED = -54_000;
const ASCEND_THRESHOLD = 1.7;
const EQUIPMENT_FUNDS_THRESHOLD_DIVIDER = 120;
const WARFARE_STR_THRESHOLD = 10000
const PLAYER_GANG = 'Slum Snakes';
const WORK_STR_THRESHOLD = 200_000;
const WORK_STR_MAX = 500_000;    // where chance reaches MIN_CHANCE
const TRAIN_MIN_CHANCE = 0.10;    // floor (10%)
const TRAIN_BASE_CHANCE = 0.50;   // chance at threshold

enum TASKS {
  TRAIN = 'Train Combat',
  GROW = 'Terrorism',
  PREPARE_WARFARE = 'Territory Warfare',
  WORK = 'Human Trafficking',
}

export async function main(ns: NS) {
  wrap = { ns };

  ns.ui.openTail();

  await ensureGang();

  warfareStatus();

  const stubData = {
    "myGang":{"faction":"Tetrads","isHacking":false,"moneyGainRate":0,"power":1352.3793967943977,"respect":1.000000003608875,"respectGainRate":0,"respectForNextRecruit":null,"territory":0.36089603555616256,"territoryClashChance":0,"territoryWarfareEngaged":false,"wantedLevel":1106.816453254841,"wantedLevelGainRate":0,"wantedPenalty":0.0009026766127796247},
    "gangs":{"Slum Snakes":{"power":1394.695522199163,"territory":0},"Tetrads":{"power":1352.3793967943977,"territory":0.36089603555616256},"The Syndicate":{"power":1289.2062671689494,"territory":0},"The Dark Army":{"power":1286.6673356832464,"territory":0},"Speakers for the Dead":{"power":24.517234677101232,"territory":0.17504625817097036},"NiteSec":{"power":1356.7880267714725,"territory":0},"The Black Hand":{"power":202.6483409647493,"territory":0.4640577062728671}}
  }

  while (true) {
    ensureHiring();
    ascend();
    supplyEquipment();
    assignJobs();
    await ns.sleep(10000);
  }
}

async function ascend() {
  const { ns } = wrap;

  const gangsters = ns.gang.getMemberNames();

  gangsters.forEach((name) => {
    const { str } = ns.gang.getAscensionResult(name) || { str: 0 };
    if (str > ASCEND_THRESHOLD) {
      ns.gang.ascendMember(name);
      ns.print(`Ascended ${name}`);
    }
  })
}

async function ensureGang() {
  const { ns } = wrap;

  while (!ns.gang.inGang()) {
    if (ns.getPlayer().karma < KARMA_REQUIRED) {
      ns.gang.createGang(PLAYER_GANG);      
    }
    await ns.sleep(10000);
  }
}

function getJobStage() {
  const { ns } = wrap;

  const gangsters = ns.gang.getMemberNames();
  const gang = ns.gang.getGangInformation();

  // TODO extract magic number
  if (gangsters.length < 12) {
    // TODO extract enum
    return 'grow';
  }

  if (gang.territory < 1 && gang.territoryClashChance === 0) {
    return 'prepareWarfare'
  }

  // default
  // TODO extract enum
  return 'freelance'
}

function shouldWork(str: number): boolean {
  if (str <= WORK_STR_THRESHOLD) return false;
  const x = Math.min(1, (str - WORK_STR_THRESHOLD) / (WORK_STR_MAX - WORK_STR_THRESHOLD)); // 0..1
  const t = Math.log10(1 + 9 * x); // maps 0..1 -> 0..1 with a logarithmic decay
  const trainChance = TRAIN_MIN_CHANCE + (TRAIN_BASE_CHANCE - TRAIN_MIN_CHANCE) * (1 - t);
  const workChance = 1 - trainChance;
  return Math.random() < workChance;
}

async function assignJobs() {
  const { ns } = wrap;

  const gangsters = ns.gang.getMemberNames();
  // TODO: StageSelector
  const stage = getJobStage();

  gangsters.forEach((name) => {
    let task = TASKS.TRAIN;
    const mob = ns.gang.getMemberInformation(name);
    if (stage === 'grow' && mob.str > 2000) {
      task = TASKS.GROW;
    }
    if (stage === 'prepareWarfare' && mob.str > WARFARE_STR_THRESHOLD) {
      task = TASKS.PREPARE_WARFARE;
    }
    if (stage === 'freelance' && shouldWork(mob.str)) {
      task = TASKS.WORK;
    }
    ns.gang.setMemberTask(name, task);
  })
}

async function warfareStatus() {
  const { ns } = wrap;

  const myGang = ns.gang.getGangInformation();
  const gangs = ns.gang.getOtherGangInformation();

  ns.print(JSON.stringify({
    myGang, 
    gangs,
  }));

  // ns.gang.setTerritoryWarfare()
}

async function ensureHiring() {
  const { ns } = wrap;
  
  while(ns.gang.canRecruitMember()) {
    const recruited = ns.gang.getMemberNames();
    ns.gang.recruitMember(`mobPsycho${recruited.length + 1}`)
  }
}

// TODO: optimize - prevent loops once supplied
async function supplyEquipment() {
  const { ns } = wrap;
  const funds = ns.getPlayer().money;
  const fundsThreshold = funds / EQUIPMENT_FUNDS_THRESHOLD_DIVIDER;

  const gangsters = ns.gang.getMemberNames();

  const equipNames = ns.gang.getEquipmentNames();
  ns.disableLog('gang.purchaseEquipment');

  let purchaseResult = true;

  ns.print(`EQUIP: ${equipNames}`);

  // without a loop it exits on veryfirst purchase
  while (purchaseResult) {
    purchaseResult = false;

    equipNames.forEach((equipName) => {
      const cost = ns.gang.getEquipmentCost(equipName);
      if (cost < fundsThreshold) {
        gangsters.forEach((name) => {
          purchaseResult ||= ns.gang.purchaseEquipment(name, equipName);
        })
      }
    })
  }
}