import type { NS as ExportedNS } from "../NetscriptDefinitions";

declare global {
  /** Project-global alias for the exported `NS` type from `NetscriptDefinitions.d.ts` */
  type NS = ExportedNS;
}

export {};
