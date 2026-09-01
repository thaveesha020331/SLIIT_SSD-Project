import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Load OpenAPI 3 spec from swagger/openapi.yaml
 */
export function loadOpenApiSpec() {
  const filePath = path.join(__dirname, '..', 'swagger', 'openapi.yaml');
  const raw = fs.readFileSync(filePath, 'utf8');
  return yaml.load(raw);
}
