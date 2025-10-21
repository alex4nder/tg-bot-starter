import { getEnvVarOrThrow } from "../helpers";
import { IConfig } from "../config.types";

export const defaultConfig: IConfig = {
  appName: "TG Bot Starter",
  appServer: {
    port: 3001,
    baseUrl: `http://localhost:3001`,
  },
  appClient: {
    baseUrl: "http://127.0.0.1:8080",
  },
  telegramBot: {
    token: getEnvVarOrThrow("TG_BOT_TOKEN"),
    client: { environment: "test" },
  },
  typeOrmOptions: {
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "telegram_bot_starter_user",
    password: "telegram_bot_starter_password",
    database: "telegrambotstarterdb",
    schema: "dev",
    synchronize: false,
  },
  redisOptions: { host: "localhost", port: 6379, keyPrefix: "tg-bot-starter:" },
  bullMqOptions: { host: "localhost", port: 6379 },
};
