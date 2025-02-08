export interface Config {
  character: {
    postExamples: string[];
    settings: {
      secrets: Partial<{
        DISCORD_APPLICATION_ID: string;
        DISCORD_API_TOKEN: string;
        TWITTER_USERNAME: string;
        TWITTER_PASSWORD: string;
        TWITTER_EMAIL: string;
        TWITTER_2FA_SECRET: string;
        TELEGRAM_BOT_TOKEN: string;
        ELEVENLABS_MODEL_ID: string;
        ELEVENLABS_VOICE_ID: string;
      }>;
    };
  };
}
