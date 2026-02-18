let wrap: { ns: NS };

export function main(ns: NS) {
  wrap = { ns };

  ns.ui.openTail();

  shouldRunWarfare();
}

function shouldRunWarfare() {
  const { ns } = wrap;

  const gangsInfo = ns.gang.getOtherGangInformation();
  const playerGangName = ns.gang.getGangInformation().faction;
  const gangNames = Object.keys(gangsInfo).filter((name) => name !== playerGangName);
  const chances: number[] = gangNames.map((gangName) => {
    return ns.gang.getChanceToWinClash(gangName);
  });
  // DEBUG
  ns.print(`Clash win chances: ${chances}`);

  const shouldEngageWarfare = !chances.some((chance) => chance < 0.9);
  ns.print(`Should engage Warfare: ${shouldEngageWarfare}`);
  return shouldEngageWarfare;
}