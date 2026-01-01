// Spike test for work endpoints with traffic surges up to 1300 VUs
import { spikeTestOptions, runSimpleTest } from './shared/config.js';

export const options = spikeTestOptions;

export default function () {
    runSimpleTest('/api/works');
}
