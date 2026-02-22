const PARTY_COST_PER_EMPLOYEE = 20_000;

export async function main(ns: NS) {
  Math.bb.ns = ns;
  ns.ui.openTail();
  
  await keepEveryoneHappy();
}


async function keepEveryoneHappy() {
  const ns: NS = Math.bb.ns;
  
  while (true) {
    if (!ns.corporation.hasCorporation()) {
      await ns.sleep(1_000);
      continue;
    }

    const divisions = ns.corporation.getCorporation().divisions;

    divisions.forEach((division) => {
      const branch = ns.corporation.getDivision(division);
      branch.cities.forEach((city) => {
        const office = ns.corporation.getOffice(division, city);

        if (office.avgEnergy < 100) {
          ns.corporation.buyTea(division, city);
        }
        if (office.avgMorale < 100) {
          ns.corporation.throwParty(division, city, PARTY_COST_PER_EMPLOYEE);
        }
      })
    });

    await ns.sleep(1_000);
  }
}