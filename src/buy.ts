let ns: NS;

export async function main(globalNs: NS) {
  ns = globalNs;
  const limit = ns.getPurchasedServerLimit(); // 25
  const maxRam = ns.getPurchasedServerMaxRam(); // 1048576
  // TODO: real bottom limit is `2Gb`, but the script is bigger, 
  //   would only work with an external scheduler
  const MIN_RAM = 4;
  // const upgradeCost = ns.getPurchasedServerUpgradeCost(hostname, ram);
  // ns.purchaseServer(hostname, ram); // pow 2 .. 2^20
  // ns.getPurchasedServerCost(ram)
  //ns.upgradePurchasedServer(hostname, ram)
  // await ns.sleep(60 * 1000);
  // ns.alert(`Limit: ${limit}; \n MaxRAM: ${maxRam};\n Owned: ${servers.length}`);
  

  while (true) {
    let servers = ns.getPurchasedServers();
    const purchasableLimit = servers.length - limit;

    ns.toast(`PurchaseLimit: ${purchasableLimit}`)
    if (purchasableLimit) {
      // buy max servers; 2.5m
      for (let i = servers.length; i < limit; i++) {
        // ns.purchaseServer(`s${i+1}`, maxRam);
        const done = ns.purchaseServer(`s${i}`, MIN_RAM);

        // ns.toast(`Server bought? = ${done}`);
      }

      ns.exec('deep.ts', 'home');
    }
    
    servers = ns.getPurchasedServers();
    // ns.alert(`Servers: ${servers}`)

    // const availableFunds = ns.getPlayer().money;

    let upgradable = canUpgrade();

    // ns.alert(`Can upgrade ${upgradable}`);
    // while (upgradable) {
    if (upgradable) {  
      // upgrade max
      const currentRam = getCurrentRam();
      const nextRam = currentRam * 2;
      // const upgradeCost = ns.getPurchasedServerUpgradeCost(servers[0], nextRam);
      // const maxUpgradeCost = ns.getPurchasedServerUpgradeCost(servers[0], maxRam);
      // ns.alert(`UpgradeCost: ${upgradeCost} of ${availableFunds} (${nextRam}) / ${maxUpgradeCost}`);

      for (let host of servers) {
        ns.upgradePurchasedServer(host, nextRam);
      }
      
      ns.toast(`Upgraded RAM to ${ns.formatRam(getCurrentRam())}`);
      
      ns.exec('deep.ts', 'home');

      upgradable = canUpgrade();
    }


    if (!upgradable) {
      await ns.sleep(60000);
    }
  }
  // money example
  // 23407384257.787403
  //  3590400000

  // const proceed = await ns.prompt('Buy?');
  // ns.alert(`Proceed = ${proceed}`);
}

function getCurrentRam() {
  const servers = ns.getPurchasedServers();

  return ns.getServerMaxRam(servers[0]);
}

function canUpgrade() {
  const servers = ns.getPurchasedServers();
  if (!servers.length) {
    return false;
  }
  // const maxRam = ns.getPurchasedServerMaxRam();
  const currentRam = ns.getServerMaxRam(servers[0]);
  const nextRam = currentRam * 2;
  const upgradeCost = ns.getPurchasedServerUpgradeCost(servers[0], nextRam);
  const availableFunds = ns.getPlayer().money;

  if (currentRam === nextRam) { return false; }

  return upgradeCost * servers.length * 4 <= availableFunds;
}