/**
 * A script that runs while the HTML is parsed, before the first paint (see Next's "Preventing flash before
 * hydration" guide). It's `text/javascript` in the server HTML and `text/plain` when React renders it on the
 * client, so it never runs twice and React doesn't warn about rendering a <script>.
 */
export const InlineScript = ({ html }: { html: string }) => (
  <script
    type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: html }}
  />
);
