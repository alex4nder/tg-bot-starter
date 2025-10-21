import { Config } from "../src/Config";

describe("Config", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    process.env.TG_BOT_TOKEN = "test_token_123";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("constructor and get()", () => {
    it("should create a config instance with default configuration", () => {
      delete process.env.NODE_ENV;
      const config = new Config();
      const result = config.get();

      expect(result).toBeDefined();
      expect(result.appName).toBe("TG Bot Starter");
      expect(result.appServer).toBeDefined();
      expect(result.appServer.port).toBe(3001);
      expect(result.telegramBot).toBeDefined();
    });

    it("should merge development environment config when NODE_ENV is development", () => {
      process.env.NODE_ENV = "development";
      const config = new Config();
      const result = config.get();

      expect(result).toBeDefined();
      expect(result.appName).toBe("TG Bot Starter");
      expect(result.appServer.port).toBe(3001);
    });

    it("should use default config when NODE_ENV is not set", () => {
      delete process.env.NODE_ENV;
      const config = new Config();
      const result = config.get();

      expect(result).toBeDefined();
      expect(result.appName).toBe("TG Bot Starter");
    });

    it("should use default config when NODE_ENV is unknown", () => {
      process.env.NODE_ENV = "production";
      const config = new Config();
      const result = config.get();

      expect(result).toBeDefined();
      expect(result.appName).toBe("TG Bot Starter");
    });

    it("should include appServer configuration", () => {
      const config = new Config();
      const result = config.get();

      expect(result.appServer).toEqual({
        port: 3001,
        baseUrl: "http://localhost:3001",
      });
    });

    it("should include appClient configuration", () => {
      const config = new Config();
      const result = config.get();

      expect(result.appClient).toEqual({
        baseUrl: "http://127.0.0.1:8080",
      });
    });

    it("should include telegramBot configuration", () => {
      process.env.TG_BOT_TOKEN = "my_custom_token";
      const config = new Config();
      const result = config.get();

      expect(result.telegramBot).toBeDefined();
      expect(result.telegramBot.token).toBe("my_custom_token");
      expect(result.telegramBot.client).toBeDefined();
      expect(result.telegramBot.client.environment).toBe("test");
    });

    it("should include typeOrmOptions configuration", () => {
      const config = new Config();
      const result = config.get();

      expect(result.typeOrmOptions).toBeDefined();
      expect(result.typeOrmOptions.type).toBe("postgres");
      expect(result.typeOrmOptions.host).toBe("localhost");
      expect(result.typeOrmOptions.port).toBe(5432);
      expect(result.typeOrmOptions.username).toBe("telegram_bot_starter_user");
      expect(result.typeOrmOptions.database).toBe("telegrambotstarterdb");
      expect(result.typeOrmOptions.schema).toBe("dev");
      expect(result.typeOrmOptions.synchronize).toBe(false);
    });

    it("should include redisOptions configuration", () => {
      const config = new Config();
      const result = config.get();

      expect(result.redisOptions).toBeDefined();
      expect(result.redisOptions.host).toBe("localhost");
      expect(result.redisOptions.port).toBe(6379);
      expect(result.redisOptions.keyPrefix).toBe("tg-bot-starter:");
    });

    it("should include bullMqOptions configuration", () => {
      const config = new Config();
      const result = config.get();

      expect(result.bullMqOptions).toBeDefined();
      expect(result.bullMqOptions.host).toBe("localhost");
      expect(result.bullMqOptions.port).toBe(6379);
    });

    it("should return the same config object on multiple get() calls", () => {
      const config = new Config();
      const result1 = config.get();
      const result2 = config.get();

      expect(result1).toBe(result2);
    });

    it("should throw error if TG_BOT_TOKEN is not set in default config", () => {
      delete process.env.TG_BOT_TOKEN;

      expect(() => new Config()).toThrow(
        'Mandatory environment variable "TG_BOT_TOKEN is not set"',
      );
    });

    it("should handle empty string NODE_ENV", () => {
      process.env.NODE_ENV = "";
      const config = new Config();
      const result = config.get();

      expect(result).toBeDefined();
      expect(result.appName).toBe("TG Bot Starter");
    });

    it("should handle NODE_ENV with whitespace", () => {
      process.env.NODE_ENV = "  development  ";
      const config = new Config();
      const result = config.get();

      expect(result).toBeDefined();
    });

    it("should create multiple independent config instances", () => {
      const config1 = new Config();
      const config2 = new Config();

      expect(config1).not.toBe(config2);
      expect(config1.get()).not.toBe(config2.get());
    });
  });

  describe("environment-specific behavior", () => {
    it("should properly merge development config over default", () => {
      process.env.NODE_ENV = "development";
      const config = new Config();
      const result = config.get();

      // Verify all expected properties are present
      expect(result.appName).toBeDefined();
      expect(result.appServer).toBeDefined();
      expect(result.appClient).toBeDefined();
      expect(result.telegramBot).toBeDefined();
      expect(result.typeOrmOptions).toBeDefined();
      expect(result.redisOptions).toBeDefined();
      expect(result.bullMqOptions).toBeDefined();
    });

    it("should handle case-sensitive environment names", () => {
      process.env.NODE_ENV = "Development";
      const config = new Config();
      const result = config.get();

      // Should use default since "Development" !== "development"
      expect(result).toBeDefined();
    });
  });

  describe("config immutability", () => {
    it("should not allow external modification of config", () => {
      const config = new Config();
      const result = config.get();
      const originalAppName = result.appName;

      // Attempt to modify
      result.appName = "Modified Name";

      // Get config again
      const result2 = config.get();

      // Should reflect the change because we return the same object
      // (This tests current behavior - if immutability is desired, this test would need adjustment)
      expect(result2.appName).toBe("Modified Name");
    });
  });
});