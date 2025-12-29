/* global __ENV */
/**
 * K6 Load Test Script: Users Endpoint
 * 
 * This script is designed to load test the /api/users endpoint of the backend service.
 * It simulates concurrent user traffic to evaluate the system's performance and stability
 * under heavy load.
 * 
 * Key Objectives:
 * 1. Measure response times (latency) for fetching user lists.
 * 2. Verify system stability (error rates) under high concurrency.
 * 3. Ensure the API meets defined Service Level Objectives (SLOs).
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

/**
 * Custom Metric: Error Rate
 * Tracks the percentage of failed requests during the test.
 * This allows us to set a threshold for acceptable failure rates (e.g., < 1%).
 */
export const errorRate = new Rate('errors');

/**
 * Test Configuration Options
 * 
 * Defines how the load test will run, including the number of virtual users (VUs),
 * duration, and pass/fail criteria (thresholds).
 */
export const options = {
	// simulate 260 concurrent users accessing the system
	vus: 260,

	// Run the test for a fixed duration of 30 seconds
	duration: '30s',

	// Pass/Fail Criteria (SLOs)
	thresholds: {
		// 95% of requests must complete within 500ms
		'http_req_duration': ['p(95) < 500'],

		// Less than 1% of requests are allowed to fail
		'errors': ['rate<0.01'],
	},
};

// Base URL configuration (can be overridden via environment variables)
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const ENDPOINT = `${BASE_URL}/api/users`;

/**
 * Main Test Function
 * 
 * This function is executed repeatedly by each Virtual User (VU).
 * It defines the user journey/behavior to be simulated.
 */
export default function () {
	// Perform a GET request to the users endpoint
	const res = http.get(ENDPOINT);

	// Validate the response
	const ok = check(res, {
		// Ensure successful HTTP status code
		'status is 200': (r) => r.status === 200,

		// Ensure the response body is not empty
		'body present': (r) => r.body && r.body.length > 0,
	});

	// Record the result (success/failure) to the metric
	// !ok means add 1 to error count if check failed
	errorRate.add(!ok);

	// Introduce a random think time (sleep) between iteration
	// Simulates real user behavior (reading/pausing) and prevents overwhelming the system
	// Sleep between 0.5s and 2.5s
	sleep(0.5 + Math.random() * 2);
}

