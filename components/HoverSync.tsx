"use client";

/* The drawing and the list are separate components in separate parts of
   the page, but hovering either one has to light up the other. This is
   the shared state that lets them talk without either reaching into the
   other's DOM. `active` is a zone id, matching Position.target. */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type HoverState = {
  active: string | null;
  setActive: (target: string | null) => void;
};

const HoverContext = createContext<HoverState>({
  active: null,
  setActive: () => {},
});

export function HoverProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const value = useMemo(() => ({ active, setActive }), [active]);
  return <HoverContext.Provider value={value}>{children}</HoverContext.Provider>;
}

export function useHover(): HoverState {
  return useContext(HoverContext);
}

/** Handlers shared by a drawing zone and its list row, so both
 *  highlight in exactly the same way. */
export function hoverHandlers(target: string, setActive: HoverState["setActive"]) {
  return {
    onMouseEnter: () => setActive(target),
    onMouseLeave: () => setActive(null),
    onFocus: () => setActive(target),
    onBlur: () => setActive(null),
  };
}
