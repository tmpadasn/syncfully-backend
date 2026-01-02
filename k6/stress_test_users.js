// Stress test for user endpoints ramping up to 1700 VUs
import { stressTestOptions, runSimpleTest } from './shared/config.js';

export const options = stressTestOptions;

export default function () {
    runSimpleTest('/api/users');
}
