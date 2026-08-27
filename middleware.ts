import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/* Routes are case sensitive, so /Connor was a 404 while /connor worked.
   Anything typed or shared with capitals now redirects to the real path
   rather than dying. API routes, assets and files are left alone. */

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const lower = pathname.toLowerCase();
  if (lower === pathname) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = lower;
  return NextResponse.redirect(url, 308);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
