import { PrivyClient } from "@privy-io/server-auth";

/* ============================================================
   WHO IS ASKING

   Sponsors sign in with Privy using the email they paid with. The
   client sends its Privy access token; nothing about identity is
   taken from the request body.
   ============================================================ */

const APP_ID = process.env.NEXT_PUBLIC_PRIVY_APP_ID;
const APP_SECRET = process.env.PRIVY_APP_SECRET;

export function privyConfigured(): boolean {
  return Boolean(APP_ID && APP_SECRET);
}

let client: PrivyClient | null = null;
function privy(): PrivyClient {
  if (!client) client = new PrivyClient(APP_ID as string, APP_SECRET as string);
  return client;
}

export type Viewer = {
  userId: string;
  email: string;
  isAdmin: boolean;
};

export function isAdminEmail(email: string): boolean {
  const allowed = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

/** Verify the bearer token and resolve it to a verified email address.
 *  Returns null for anything that does not check out. */
export async function viewerFrom(req: Request): Promise<Viewer | null> {
  if (!privyConfigured()) return null;

  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;

  try {
    const claims = await privy().verifyAuthToken(token);
    const user = await privy().getUser(claims.userId);
    const email = (user.email?.address ?? "").trim().toLowerCase();
    if (!email) return null;
    return { userId: claims.userId, email, isAdmin: isAdminEmail(email) };
  } catch {
    return null;
  }
}
