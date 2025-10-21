import { getEnvVar } from "./helpers";
import { IConfig } from "./config.types";
import * as environments from "./environments";

export class Config {
  private readonly config: IConfig;

  constructor() {
    const config: IConfig = environments.defaultConfig;
    const env = getEnvVar("NODE_ENV") ?? "development";

    if (Object.keys(environments).includes(env)) {
      this.config = {
        ...config,
        ...environments[env as keyof typeof environments],
      };
    } else {
      this.config = config;
    }
  }

  get(): IConfig {
    return this.config;
  }
}
