let ns: NS;

export async function main(globalNs: NS) {
  ns = globalNs;

  ns.ui.openTail();
  ns.print(`${ns.getPlayer().karma}`);
  ns.print(ns.heart.break());

  const host = 'crush-fitness';
  const stats = {
    growTime: ns.getGrowTime(host),
    weakenTime: ns.getWeakenTime(host),
    hackTime: ns.getHackTime(host),
    growThreads: ns.formulas.hacking.growThreads(ns.getServer(host), ns.getPlayer(), ns.getServerMaxMoney(host), 1)
  };

  // ns.alert(JSON.stringify(stats, undefined, 2));
}