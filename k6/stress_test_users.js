import { stressTestOptions, runSimpleTest } from './shared/config.js';

export const options = stressTestOptions;

export default function () {
    runSimpleTest('/api/users');
}
