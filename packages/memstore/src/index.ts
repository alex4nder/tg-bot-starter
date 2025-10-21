/* eslint-disable @typescript-eslint/no-extraneous-class */
import { config } from "@repo/config";
import { logger } from "@repo/logger";
import Redis from "ioredis";

interface RedisSetOptions {
  key: string;
  value: string;
  ttl?: number;
  expirationType?: string;
}

const { redisOptions } = config;
export const redis = new Redis(redisOptions);

enum EExpirationType {
  EX = "EX",
  PX = "PX",
}

async function initialize() {
  if (redis.status === "ready") return;

  await new Promise<void>((resolve) => {
    redis.on("ready", resolve);
  });
}

export default class MemStore {
  static async set({
    key,
    value,
    ttl,
    expirationType = EExpirationType.EX,
  }: RedisSetOptions): Promise<boolean> {
    await initialize();

    try {
      const args: (string | number)[] = [key, value];
      if (ttl) args.push(expirationType, ttl);
      await redis.set(...(args as Parameters<typeof redis.set>));
      return true;
    } catch (error) {
      logger.error(`Error setting value in Redis for key "${key}":`, error);
      return false;
    }
  }

  static async get<T>(key: string): Promise<T | string | null> {
    await initialize();

    const isJsonString = (str: string) => {
      try {
        JSON.parse(str);
      } catch (error) {
        logger.error(`Error parsing value from Redis for key "${key}":`, error);
        return false;
      }
      return true;
    };

    try {
      const value: string | null = await redis.get(key);
      if (value) {
        return isJsonString(value) ? (JSON.parse(value) as T) : value;
      }
      return null;
    } catch (error) {
      logger.error(`Error getting value from Redis for key "${key}":`, error);
      return null;
    }
  }

  static async del(key: string): Promise<boolean> {
    await initialize();

    try {
      const result = await redis.del(key);
      return result > 0;
    } catch (error) {
      logger.error(`Error deleting value from Redis for key "${key}":`, error);
      return false;
    }
  }

  static async keys(pattern = "*"): Promise<string[]> {
    await initialize();

    try {
      const prefix = redis.options.keyPrefix ?? "";
      const prefixedPattern = `${prefix}${pattern}`;
      const keys = await redis.keys(prefixedPattern);
      return keys.map((key) =>
        key.startsWith(prefix) ? key.slice(prefix.length) : key,
      );
    } catch (error) {
      logger.error(
        `Error fetching keys with pattern "${pattern}" from Redis:`,
        error,
      );
      return [];
    }
  }

  static async exists(key: string): Promise<boolean> {
    await initialize();

    try {
      const result = await redis.exists(key);
      return result > 0;
    } catch (error) {
      logger.error(`Error checking existence of key "${key}" in Redis:`, error);
      return false;
    }
  }

  static async flushAll(): Promise<boolean> {
    await initialize();

    try {
      await redis.flushall();
      logger.info("All keys have been flushed from Redis");
      return true;
    } catch (error) {
      logger.error("Error flushing all keys from Redis:", error);
      return false;
    }
  }
}
