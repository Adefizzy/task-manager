import { DynamicModule, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Config } from 'src/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ExceptionsFilter } from './utils/exception-filter.lib';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './app/user/user.module';
import { AuthModule } from './app/auth/auth.module';

@Module({})
export class AppModule {
  static forRoot({ config }: { config: Config }): DynamicModule {
    return {
      module: AppModule,
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: (configService: ConfigService) => ({
            ...configService.get('database'),
          }),
          inject: [ConfigService],
        }),
        LoggerModule.forRoot(),
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => config],
          ignoreEnvFile: false,
          ignoreEnvVars: true,
        }),
        UserModule,
        AuthModule,
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
      ],
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: APP_GUARD,
          useClass: ThrottlerGuard,
        },
        { provide: APP_FILTER, useClass: ExceptionsFilter },
      ],
    };
  }
}
