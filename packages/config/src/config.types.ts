import { RedisOptions } from "ioredis";
import { DataSourceOptions as TypeOrmOptions } from "typeorm";
import { ApiClientOptions as TelegramOptions } from "grammy";

type BullMqOptions = Omit<RedisOptions, "keyPrefix">;

export interface IConfig {
  appName: string;
  appServer: {
    port: number;
    baseUrl: string;
  };
  appClient: {
    baseUrl: string;
  };
  telegramBot: {
    token: string;
    client: TelegramOptions;
  };
  typeOrmOptions: TypeOrmOptions;
  redisOptions: RedisOptions;
  bullMqOptions: BullMqOptions;
}
