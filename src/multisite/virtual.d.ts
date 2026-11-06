/** Build-time facts about the site being built, provided by the multisite integration. */
declare module 'virtual:multisite' {
  /** SITE_ID of this build. */
  export const siteId: string;
  /** Keep this deployment out of search engines (robots.txt + meta robots): SITE_NOINDEX or a preview branch. */
  export const noindex: boolean;
}
