"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import type { ReactNode } from "react";

/* Mounted only on /sponsor and /admin. The public page never loads the
   Privy bundle. */

export default function PrivyClientProvider({
  appId,
  children,
}: {
  appId: string;
  children: ReactNode;
}) {
  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: ["email"],
        appearance: {
          theme: "light",
          accentColor: "#FF2D55",
          logo: undefined,
        },
      }}
    >
      {children}
    </PrivyProvider>
  );
}
