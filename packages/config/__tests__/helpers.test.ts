import { getEnvVar, getEnvVarOrThrow } from "../src/helpers";

describe("helpers", () => {
  describe("getEnvVar", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("should return the value of an existing environment variable", () => {
      process.env.TEST_VAR = "test_value";
      const result = getEnvVar("TEST_VAR");
      expect(result).toBe("test_value");
    });

    it("should return undefined for a non-existent environment variable", () => {
      delete process.env.TEST_VAR;
      const result = getEnvVar("TEST_VAR");
      expect(result).toBeUndefined();
    });

    it("should return empty string when environment variable is set to empty string", () => {
      process.env.TEST_VAR = "";
      const result = getEnvVar("TEST_VAR");
      expect(result).toBe("");
    });

    it("should handle environment variables with special characters", () => {
      process.env.TEST_VAR = "value@#$%^&*()_+={}[]|\\:;\"'<>,.?/~`";
      const result = getEnvVar("TEST_VAR");
      expect(result).toBe("value@#$%^&*()_+={}[]|\\:;\"'<>,.?/~`");
    });

    it("should handle environment variables with whitespace", () => {
      process.env.TEST_VAR = "  value with spaces  ";
      const result = getEnvVar("TEST_VAR");
      expect(result).toBe("  value with spaces  ");
    });

    it("should handle environment variables with newlines", () => {
      process.env.TEST_VAR = "line1\nline2\nline3";
      const result = getEnvVar("TEST_VAR");
      expect(result).toBe("line1\nline2\nline3");
    });

    it("should handle numeric string values", () => {
      process.env.TEST_VAR = "12345";
      const result = getEnvVar("TEST_VAR");
      expect(result).toBe("12345");
      expect(typeof result).toBe("string");
    });

    it("should handle boolean-like string values", () => {
      process.env.TEST_VAR = "true";
      const result = getEnvVar("TEST_VAR");
      expect(result).toBe("true");
      expect(typeof result).toBe("string");
    });
  });

  describe("getEnvVarOrThrow", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterAll(() => {
      process.env = originalEnv;
    });

    it("should return the value of an existing environment variable", () => {
      process.env.TEST_VAR = "test_value";
      const result = getEnvVarOrThrow("TEST_VAR");
      expect(result).toBe("test_value");
    });

    it("should throw an error for a non-existent environment variable", () => {
      delete process.env.TEST_VAR;
      expect(() => getEnvVarOrThrow("TEST_VAR")).toThrow(
        'Mandatory environment variable "TEST_VAR is not set"',
      );
    });

    it("should throw an error when environment variable is set to empty string", () => {
      process.env.TEST_VAR = "";
      expect(() => getEnvVarOrThrow("TEST_VAR")).toThrow(
        'Mandatory environment variable "TEST_VAR is not set"',
      );
    });

    it("should throw an error with the correct variable name", () => {
      delete process.env.MY_CUSTOM_VAR;
      expect(() => getEnvVarOrThrow("MY_CUSTOM_VAR")).toThrow(
        'Mandatory environment variable "MY_CUSTOM_VAR is not set"',
      );
    });

    it("should return value with special characters", () => {
      process.env.TEST_VAR = "value!@#$%^&*()";
      const result = getEnvVarOrThrow("TEST_VAR");
      expect(result).toBe("value!@#$%^&*()");
    });

    it("should return value with whitespace", () => {
      process.env.TEST_VAR = "  value  ";
      const result = getEnvVarOrThrow("TEST_VAR");
      expect(result).toBe("  value  ");
    });

    it("should handle multiple calls with different variables", () => {
      process.env.VAR1 = "value1";
      process.env.VAR2 = "value2";
      process.env.VAR3 = "value3";

      expect(getEnvVarOrThrow("VAR1")).toBe("value1");
      expect(getEnvVarOrThrow("VAR2")).toBe("value2");
      expect(getEnvVarOrThrow("VAR3")).toBe("value3");
    });

    it("should throw for undefined after successful calls", () => {
      process.env.VAR1 = "value1";
      expect(getEnvVarOrThrow("VAR1")).toBe("value1");

      delete process.env.VAR2;
      expect(() => getEnvVarOrThrow("VAR2")).toThrow();
    });

    it("should handle very long environment variable values", () => {
      const longValue = "a".repeat(10000);
      process.env.TEST_VAR = longValue;
      const result = getEnvVarOrThrow("TEST_VAR");
      expect(result).toBe(longValue);
      expect(result.length).toBe(10000);
    });

    it("should handle variable names with underscores", () => {
      process.env.TEST_VAR_WITH_UNDERSCORES = "value";
      const result = getEnvVarOrThrow("TEST_VAR_WITH_UNDERSCORES");
      expect(result).toBe("value");
    });

    it("should handle JSON string values", () => {
      process.env.TEST_VAR = '{"key": "value"}';
      const result = getEnvVarOrThrow("TEST_VAR");
      expect(result).toBe('{"key": "value"}');
    });

    it("should handle URL values", () => {
      process.env.TEST_VAR = "https://example.com:8080/path?query=value";
      const result = getEnvVarOrThrow("TEST_VAR");
      expect(result).toBe("https://example.com:8080/path?query=value");
    });
  });
});