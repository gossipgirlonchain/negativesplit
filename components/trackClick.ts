/** Tell the server a sponsor's link was followed, without delaying it.
 *  sendBeacon survives the page going away, which a fetch may not. */
export function trackClick(position: string, board: string): void {
  try {
    const body = JSON.stringify({ position, board });
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/click", new Blob([body], { type: "application/json" }));
      return;
    }
    void fetch("/api/click", { method: "POST", body, keepalive: true });
  } catch {
    /* counting must never block the click */
  }
}
