//@ts-nocheck
let doc: Document = eval('document');

function elementByText(text: string): HTMLElement|null {
  const xpath = `//*[text()[contains(.,'${text}')]]`;
  
  return doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLElement;
}

function clickBypassed(element: HTMLElement) {
    const propsName = Object.keys(element).find((v) => v.startsWith("__reactProps$")) as string;
    // @ts-ignore
    const click = element[propsName].onClick
    const event = {
        target: element,
        currentTarget: element,
        bubbles: true,
        cancelable: true,
        type: 'click',
        isTrusted: true
    };
    // @ts-ignore
    click(event);
}

function initCoinStats() {
  if (Math?.bb?.coinStats) {
    return;
  }

  if (!Math.bb) {
    Math.bb = {};
  }

  Math.bb.coinStats = [];
  Math.bb.coinPointer = 0;
}

function setStatAndIncrement(val: 'H'|'T') {
  const {coinStats, coinPointer} = Math.bb;
  coinStats[coinPointer] = val;
  Math.bb.coinPointer = (Math.bb.coinPointer + 1) % 1024;
}

function getStatAndIncrement() {
  const {coinStats, coinPointer} = Math.bb;
  const entry = coinStats[coinPointer];
  Math.bb.coinPointer = (Math.bb.coinPointer + 1) % 1024;

  return entry;
}

function getStats() {
  const {coinStats} = Math.bb;

  return coinStats;
}

function getCoinPointer() {
  return Math.bb.coinPointer;
}

function isStatsPopulated() {
  return getStats().length === 1024;
}

export async function main(ns: NS) {
  initCoinStats();
  const doc: Document = eval('document');

  let bet = 1;
  // window.document.get
  // const xpath = "//a[text()='SearchingText']";
  const xpath = "//p[text()='City']";
  const target = doc.evaluate(xpath, doc, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  // ns.toast(`Head: ${w('button')}`)
  target?.click();

  doc.querySelector('[aria-label="Iker Molina Casino"]')?.click();
  elementByText('Play coin flip')?.click();
  doc.querySelector('input').value = '1';

  const heads = elementByText('Head!');
  const tails = elementByText('Tail!');

  while (!isStatsPopulated()) {
    await ns.sleep(260);

    clickBypassed(heads);
    const result = elementByText('win!') ? 'H' : 'T';
    setStatAndIncrement(result);
  }

  ns.toast(`Coin flip stats populated? = ${isStatsPopulated()}`);

  // const match = [];
  bet = 1000; //coin flip max bet
  doc.querySelector('input').value = bet;

  // bet = Math.ceil(ns.getPlayer().money / 2) + 1;
  for (let i = 0; i < 10000; i++) {
    await ns.sleep(260);

    const expectedStatus = getStatAndIncrement();
    const targetButton = expectedStatus === 'H' ? heads : tails;
    ns.toast(expectedStatus, undefined, 10_000);
    clickBypassed(targetButton);

    const isWin = !!elementByText('win!');
    
    if (!isWin) {
      ns.alert('Coin flip expectation failed!');
      break;
    }
    
    // match[i] = result === getStatAndIncrement();
  }
  // ns.toast(`Match list: ${match}`);

  // ns.toast(`I => ${getStats()}`);  
}