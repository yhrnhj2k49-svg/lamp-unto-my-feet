// One place that decides which words a passage is shown in, so a reading, a
// follow-up and a kept passage never disagree.

import { useMemo } from "react";
import { passageIn } from "./lookup";
import { useBibleState } from "./store";
import { DEFAULT_VERSION, useVersion } from "../store/version";

export type ShownText = {
  text: string;
  /** The translation these words are actually from. */
  version: string;
  /** True when another translation was chosen but this passage is not in it. */
  fellBack: boolean;
};

export function usePassageText(ref: string, kjv: string): ShownText {
  const { value: chosen } = useVersion();
  // Installing a translation must re-render passages already on screen.
  const { installed } = useBibleState();

  return useMemo(() => {
    if (chosen === DEFAULT_VERSION) return { text: kjv, version: DEFAULT_VERSION, fellBack: false };
    const found = installed.includes(chosen) ? passageIn(chosen, ref) : null;
    return found
      ? { text: found, version: chosen, fellBack: false }
      : { text: kjv, version: DEFAULT_VERSION, fellBack: true };
  }, [chosen, installed, ref, kjv]);
}
