import type { Config } from '@app/config';
import { getEnvironmentValue } from '@app/config';
import { join } from 'path';

export const config: Config = {
  appName: 'enif task manager 🚀',
  env: getEnvironmentValue('NODE_ENV', 'development') as Config['env'],
  server: {
    port: Number(getEnvironmentValue('PORT', '8888')),
  },
  database: {
    type: getEnvironmentValue('DB_TYPE', 'postgres'),
    host: getEnvironmentValue('DB_HOST', 'localhost'),
    port: Number(getEnvironmentValue('DB_PORT', '5432')),
    username: getEnvironmentValue('DB_USERNAME', 'adefisayo'),
    password: getEnvironmentValue('DB_PASSWORD', 'password'),
    database: getEnvironmentValue('DB_NAME', 'test'),
    entities: [join(__dirname, '/../src/app/**/*.entity{.ts,.js}')],
    subscribers: [join(__dirname, '/../src/app/**/*.subscriber{.ts,.js}')],
    migrations: [join(__dirname, '/../db/migration/**/*{.ts,.js}')],
    cli: {
      entitiesDir: 'src/app/entities',
      migrationsDir: 'db/migration',
    },
    synchronize: process.env.NODE_ENV === 'development',
    autoLoadEntities: true,
  },
  jwt: {
    secret: getEnvironmentValue(
      'JWT_SECRET',
      'dwddwdwdwdwdwdwdwdwdwdwdwdwdwdwdw',
    ),
    expiresIn: getEnvironmentValue('JWT_EXPIRES_IN', '30 days'),
  },
};
