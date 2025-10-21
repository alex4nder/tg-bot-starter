module.exports = {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.js"],
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
};
