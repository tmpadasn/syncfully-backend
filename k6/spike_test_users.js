/* global __ENV */
import http from 'k6/http';
import { sleep } from 'k6';

// Breaking point for /api/users appears to be around 1400-1600 users

export let options = {
    stages: [
        // 1st spike to 500 users
        { duration: '2m', target: 500 },
        { duration: '1m', target: 200 },
        // 2nd spike to 1000 users
        { duration: '2m', target: 200 },
        { duration: '2m', target: 1000 },
        { duration: '2m', target: 200 },
        // 3rd spike to 1300 users
        { duration: '2m', target: 200 },
        { duration: '2m', target: 1300 },
        { duration: '2m', target: 200 },
    ],
    thresholds: {
        http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],
        http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],
    },
};

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
    http.get(`${BASE}/api/users`);
    sleep(1);
}
