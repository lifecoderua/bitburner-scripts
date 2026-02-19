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
  
  // TODO: Make it in stages
  // TODO: Make stages declarative ([resource: count]) and idempotent (should survive restart).
  await upgradeOfficeSize('Agro', 4);
}

async function setupCorp() {
  const ns: NS = Math.bb.ns;

  if (ns.corporation.hasCorporation()) {
    return;
  }

  while (!ns.corporation.canCreateCorporation(true)) {
    await ns.sleep(10_000);
  }
  ns.corporation.createCorporation('GooCORP', true);
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