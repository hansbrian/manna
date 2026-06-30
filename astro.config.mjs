import { defineConfig } from "astro/config";
import node from "@astrojs/node";

export default defineConfig({
  output: "server",
  adapter: node({
    mode: "standalone",
  }),
  // Disable CSRF origin check — the node standalone server sees an internal
  // host (localhost/Docker network) that never matches the browser's Origin
  // header. This is a stateless contact form with no authentication, so the
  // check adds no real protection here.
  security: {
    checkOrigin: false,
  },
});
