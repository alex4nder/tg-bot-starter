import MemStore, { redis } from "../src";
import Redis from "ioredis";

describe("MemStore", () => {
  let mockRedis: Redis;

  beforeAll(() => {
    mockRedis = redis;
  });

  afterAll(async () => {
    await mockRedis.flushall();
    await mockRedis.quit();
  });

  it("should set and get a value without TTL", async () => {
    const key = "testKey";
    const value = "testValue";

    const setResult = await MemStore.set({ key, value });
    expect(setResult).toBe(true);

    const getResult = await MemStore.get<string>(key);
    expect(getResult).toBe(value);
  });

  it("should set and get a value with TTL in seconds", async () => {
    const key = "testKeyWithTTL";
    const value = "testValue";
    const ttl = 10;

    const setResult = await MemStore.set({
      key,
      value,
      ttl,
      expirationType: "EX",
    });
    expect(setResult).toBe(true);

    const getResult = await MemStore.get<string>(key);
    expect(getResult).toBe(value);

    const ttlResult = await mockRedis.ttl(key);
    expect(ttlResult).toBeLessThanOrEqual(ttl);
    expect(ttlResult).toBeGreaterThan(0);
  });

  it("should set and get a value with TTL in milliseconds", async () => {
    const key = "testKeyWithTTLMillis";
    const value = "testValue";
    const ttl = 10000;

    const setResult = await MemStore.set({
      key,
      value,
      ttl,
      expirationType: "PX",
    });
    expect(setResult).toBe(true);

    const getResult = await MemStore.get<string>(key);
    expect(getResult).toBe(value);

    const pttlResult = await mockRedis.pttl(key);
    expect(pttlResult).toBeLessThanOrEqual(ttl);
    expect(pttlResult).toBeGreaterThan(0);
  });

  it("should delete a key", async () => {
    const key = "testKeyToDelete";
    const value = "testValue";

    await MemStore.set({ key, value });
    const deleteResult = await MemStore.del(key);
    expect(deleteResult).toBe(true);

    const getResult = await MemStore.get<string>(key);
    expect(getResult).toBeNull();
  });

  it("should return all keys matching a pattern", async () => {
    await MemStore.set({ key: "testKey1", value: "value1" });
    await MemStore.set({ key: "testKey2", value: "value2" });

    const keys = await MemStore.keys("testKey*");

    expect(keys).toContain("testKey1");
    expect(keys).toContain("testKey2");
  });

  it("should check if a key exists", async () => {
    const key = "testKeyExists";
    const value = "testValue";

    await MemStore.set({ key, value });
    const exists = await MemStore.exists(key);
    expect(exists).toBe(true);

    const nonExistentKey = "nonExistentKey";
    const nonExistent = await MemStore.exists(nonExistentKey);
    expect(nonExistent).toBe(false);
  });

  it("should flush all keys", async () => {
    await MemStore.set({ key: "testKey1", value: "value1" });
    await MemStore.set({ key: "testKey2", value: "value2" });

    const flushResult = await MemStore.flushAll();
    expect(flushResult).toBe(true);

    const keys = await MemStore.keys();
    expect(keys).toHaveLength(0);
  });
});
