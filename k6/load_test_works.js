// Load test for work endpoints with 260 VUs sustained for 30s
import { errorRate, loadTestOptions, runLoadTest } from './shared/config.js';

export { errorRate };
export const options = loadTestOptions;

export default function () {
    runLoadTest('/api/works');
}
