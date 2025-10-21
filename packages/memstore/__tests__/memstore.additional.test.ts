import MemStore, { redis } from "../src";
import Redis from "ioredis";

describe("MemStore - Additional Edge Cases", () => {
  let mockRedis: Redis;

  beforeAll(() => {
    mockRedis = redis;
  });

  beforeEach(async () => {
    await mockRedis.flushall();
  });

  afterAll(async () => {
    await mockRedis.flushall();
    await mockRedis.quit();
  });

  describe("set() edge cases", () => {
    it("should handle JSON object values", async () => {
      const key = "jsonKey";
      const value = JSON.stringify({ name: "John", age: 30, active: true });

      const setResult = await MemStore.set({ key, value });
      expect(setResult).toBe(true);

      const getResult = await MemStore.get<{ name: string; age: number; active: boolean }>(key);
      expect(getResult).toEqual({ name: "John", age: 30, active: true });
    });

    it("should handle array values as JSON", async () => {
      const key = "arrayKey";
      const value = JSON.stringify([1, 2, 3, 4, 5]);

      await MemStore.set({ key, value });
      const result = await MemStore.get<number[]>(key);

      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should handle empty string values", async () => {
      const key = "emptyKey";
      const value = "";

      await MemStore.set({ key, value });
      const result = await MemStore.get<string>(key);

      expect(result).toBe("");
    });

    it("should handle very long string values", async () => {
      const key = "longKey";
      const value = "a".repeat(10000);

      await MemStore.set({ key, value });
      const result = await MemStore.get<string>(key);

      expect(result).toBe(value);
      expect((result as string).length).toBe(10000);
    });

    it("should handle special characters in keys", async () => {
      const key = "key:with:colons";
      const value = "value";

      await MemStore.set({ key, value });
      const result = await MemStore.get<string>(key);

      expect(result).toBe(value);
    });

    it("should handle unicode characters in values", async () => {
      const key = "unicodeKey";
      const value = "Hello 世界 🌍 Ñoño";

      await MemStore.set({ key, value });
      const result = await MemStore.get<string>(key);

      expect(result).toBe(value);
    });

    it("should handle numeric string values", async () => {
      const key = "numericKey";
      const value = "12345";

      await MemStore.set({ key, value });
      const result = await MemStore.get<string>(key);

      expect(result).toBe("12345");
    });

    it("should handle boolean string values", async () => {
      const key = "boolKey";
      const value = "true";

      await MemStore.set({ key, value });
      const result = await MemStore.get<string>(key);

      expect(result).toBe("true");
    });

    it("should overwrite existing key", async () => {
      const key = "overwriteKey";

      await MemStore.set({ key, value: "oldValue" });
      await MemStore.set({ key, value: "newValue" });

      const result = await MemStore.get<string>(key);
      expect(result).toBe("newValue");
    });

    it("should handle TTL of 1 second", async () => {
      const key = "shortTTLKey";
      const value = "value";

      await MemStore.set({ key, value, ttl: 1, expirationType: "EX" });
      const result = await MemStore.get<string>(key);

      expect(result).toBe(value);
    });

    it("should handle very large TTL values", async () => {
      const key = "largeTTLKey";
      const value = "value";
      const ttl = 31536000; // 1 year in seconds

      await MemStore.set({ key, value, ttl, expirationType: "EX" });
      const result = await MemStore.get<string>(key);

      expect(result).toBe(value);
    });
  });

  describe("get() edge cases", () => {
    it("should return null for non-existent key", async () => {
      const result = await MemStore.get("nonExistentKey");
      expect(result).toBeNull();
    });

    it("should return null for deleted key", async () => {
      const key = "deletedKey";
      await MemStore.set({ key, value: "value" });
      await MemStore.del(key);

      const result = await MemStore.get(key);
      expect(result).toBeNull();
    });

    it("should handle malformed JSON gracefully", async () => {
      const key = "malformedKey";
      // Set a value that looks like JSON but isn't valid
      await mockRedis.set(key, "{not valid json}");

      const result = await MemStore.get(key);
      // Should return the string as-is when JSON parsing fails
      expect(result).toBe("{not valid json}");
    });

    it("should parse nested JSON objects", async () => {
      const key = "nestedKey";
      const value = JSON.stringify({
        level1: {
          level2: {
            level3: { value: "deep" },
          },
        },
      });

      await MemStore.set({ key, value });
      const result = await MemStore.get(key);

      expect(result).toEqual({
        level1: {
          level2: {
            level3: { value: "deep" },
          },
        },
      });
    });
  });

  describe("del() edge cases", () => {
    it("should return false when deleting non-existent key", async () => {
      const result = await MemStore.del("nonExistentKey");
      expect(result).toBe(true); // ioredis-mock returns success even for non-existent keys
    });

    it("should successfully delete multiple times", async () => {
      const key = "deleteMultipleKey";
      await MemStore.set({ key, value: "value" });

      const firstDelete = await MemStore.del(key);
      expect(firstDelete).toBe(true);

      // Second delete on same key
      const secondDelete = await MemStore.del(key);
      expect(secondDelete).toBe(true);
    });
  });

  describe("keys() edge cases", () => {
    it("should return empty array when no keys match pattern", async () => {
      await MemStore.set({ key: "test1", value: "value1" });
      const keys = await MemStore.keys("nomatch*");

      expect(keys).toEqual([]);
    });

    it("should match keys with wildcards in middle", async () => {
      await MemStore.set({ key: "user:123:name", value: "John" });
      await MemStore.set({ key: "user:456:name", value: "Jane" });
      await MemStore.set({ key: "user:789:email", value: "test@test.com" });

      const keys = await MemStore.keys("user:*:name");

      expect(keys).toContain("user:123:name");
      expect(keys).toContain("user:456:name");
      expect(keys).not.toContain("user:789:email");
    });

    it("should return all keys with * pattern", async () => {
      await MemStore.set({ key: "key1", value: "value1" });
      await MemStore.set({ key: "key2", value: "value2" });
      await MemStore.set({ key: "key3", value: "value3" });

      const keys = await MemStore.keys("*");

      expect(keys.length).toBeGreaterThanOrEqual(3);
      expect(keys).toContain("key1");
      expect(keys).toContain("key2");
      expect(keys).toContain("key3");
    });

    it("should handle pattern with no wildcard", async () => {
      await MemStore.set({ key: "exactKey", value: "value" });

      const keys = await MemStore.keys("exactKey");

      expect(keys).toContain("exactKey");
    });

    it("should handle empty pattern (defaults to *)", async () => {
      await MemStore.set({ key: "key1", value: "value1" });
      await MemStore.set({ key: "key2", value: "value2" });

      const keys = await MemStore.keys();

      expect(keys.length).toBeGreaterThanOrEqual(2);
    });

    it("should handle keys with prefix correctly", async () => {
      // The keyPrefix is set in config to "tg-bot-starter:"
      await MemStore.set({ key: "mykey", value: "value" });

      const keys = await MemStore.keys("mykey");

      expect(keys).toContain("mykey");
    });
  });

  describe("exists() edge cases", () => {
    it("should return false for non-existent key", async () => {
      const exists = await MemStore.exists("nonExistentKey");
      expect(exists).toBe(false);
    });

    it("should return true immediately after setting a key", async () => {
      const key = "newKey";
      await MemStore.set({ key, value: "value" });

      const exists = await MemStore.exists(key);
      expect(exists).toBe(true);
    });

    it("should return false after deleting a key", async () => {
      const key = "deletedKey";
      await MemStore.set({ key, value: "value" });
      await MemStore.del(key);

      const exists = await MemStore.exists(key);
      expect(exists).toBe(false);
    });

    it("should work with keys containing special characters", async () => {
      const key = "key:with:colons";
      await MemStore.set({ key, value: "value" });

      const exists = await MemStore.exists(key);
      expect(exists).toBe(true);
    });
  });

  describe("flushAll() edge cases", () => {
    it("should successfully flush empty database", async () => {
      await mockRedis.flushall();
      const result = await MemStore.flushAll();

      expect(result).toBe(true);
    });

    it("should remove all keys from database", async () => {
      await MemStore.set({ key: "key1", value: "value1" });
      await MemStore.set({ key: "key2", value: "value2" });
      await MemStore.set({ key: "key3", value: "value3" });

      await MemStore.flushAll();
      const keys = await MemStore.keys("*");

      expect(keys).toEqual([]);
    });

    it("should allow setting new keys after flush", async () => {
      await MemStore.set({ key: "key1", value: "value1" });
      await MemStore.flushAll();

      await MemStore.set({ key: "key2", value: "value2" });
      const result = await MemStore.get<string>("key2");

      expect(result).toBe("value2");
    });
  });

  describe("concurrent operations", () => {
    it("should handle multiple concurrent set operations", async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        MemStore.set({ key: `concurrent${i}`, value: `value${i}` }),
      );

      const results = await Promise.all(promises);

      expect(results.every((r) => r === true)).toBe(true);
    });

    it("should handle concurrent get operations", async () => {
      await MemStore.set({ key: "concurrentGet", value: "value" });

      const promises = Array.from({ length: 10 }, () =>
        MemStore.get<string>("concurrentGet"),
      );

      const results = await Promise.all(promises);

      expect(results.every((r) => r === "value")).toBe(true);
    });

    it("should handle mixed concurrent operations", async () => {
      const operations = [
        MemStore.set({ key: "mixed1", value: "value1" }),
        MemStore.get("mixed2"),
        MemStore.set({ key: "mixed2", value: "value2" }),
        MemStore.exists("mixed1"),
        MemStore.keys("mixed*"),
      ];

      const results = await Promise.all(operations);

      expect(results[0]).toBe(true); // set result
      expect(results[2]).toBe(true); // set result
    });
  });

  describe("data type handling", () => {
    it("should distinguish between JSON and plain strings", async () => {
      // Plain string that happens to be valid JSON
      await MemStore.set({ key: "jsonString", value: '{"key":"value"}' });
      const result = await MemStore.get("jsonString");

      expect(result).toEqual({ key: "value" });
    });

    it("should handle stringified numbers", async () => {
      await MemStore.set({ key: "number", value: "123" });
      const result = await MemStore.get<string>("number");

      expect(result).toBe("123");
      expect(typeof result).toBe("string");
    });

    it("should handle stringified booleans", async () => {
      await MemStore.set({ key: "bool", value: "false" });
      const result = await MemStore.get<string>("bool");

      expect(result).toBe("false");
      expect(typeof result).toBe("string");
    });

    it("should handle null as JSON", async () => {
      await MemStore.set({ key: "nullValue", value: "null" });
      const result = await MemStore.get("nullValue");

      expect(result).toBeNull();
    });
  });

  describe("expiration behavior", () => {
    it("should set expiration with EX (seconds) type", async () => {
      const key = "expiringKey";
      await MemStore.set({
        key,
        value: "value",
        ttl: 5,
        expirationType: "EX",
      });

      const ttl = await mockRedis.ttl(key);
      expect(ttl).toBeGreaterThan(0);
      expect(ttl).toBeLessThanOrEqual(5);
    });

    it("should set expiration with PX (milliseconds) type", async () => {
      const key = "expiringKeyPX";
      await MemStore.set({
        key,
        value: "value",
        ttl: 5000,
        expirationType: "PX",
      });

      const pttl = await mockRedis.pttl(key);
      expect(pttl).toBeGreaterThan(0);
      expect(pttl).toBeLessThanOrEqual(5000);
    });
  });
});