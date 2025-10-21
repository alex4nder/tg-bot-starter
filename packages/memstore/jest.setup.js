jest.mock("ioredis", () => {
  const RedisMock = require("ioredis-mock");
  RedisMock.prototype.status = "ready";
  return RedisMock;
});
