/* global __ENV */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Tracks HTTP error rate across all k6 tests
export const errorRate = new Rate('errors');

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Load test: sustained 260 VUs for 30s to test normal operation
// Thresholds: p95 latency < 500ms, error rate < 1%
export const loadTestOptions = {
    vus: 260,
    duration: '30s',
    thresholds: {
        'http_req_duration': ['p(95) < 500'],
        'errors': ['rate<0.01'],
    },
};

// Spike test: simulates traffic surges with 3 spikes (500, 1000, 1300 VUs)
// Tests system recovery between spikes with 200 VU baseline periods
export const spikeTestOptions = {
    stages: [
        { duration: '2m', target: 500 },
        { duration: '1m', target: 200 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 1000 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 200 },
        { duration: '2m', target: 1300 },
        { duration: '2m', target: 200 },
    ],
    thresholds: {
        http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],
        http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],
    },
};

// Stress test: gradual ramp from 10 to 1700 VUs to find breaking point
// Ramps down to 0 to test graceful degradation
export const stressTestOptions = {
    stages: [
        { duration: '20s', target: 10 },
        { duration: '1m', target: 500 },
        { duration: '1m', target: 1000 },
        { duration: '1m', target: 1700 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],
        http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],
        http_reqs: ['rate>100'],
    },
};

// Runs basic load test with response validation and error tracking
// Random sleep (0.5-2.5s) prevents synchronized request patterns
export function runLoadTest(endpoint) {
    const res = http.get(`${BASE_URL}${endpoint}`);
    const ok = check(res, {
        'status is 200': (r) => r.status === 200,
        'body present': (r) => r.body && r.body.length > 0,
    });
    errorRate.add(!ok); // Track failed validation as error metric
    sleep(0.5 + Math.random() * 2); // 0.5-2.5s random delay
}

// Simplified test runner without response validation
// Used for baseline performance testing
export function runSimpleTest(endpoint) {
    http.get(`${BASE_URL}${endpoint}`);
    sleep(1);
}
