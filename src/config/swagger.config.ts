import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';

export function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('Attendance Tracking API')
    .setDescription('A comprehensive API for managing attendance tracking system')
    .setVersion('1.0')
    .addTag('Authentication', 'User authentication and authorization endpoints')
    .addTag('Users', 'User management CRUD operations')
    .addTag('Attendance', 'Attendance tracking and management')
    .addTag('Leave Management', 'Holiday and leave request management')
    .addTag('Tour Management', 'Site visit and tour management')
    .addTag('Document Upload', 'Document upload and management')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'Attendance Tracking API Documentation',
    // Use CDN URLs for swagger-ui CSS and JS to avoid loading local source map files
    customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
    customJs: [
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
      'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
    ],
  });
}
