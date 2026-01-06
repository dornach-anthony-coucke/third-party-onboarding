import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle('Third-party onboarding write API')
    .setDescription('Use this API to onboard third-party')
    .setVersion('1.0')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  const globalValidationpipe = new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  });

  app.useGlobalPipes(globalValidationpipe);

  const port = 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}`);
}

void bootstrap();

/*
{
  "company": {
    "legalIdentity": {
      "legalName": "test legal name",
      "legalId": "test legal id",
      "legalForm": "test legal form"
    },
    "headquarterAddress": {
      "line1": "line1",
      "line2": "line2",
      "line3": "line3",
      "country": "country",
      "city": "city",
      "zipCode": "59200"
    }
  },
  "account": {
    "accountTypeCode": 411
  }
}
*/