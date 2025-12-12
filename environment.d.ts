declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DISCORD_TOKEN: string;
      guildId: string;
      environment: 'dev' | 'prod' | 'debug';
    }
  }
}

export {};
