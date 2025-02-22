import { createSwaggerSpec } from 'next-swagger-doc';
import swaggerConfig from '@/swagger.config';

export async function GET() {
  const spec = createSwaggerSpec(swaggerConfig);
  return Response.json(spec);
}