/* global __ENV */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export const loadTestOptions = {
    vus: 260,
    duration: '30s',
    thresholds: {
        'http_req_duration': ['p(95) < 500'],
        'errors': ['rate<0.01'],
    },
};

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

export function runLoadTest(endpoint) {
    const res = http.get(`${BASE_URL}${endpoint}`);
    const ok = check(res, {
        'status is 200': (r) => r.status === 200,
        'body present': (r) => r.body && r.body.length > 0,
    });
    errorRate.add(!ok);
    sleep(0.5 + Math.random() * 2);
}

export function runSimpleTest(endpoint) {
    http.get(`${BASE_URL}${endpoint}`);
    sleep(1);
}
