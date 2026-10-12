// Optional docs UI — package may be omitted in lean installs.
// eslint-disable-next-line import/no-unresolved
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi.js';

/**
 * Mount interactive Swagger UI + raw OpenAPI JSON.
 * Kept outside the /api rate-limiter so docs browsing isn't throttled.
 */
export function mountSwagger(app) {
  app.get('/api-docs.json', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    res.json(openapi);
  });

  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(openapi, {
      customSiteTitle: 'Yesen CRM API',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'list',
        filter: true,
        tryItOutEnabled: true,
      },
    })
  );
}
