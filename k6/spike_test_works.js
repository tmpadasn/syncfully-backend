import { spikeTestOptions, runSimpleTest } from './shared/config.js';

export const options = spikeTestOptions;

export default function () {
    runSimpleTest('/api/works');
}
