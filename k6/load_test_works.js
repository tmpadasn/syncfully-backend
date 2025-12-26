import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

export const errorRate = new Rate('errors');

export const options = {
	vus: 260,
	duration: '30s',
	thresholds: {
		'http_req_duration': ['p(95) < 500'],
		'errors': ['rate<0.01'],
	},
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = `${BASE_URL}/api/works`;

export default function () {
	const res = http.get(ENDPOINT);

	const ok = check(res, {
		'status is 200': (r) => r.status === 200,
		'body present': (r) => r.body && r.body.length > 0,
	});

	errorRate.add(!ok);

	sleep(0.5 + Math.random() * 2);
}
