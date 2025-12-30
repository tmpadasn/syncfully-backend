/* global __ENV */
/**
 * K6 Load Test Script: Works Endpoint
 * 
 * This script targets the /api/works endpoint to verify its performance under load.
 * It complements the users test by exercising the catalog/content retrieval functionality.
 * 
 * Key Performance Indicators (KPIs):
 * - Request duration (P95 latency)
 * - Error rate availability
 * - Throughput (implied by VU count)
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Metric to track request failures.
 * Used for the 'errors' threshold in options.
 */
export const errorRate = new Rate('errors');

/**
 * Load Test Options
 * 
 * Configures the execution parameters for the load test.
 * This represents a high-load scenario with 260 concurrent connections.
 */
export const options = {
	// Number of concurrent Virtual Users (VUs)
	vus: 260,

	// Total duration of the test run
	duration: '30s',

	// Success Criteria
	thresholds: {
		// Latency: 95% of requests must be served in under 500ms
		'http_req_duration': ['p(95) < 500'],

		// Reliability: Error rate must be below 1% (0.01)
		'errors': ['rate<0.01'],
	},
};

// Configuration for the target environment
// Defaults to localhost, but can be targeted to staging/prod via env var
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = `${BASE_URL}/api/works`;

/**
 * VU Loop Function
 * 
 * Executes the main test logic for a single iteration.
 * K6 runs this function repeatedly for every VU until valid duration expires.
 */
export default function () {
	// Send HTTP GET request to fetch the list of works
	const res = http.get(ENDPOINT);

	// Validate response correctness
	const ok = check(res, {
		// HTTP 200 OK is required
		'status is 200': (r) => r.status === 200,

		// Response body must contain data
		'body present': (r) => r.body && r.body.length > 0,
	});

	// Record success/failure for the error rate metric
	// Pass true to .add() if it's an error (i.e., not ok)
	errorRate.add(!ok);

	// Randomized Sleep/Think Time
	// Prevents harmonic stampedes and simulates more realistic user pacing.
	// Sleeps for a random period between 0.5 and 2.5 seconds.
	sleep(0.5 + Math.random() * 2);
}
