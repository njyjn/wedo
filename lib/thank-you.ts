// Pure rule for the post-wedding "message from the couple", shared by the pages and tests.

export type ThankYouView = "page" | "link" | null;

/**
 * Once the wedding day has passed, the home page becomes the thank-you page, unless the admin
 * turned the switch off ("0"), in which case the normal page stays and links to /thank-you.
 */
export function thankYouView(
  switchSetting: string,
  daysUntilEvent: number | null,
): ThankYouView {
  if (daysUntilEvent === null || daysUntilEvent >= 0) return null;
  return switchSetting.trim() === "0" ? "link" : "page";
}
