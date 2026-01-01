import { errorRate, loadTestOptions, runLoadTest } from './shared/config.js';

export { errorRate };
export const options = loadTestOptions;

export default function () {
    runLoadTest('/api/users');
}

