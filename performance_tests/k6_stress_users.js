import http from 'k6/http';
import { sleep, check } from 'k6';

// Endpoint /api/users breaking point appears to be around 4500-5500 users

export let options = {
  stages: [
    { duration: '20s', target: 10 },
    { duration: '40s', target: 1000 },
    { duration: '40s', target: 2000 },
    { duration: '40s', target: 4000 },
    { duration: '40s', target: 6000 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_failed: [
      { threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '10s' },
    ],
    http_req_duration: [
      { threshold: 'p(95)<2000', abortOnFail: true, delayAbortEval: '10s' },
    ],
  },
};


// export let options = {
//   stages: [
//     { duration: '30s', target: 3000 },
//     { duration: '30s', target: 4500 },
//     { duration: '30s', target: 5500 },
//     { duration: '1m', target: 5800 },
//     { duration: '1m', target: 6000 },
//     { duration: '1m', target: 0 },
//   ],
//   thresholds: {
//     http_req_failed: [
//       { threshold: 'rate<0.05', abortOnFail: true, delayAbortEval: '10s' },
//     ],
//     http_req_duration: [
//       { threshold: 'p(95)<2000', abortOnFail: true, delayAbortEval: '10s' },
//     ],
//   },
// };

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const res = http.get(`${BASE}/api/users`);

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
