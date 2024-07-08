// eslint-disable-next-line
require('dotenv').config();
import { config as dotenvConfig } from 'dotenv';
import * as R from 'ramda';
import { Environment } from '@app/config/environments/types';

dotenvConfig();

const env = process.env.NODE_ENV ?? 'development';

export interface Config {
  appName: string;
  env: Environment;
  server: {
    port: number;
  };
  database: {
    type: string;
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
    entities: string[];
    subscribers: string[];
    migrations: string[];
    autoLoadEntities: boolean;
    synchronize: boolean;
    cli: {
      entitiesDir: string;
      migrationsDir: string;
    };
  };
  jwt?: {
    secret: string;
    expiresIn: string;
  };
}

export const getEnvironmentValue = (
  key: string,
  defaultValue?: string,
): string => {
  const envVal = process.env[key] ?? defaultValue;

  if (!envVal && envVal !== '') {
    throw new Error(`env variable ${key} has to be defined`);
  }

  return envVal;
};

/* eslint-disable */
const envConfig = require(`./environments/${env}`)?.config;
const defaultConfig = require('./default').config;
/* eslint-enable */

/* eslint-enable @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires */
export const config = R.mergeDeepRight(
  defaultConfig,
  envConfig,
) as object as Config;
