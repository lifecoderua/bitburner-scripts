export async function main(ns: NS) {
  const augs = ns.grafting.getGraftableAugmentations();
  // ns.grafting.waitForOngoingGrafting();
  ns.alert(JSON.stringify(augs));
}