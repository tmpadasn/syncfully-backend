/* global __ENV */
/**
 * @fileoverview K6 Spike Test Script: Users Endpoint
 * @description Tests the /api/users endpoint under sudden traffic spikes.
 *
 * Spike testing verifies system behavior when traffic suddenly increases
 * dramatically and then drops. Unlike load tests (constant load) or stress
 * tests (gradually increasing load), spike tests simulate viral events,
 * flash sales, or sudden user influxes.
 *
 * Key Objectives:
 * 1. Verify the system can handle sudden traffic spikes without crashing
 * 2. Measure recovery time after traffic normalizes
 * 3. Identify breaking points under rapid load changes
 *
 * Breaking Point Discovery:
 * Based on previous testing, the /api/users endpoint breaking point
 * appears to be around 1400-1600 concurrent users.
 *
 * @module k6/spike_test_users
 * @see load_test_users.js - Standard load testing
 * @see stress_test_users.js - Gradual stress testing
 */

import http from 'k6/http';
import { sleep } from 'k6';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

/**
 * K6 Test Options
 *
 * Defines the spike test execution profile with three progressively
 * larger traffic spikes, each followed by a recovery period.
 *
 * Spike Pattern:
 *   ─────────────────────────────────────────────────────────────
 *   Spike 1: 0 → 500 VUs (2min) → hold → drop to 200 (1min)
 *   Spike 2: 200 → 1000 VUs (2min) → hold → drop to 200 (2min)
 *   Spike 3: 200 → 1300 VUs (2min) → hold → drop to 200 (2min)
 *   ─────────────────────────────────────────────────────────────
 *
 * Total Duration: ~17 minutes
 */
export let options = {
    /**
     * Test Stages (Virtual User Ramp Schedule)
     *
     * Each stage defines:
     *   - duration: How long this stage lasts
     *   - target: Number of VUs to reach by end of stage
     *
     * The test progressively increases spike magnitude to find limits.
     */
    stages: [
        // ─────────────────────────────────────────────────────────────────
        // SPIKE 1: Moderate Traffic Surge (500 VUs)
        // Simulates a small viral event or marketing campaign launch
        // ─────────────────────────────────────────────────────────────────
        { duration: '2m', target: 500 },   // Ramp up to 500 users
        { duration: '1m', target: 200 },   // Recovery period - drop to baseline

        // ─────────────────────────────────────────────────────────────────
        // SPIKE 2: Heavy Traffic Surge (1000 VUs)
        // Simulates a popular content release or peak usage
        // ─────────────────────────────────────────────────────────────────
        { duration: '2m', target: 200 },   // Stabilization at baseline
        { duration: '2m', target: 1000 },  // Ramp up to 1000 users
        { duration: '2m', target: 200 },   // Recovery period

        // ─────────────────────────────────────────────────────────────────
        // SPIKE 3: Extreme Traffic Surge (1300 VUs)
        // Pushes system near breaking point (~1400-1600)
        // ─────────────────────────────────────────────────────────────────
        { duration: '2m', target: 200 },   // Stabilization at baseline
        { duration: '2m', target: 1300 },  // Ramp up to 1300 users (near limit)
        { duration: '2m', target: 200 },   // Final recovery period
    ],

    /**
     * Pass/Fail Thresholds (Service Level Objectives)
     *
     * These thresholds define when the test should abort due to
     * unacceptable performance degradation.
     */
    thresholds: {
        // Error rate must stay below 0.1% - abort if exceeded
        http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],

        // 95th percentile response time must stay under 500ms
        http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],
    },
};

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Base URL for API requests
 * Defaults to localhost:3000, but can be overridden via environment variable
 * Example: k6 run -e BASE_URL=https://staging.example.com spike_test_users.js
 */
const BASE = __ENV.BASE_URL || 'http://localhost:3000';

// ============================================================================
// TEST EXECUTION
// ============================================================================

/**
 * Main Test Function (VU Loop)
 *
 * Executed repeatedly by each Virtual User throughout the test.
 * Simulates a user fetching the list of all users.
 *
 * Each iteration:
 * 1. Sends GET request to /api/users
 * 2. Sleeps for 1 second (simulates user reading/thinking time)
 */
export default function () {
    // Fetch users list from API
    http.get(`${BASE}/api/users`);

    // Simulate user think time between requests
    // Prevents unrealistic request flooding
    sleep(1);
}
