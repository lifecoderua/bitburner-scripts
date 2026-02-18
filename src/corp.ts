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
  await upgradeOfficeSize('Agro', 4);
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