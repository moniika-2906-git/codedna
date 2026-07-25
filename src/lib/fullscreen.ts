/**
 * Requests fullscreen on the document root. Must be called synchronously
 * within a user-gesture handler (e.g. a button click) — most browsers reject
 * `requestFullscreen()` calls that aren't tied to user activation.
 *
 * Returns true if fullscreen was entered, false otherwise (denied, no
 * fullscreen API, or the browser rejected the request for any reason). Never
 * throws — proctoring's fullscreen requirement is enforced by the caller
 * checking this return value, not by an exception.
 */
export async function requestFullscreen(): Promise<boolean> {
  if (typeof document === "undefined") return false;
  if (document.fullscreenElement) return true;
  if (!document.documentElement.requestFullscreen) return false;
  try {
    await document.documentElement.requestFullscreen();
    return !!document.fullscreenElement;
  } catch {
    return false;
  }
}
