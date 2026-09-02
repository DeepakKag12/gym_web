/**
 * Signed-in "panel" routes — the admin, trainer and member work areas.
 * These render in the light theme (src/styles/panel.css) and get the solid
 * app bar; everything else is a public marketing page and stays dark.
 *
 * Listed explicitly rather than derived from the user's role, because a
 * logged-in member browsing /store is on a public page.
 */
export const PANEL_PREFIXES = ['/admin', '/trainer', '/dashboard', '/my-', '/notifications', '/settings'];

export function isPanelRoute(pathname) {
  return PANEL_PREFIXES.some(p => pathname.startsWith(p));
}
