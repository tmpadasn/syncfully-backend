/* global __ENV */
/**
 * @fileoverview K6 Stress Test Script: Users Endpoint
 * @description Tests the /api/users endpoint under progressively increasing load.
 *
 * Stress testing differs from load testing by continuously ramping up traffic
 * until the system breaks. This helps identify:
 * - Maximum system capacity before failure
 * - Behavior during overload conditions
 * - Recovery characteristics after stress is removed
 *
 * Unlike spike tests (sudden surges), stress tests apply gradual, sustained
 * pressure to find the exact breaking point methodically.
 *
 * Key Objectives:
 * 1. Determine maximum concurrent user capacity
 * 2. Identify performance degradation patterns under stress
 * 3. Measure system recovery after load is removed
 * 4. Verify minimum throughput requirements (100 req/s)
 *
 * Breaking Point Discovery:
 * Previous testing indicates the /api/users breaking point is
 * around 1400-1600 concurrent users. This test pushes to 1700 to confirm.
 *
 * @module k6/stress_test_users
 * @see load_test_users.js - Standard load testing (constant load)
 * @see spike_test_users.js - Spike testing (sudden surges)
 */

import http from 'k6/http';
import { sleep } from 'k6';

// ============================================================================
// TEST CONFIGURATION
// ============================================================================

/**
 * K6 Test Options
 *
 * Defines a gradual ramp-up pattern that pushes the system beyond
 * its expected capacity, then ramps down to observe recovery.
 *
 * Load Profile (Staircase Pattern):
 *   ─────────────────────────────────────────────────────────────────
 *   VUs │                                    ████████
 *  1700 │                                    ████████
 *       │                          ████████████████████
 *  1000 │                          ██████████████████████████
 *       │              ████████████████████████████████████████
 *   500 │              ██████████████████████████████████████████████
 *       │    ████████████████████████████████████████████████████████
 *    10 │ ██████████████████████████████████████████████████████████████
 *       └──────────────────────────────────────────────────────────────
 *         20s     1m       1m       1m       1m
 *         Warmup  Ramp     Ramp     Peak     Cooldown
 *   ─────────────────────────────────────────────────────────────────
 *
 * Total Duration: ~4 minutes 20 seconds
 */
export let options = {
  /**
   * Test Stages (Virtual User Ramp Schedule)
   *
   * Progressively increases load to find the breaking point,
   * then ramps down to observe system recovery.
   */
  stages: [
    // ─────────────────────────────────────────────────────────────────
    // WARMUP PHASE: Gentle start to establish baseline
    // ─────────────────────────────────────────────────────────────────
    { duration: '20s', target: 10 },     // Start with 10 users

    // ─────────────────────────────────────────────────────────────────
    // RAMP-UP PHASE 1: Moderate load (500 VUs)
    // System should handle this comfortably
    // ─────────────────────────────────────────────────────────────────
    { duration: '1m', target: 500 },     // Ramp to 500 users

    // ─────────────────────────────────────────────────────────────────
    // RAMP-UP PHASE 2: Heavy load (1000 VUs)
    // Performance should remain acceptable
    // ─────────────────────────────────────────────────────────────────
    { duration: '1m', target: 1000 },    // Ramp to 1000 users

    // ─────────────────────────────────────────────────────────────────
    // STRESS PHASE: Beyond capacity (1700 VUs)
    // Exceeds expected breaking point (~1400-1600) to confirm limits
    // ─────────────────────────────────────────────────────────────────
    { duration: '1m', target: 1700 },    // Push beyond breaking point

    // ─────────────────────────────────────────────────────────────────
    // RECOVERY PHASE: Ramp down to zero
    // Observe how quickly system recovers after overload
    // ─────────────────────────────────────────────────────────────────
    { duration: '1m', target: 0 },       // Ramp down to 0 users
  ],

  /**
   * Pass/Fail Thresholds (Service Level Objectives)
   *
   * These thresholds abort the test when exceeded, marking the
   * point where system performance becomes unacceptable.
   */
  thresholds: {
    // Error rate must stay below 0.1% - abort on failure
    http_req_failed: [{ threshold: 'rate<0.001', abortOnFail: true }],

    // 95th percentile latency must stay under 500ms - abort on failure
    http_req_duration: [{ threshold: 'p(95)<500', abortOnFail: true }],

    // Minimum throughput requirement: 100 requests per second
    // This ensures the system maintains adequate capacity even under stress
    http_reqs: ['rate>100'],
  },
};

// ============================================================================
// ENVIRONMENT CONFIGURATION
// ============================================================================

/**
 * Base URL for API requests
 * Configure via environment variable for different environments
 * Example: k6 run -e BASE_URL=https://staging.example.com stress_test_users.js
 */
const BASE = __ENV.BASE_URL || 'http://localhost:3000';

// ============================================================================
// TEST EXECUTION
// ============================================================================

/**
 * Main Test Function (VU Loop)
 *
 * Executed continuously by each Virtual User until test duration expires.
 * Simulates users requesting the full users list.
 *
 * Each iteration:
 * 1. Sends GET request to /api/users
 * 2. Sleeps for 1 second (realistic user pacing)
 *
 * Note: During stress phase, many concurrent VUs will be executing this,
 * generating high load on the backend and database.
 */
export default function () {
  // Fetch users list from API
  http.get(`${BASE}/api/users`);

  // Simulate realistic user think time
  // Also prevents a single VU from overwhelming the server
  sleep(1);
}
