/* global __ENV */
import http from 'k6/http';
import { sleep } from 'k6';

// Endpoint /api/users breaking point appears to be around 1400-1600 users

export let options = {
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
    http_reqs: ['rate>100'], // At least 100 requests per second should be processed
  },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  http.get(`${BASE}/api/users`);
  sleep(1);
}
