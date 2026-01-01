/* global __ENV */
/**
 * @fileoverview K6 Spike Test Script: Works Endpoint
 * @description Tests the /api/works endpoint under sudden traffic spikes.
 *
 * Spike testing verifies how the works catalog handles sudden traffic surges.
 * The /api/works endpoint returns the full catalog of media works (movies,
 * books, music, etc.) and may have different performance characteristics
 * than the users endpoint due to larger payload sizes.
 *
 * Key Objectives:
 * 1. Verify the works API can handle sudden traffic spikes
 * 2. Compare performance with users endpoint breaking points
 * 3. Identify bottlenecks in catalog retrieval under spike conditions
 *
 * Breaking Point Discovery:
 * This test will help determine the breaking point for /api/works endpoint.
 * Results should be compared against spike_test_users.js findings.
 *
 * @module k6/spike_test_works
 * @see spike_test_users.js - Compare with users endpoint performance
 * @see load_test_works.js - Standard load testing for works
 */

import http from 'k6/http';
import { sleep } from 'k6';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

/**
 * K6 Test Options
 *
 * Mirrors the spike profile from spike_test_users.js for consistent
 * comparison. Uses the same three-spike pattern to identify if the
 * works endpoint has similar or different breaking points.
 *
 * Spike Pattern (same as users test for comparability):
 *   ─────────────────────────────────────────────────────────────
 *   Spike 1: 0 → 500 VUs → drop to 200 VUs
 *   Spike 2: 200 → 1000 VUs → drop to 200 VUs
 *   Spike 3: 200 → 1300 VUs → drop to 200 VUs
 *   ─────────────────────────────────────────────────────────────
 *
 * Total Duration: ~17 minutes
 */
export let options = {
    /**
     * Test Stages (Virtual User Ramp Schedule)
     *
     * Three progressively larger spikes followed by recovery periods.
     * Identical to users test for A/B comparison.
     */
    stages: [
        // ─────────────────────────────────────────────────────────────────
        // SPIKE 1: Moderate Traffic Surge (500 VUs)
        // Tests basic spike handling for catalog requests
        // ─────────────────────────────────────────────────────────────────
        { duration: '2m', target: 500 },   // Ramp up to 500 users
        { duration: '1m', target: 200 },   // Recovery period

        // ─────────────────────────────────────────────────────────────────
        // SPIKE 2: Heavy Traffic Surge (1000 VUs)
        // Simulates heavy browsing of media catalog
        // ─────────────────────────────────────────────────────────────────
        { duration: '2m', target: 200 },   // Stabilization at baseline
        { duration: '2m', target: 1000 },  // Ramp up to 1000 users
        { duration: '2m', target: 200 },   // Recovery period

        // ─────────────────────────────────────────────────────────────────
        // SPIKE 3: Extreme Traffic Surge (1300 VUs)
        // Pushes catalog retrieval to maximum capacity
        // ─────────────────────────────────────────────────────────────────
        { duration: '2m', target: 200 },   // Stabilization at baseline
        { duration: '2m', target: 1300 },  // Ramp up near system limit
        { duration: '2m', target: 200 },   // Final recovery period
    ],

    /**
     * Pass/Fail Thresholds (Service Level Objectives)
     *
     * Identical thresholds to users test for consistent benchmarking.
     * Abort test immediately if error rate or latency exceeds limits.
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
 * Override for different environments (staging, production)
 * Example: k6 run -e BASE_URL=https://staging.api.com spike_test_works.js
 */
const BASE = __ENV.BASE_URL || 'http://localhost:3000';

// ============================================================================
// TEST EXECUTION
// ============================================================================

/**
 * Main Test Function (VU Loop)
 *
 * Executed repeatedly by each Virtual User throughout the test.
 * Simulates a user browsing the media catalog.
 *
 * Note: The /api/works endpoint may return larger payloads than /api/users,
 * which could affect performance characteristics under load.
 *
 * Each iteration:
 * 1. Sends GET request to /api/works
 * 2. Sleeps for 1 second (simulates browsing behavior)
 */
export default function () {
    // Fetch works catalog from API
    http.get(`${BASE}/api/works`);

    // Simulate user think time while browsing catalog
    sleep(1);
}
