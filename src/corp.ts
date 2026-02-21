const CORP_NAME = 'GooCORP';
const SELF_FUNDED = true; // TODO: allow to override on BN3

declare global {
  interface Math { bb: any; }
}

export type CityName = "Aevum"|"Chongqing"|"Sector-12"|"New Tokyo"|"Ishima"|"Volhaven";

// TODO: extract and import from shared
const cities: CityName[] = [
  "Aevum",
  "Chongqing",
  "Sector-12",
  "New Tokyo",
  "Ishima",
  "Volhaven",
];

export async function main(ns: NS) {
  Math.bb.ns = ns;
  ns.ui.openTail();
  
  // open Corp
  await setupCorp();
  
  await stage1();
}

async function setupCorp() {
  const ns: NS = Math.bb.ns;

  ns.print(`hasCorp: ${ns.corporation.hasCorporation()}`)

  if (ns.corporation.hasCorporation()) {
    return;
  }

  while (!ns.corporation.canCreateCorporation(true)) {
    await ns.sleep(10_000);
  }
  ns.print('1')
  ns.corporation.createCorporation('GooCORP', true);
  ns.print('2')
}

async function upgradeOfficeSize(divisionName: string, targetSize = 4) {
  Math.bb.ns.print('UPGRADE IN');
  const ns: NS = Math.bb.ns;

  ns.print('UPGRADE IN');
  cities.forEach((city) => {
    ns.print(`${city}`);
    const office = ns.corporation.getOffice(divisionName, city);
    const extraSize = targetSize - office.size;
    ns.print(`${office.size} => +${extraSize}`);
    if (extraSize <= 0) {
      return;
    }

    const upgradeCost = ns.corporation.getOfficeSizeUpgradeCost(divisionName, city, extraSize);
    ns.print(`UPGRADING ${city}: +${extraSize} for ${ns.formatNumber(upgradeCost)}`);
    ns.corporation.upgradeOfficeSize(divisionName, city, extraSize);
    ns.corporation.hireEmployee(divisionName, city);
  });
}

function expandAllCitites(divisionName: string) {
  const ns: NS = Math.bb.ns;

  const alreadyExpanded = ns.corporation.getDivision(divisionName).cities as CityName[];

  cities
    .filter((city) => !alreadyExpanded.includes(city))  
    .forEach((city) => {
      ns.corporation.expandCity(divisionName, city)
    });
}

/**
 * Lifecycle STAGES
 * 
 * Get to the desired state, stabilize, gather investments;
 */

async function stage1() {
  const ns: NS = Math.bb.ns;
  const divisionName = 'Agro';

  // TODO: use check instead
  try {
    ns.corporation.expandIndustry('Agriculture', divisionName);  
  } catch (e) {}
  expandAllCitites(divisionName);

  ensureBoostMaterials([
    { name: 'Real Estate', amount: 10 },
  ])
  // TODO: Make it in stages
  // TODO: Make stages declarative ([resource: count]) and idempotent (should survive restart).
  
  // TODO: !!! RE-ENABLE
  // await upgradeOfficeSize(divisionName, 4);
}

// TODO: autoSupply / calc reqs, balance remains

type BoostMaterialRequest = {
  name: string,
  amount: number,
}

function ensureBoostMaterials(boostMaterials: BoostMaterialRequest[]) {
  const ns: NS = Math.bb.ns;
  const divisionName = 'Agro';

  boostMaterials.forEach((materialRequest) => {
    cities.forEach((city) => {
      const presentMaterial = ns.corporation.getMaterial(divisionName, city, materialRequest.name);
      
      if (presentMaterial.stored >= materialRequest.amount) { return; }

      ns.corporation.buyMaterial(divisionName, city, materialRequest.name, materialRequest.amount / 10);
    })
  })
}