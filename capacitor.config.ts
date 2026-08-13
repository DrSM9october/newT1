import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.linguaai.dialect",
  appName: "LinguaAI",
  webDir: "dist",
  server: { androidScheme: "https", cleartext: false },
};

export default config;
