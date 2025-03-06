import { NodeKind } from '../components/decision-graph/nodes/specifications/specification-types';
import type { DecisionNode } from '../components/decision-graph/dg-types';
import type { ApiRequestData } from '../components/api-request/types';

/**
 * Converts an API request node to a function node
 * @param node The API request node to convert
 * @returns A function node with JavaScript code that makes the API request
 */
export const apiRequestToFunction = (node: DecisionNode<ApiRequestData>): DecisionNode => {
  const { content, id, name, position } = node;

  if (!content) {
    throw new Error('API request node content is undefined');
  }

  const { url, method, headers, queryParams, body, retryCount } = content;

  // Generate JavaScript code for the API request
  const code = generateApiRequestCode(url, method, headers, queryParams, body, retryCount);

  // Create a function node with the generated code
  return {
    id,
    name,
    position,
    type: NodeKind.Function,
    content: {
      source: code
    }
  };
};

/**
 * Generates JavaScript code for an API request
 */
function generateApiRequestCode(
  url: string,
  method: string,
  headers: Array<{ key: string; value: string; enabled: boolean }>,
  queryParams: Array<{ key: string; value: string; enabled: boolean }>,
  body: string,
  retryCount: number
): string {
  // Convert headers to JavaScript object
  const headersCode = headers
    .filter(h => h.enabled)
    .map(h => `    "${h.key}": "${h.value}"`)
    .join(',\n');

  // Convert query params to JavaScript object
  const paramsCode = queryParams
    .filter(p => p.enabled)
    .map(p => `    "${p.key}": "${p.value}"`)
    .join(',\n');

  // Format the request body
  let bodyCode = '';
  if (body && method !== 'GET' && method !== 'HEAD') {
    try {
      // Try to parse as JSON to format it nicely
      const parsedBody = JSON.parse(body);
      bodyCode = JSON.stringify(parsedBody, null, 2);
    } catch {
      // If not valid JSON, use as is
      bodyCode = body;
    }
  }

  // Generate retry logic
  const retryLogic = retryCount > 0
    ? `
  // Retry logic
  let retries = 0;
  const maxRetries = ${retryCount};

  while (true) {
    try {
      ${generateRequestCode(method, 'url', headersCode, paramsCode, bodyCode)}
      break; // Success, exit retry loop
    } catch (error) {
      if (retries >= maxRetries) {
        throw error; // Max retries reached, rethrow the error
      }

      retries++;
      console.log(\`Request failed, retrying (\${retries}/\${maxRetries})...\`);

      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries - 1)));
    }
  }`
    : generateRequestCode(method, 'url', headersCode, paramsCode, bodyCode);

  return `import http from 'http';
import zen from 'zen';

/**
 * Auto-generated API request function
 *
 * @param {Object} input - The input object
 * @returns {Promise<any>} The API response
 */
export const handler = async (input) => {
  const url = "${url}";

${retryLogic}

  return response.data;
};`;
}

/**
 * Generates the actual HTTP request code
 */
function generateRequestCode(
  method: string,
  urlVar: string,
  headersCode: string,
  paramsCode: string,
  bodyCode: string
): string {
  const config = [];

  if (headersCode) {
    config.push(`headers: {\n${headersCode}\n  }`);
  }

  if (paramsCode) {
    config.push(`params: {\n${paramsCode}\n  }`);
  }

  const configCode = config.length > 0 ? `, {\n  ${config.join(',\n  ')}\n}` : '';

  switch (method) {
    case 'GET':
      return `const response = await http.get(${urlVar}${configCode});`;
    case 'POST':
      return `const response = await http.post(${urlVar}, ${bodyCode || 'null'}${configCode});`;
    case 'PUT':
      return `const response = await http.put(${urlVar}, ${bodyCode || 'null'}${configCode});`;
    case 'DELETE':
      return `const response = await http.delete(${urlVar}${configCode});`;
    case 'HEAD':
      return `const response = await http.head(${urlVar}${configCode});`;
    case 'OPTIONS':
      return `const response = await http.request('OPTIONS', ${urlVar}${configCode});`;
    default:
      return `const response = await http.request('${method}', ${urlVar}${configCode});`;
  }
}