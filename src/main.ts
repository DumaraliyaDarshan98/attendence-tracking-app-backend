import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { setupSwagger } from './config/swagger.config';
import { ResponseInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // Global response interceptor
  app.useGlobalInterceptors(new ResponseInterceptor());
  
  // Global prefix
  app.setGlobalPrefix('api');
  
  // Setup Swagger
  setupSwagger(app);
  
  await app.listen(appConfig.port);
  console.log(`🚀 Application is running on: http://localhost:${appConfig.port}`);
  console.log(`📊 Environment: ${appConfig.nodeEnv}`);
  console.log(`📚 API Documentation: http://localhost:${appConfig.port}/api-docs`);
}
bootstrap();
