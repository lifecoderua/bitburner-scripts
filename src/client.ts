declare global {
  interface Math { bb: any; }
}

/**
 * Headless client, runs the arg method from Math.bb
 */
export async function main(ns: NS) {
  const alloc = ns.weaken; // fix dynamic allocation check
  const methodName = ns.args[0] as 'hack'|'grow'|'weaken';
  const timeout = parseInt(ns.args[1] as string);
  // const method = Math.bb[methodName].use;
  const method = ns[methodName];
  const hostName = Math.bb.highestHost; // || 'phantasy';
  // ns.toast(`?? ${JSON.stringify(Math.bb)}`, undefined, 20000)

  ns.toast(`CLIENT: ${hostName}, ${ns.args[0]}, ${ns.args[1]}`, undefined, 4000);
  
  // with HGW options
  // await method(Math.bb.tagretHost, { additionalMsec: timeout });
  await method(hostName);
}