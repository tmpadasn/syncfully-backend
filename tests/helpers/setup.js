import got from 'got';
import listen from 'test-listen';
import http from 'http';
import app from '../../app.js';

export async function setupTestServer(t) {
    t.context.server = http.createServer(app);
    t.context.prefixUrl = await listen(t.context.server);
    t.context.got = got.extend({ prefixUrl: t.context.prefixUrl, responseType: 'json' });
}

export function teardownTestServer(t) {
    t.context.server.close();
}
