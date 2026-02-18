export async function main(ns: NS) {
  const host = 'phantasy';
  const ha = ns.hackAnalyze(host);
  const server = ns.getServer(host);

  ns.ui.openTail();
  ns.print(`analyze: ${ha}; ${server.moneyAvailable} / ${server.moneyMax}`);
}