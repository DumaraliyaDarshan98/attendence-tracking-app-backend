import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { appConfig } from './config/app.config';
import { setupSwagger } from './config/swagger.config';
import { ResponseInterceptor } from './common/interceptors';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

// Set timezone to IST (Indian Standard Time)
process.env.TZ = 'Asia/Kolkata';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Serve static files from uploads directory
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });
  
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
  console.log(`📁 File uploads served at: http://localhost:${appConfig.port}/uploads/`);
}
bootstrap();
