import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { config, Config } from './config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import * as cookieParser from 'cookie-parser';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { ValidationPipeExt } from './utils/validation-pipe';

async function bootstrap() {
  const appConfig: Config = config;
  const PORT = config.server.port;

  NestFactory.create(AppModule.forRoot({ config: appConfig }))
    .then((app) => {
      const logger = app.get(Logger);
      app.useLogger(logger);
      app.enableCors({
        origin: ['http://localhost:8888'],
        allowedHeaders: ['content-type', 'Authorization'],
        credentials: true,
      });

      app.use(helmet());
      app.use(cookieParser());
      app.setGlobalPrefix('api/v1');
      app.useGlobalPipes(
        new ValidationPipeExt({ whitelist: true, transform: true }),
      );

      const config = new DocumentBuilder()
        .setTitle('enif-user-taskmanager api docs')
        .setDescription('user task manager api docs')
        .setVersion('1.0')
        .addBearerAuth(
          {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'Token',
          },
          'access-token',
        )
        .build();

      const options: SwaggerDocumentOptions = {
        operationIdFactory: (controllerKey: string, methodKey: string) =>
          methodKey,
      };

      const document = SwaggerModule.createDocument(app, config, options);
      SwaggerModule.setup('api', app, document);

      app
        .listen(PORT)
        .then(() => {
          logger.log(`⚡️[server]: Server is running at port ${PORT}`);
        })
        .catch((error) => {
          logger.error(`error listening on ${PORT}`, { error });
        });
    })
    .catch((error) => {
      console.log('error starting app', JSON.stringify(error));
    });
}
bootstrap();
