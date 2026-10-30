/**
 * Axios adapter that answers API calls from the in-memory route table instead of the network.
 * Installed only in `npm run dev:mock`; production builds never load this module.
 */

import axios, { AxiosError, type AxiosAdapter, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import apiClient from '@/lib/api/client';
import { API_BASE_URL } from '@/lib/api/config';
import { matchRoute, MockError, RawBody, currentRole } from './handlers';

// Enough delay to see loading states without slowing work down
const MIN_LATENCY_MS = 150;
const MAX_LATENCY_MS = 450;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function resolvePath(config: InternalAxiosRequestConfig): { path: string; query: Record<string, string> } {
    const url = config.url ?? '';
    const raw = /^https?:\/\//.test(url) ? url : `${config.baseURL ?? ''}${url}`;
    const parsed = new URL(raw, window.location.origin);
    const basePath = new URL(API_BASE_URL, window.location.origin).pathname.replace(/\/$/, '');

    let path = parsed.pathname;
    if (basePath && path.startsWith(basePath)) path = path.slice(basePath.length) || '/';

    const query: Record<string, string> = Object.fromEntries(parsed.searchParams);
    for (const [key, value] of Object.entries((config.params ?? {}) as Record<string, unknown>)) {
        if (value === undefined || value === null || value === '') continue;
        query[key] = Array.isArray(value) ? value.join(',') : String(value);
    }
    return { path, query };
}

function parseBody(data: unknown): Record<string, unknown> {
    if (typeof data === 'string') {
        try { return JSON.parse(data) as Record<string, unknown>; } catch { return {}; }
    }
    if (data instanceof FormData) return Object.fromEntries(data.entries());
    return (data as Record<string, unknown>) ?? {};
}

function respond(config: InternalAxiosRequestConfig, status: number, data: unknown): AxiosResponse {
    return { data, status, statusText: status < 400 ? 'OK' : 'Error', headers: {}, config, request: {} };
}

function fail(config: InternalAxiosRequestConfig, status: number, code: string, message: string): AxiosError {
    const response = respond(config, status, { success: false, error: { code, message } });
    return new AxiosError(message, status >= 500 ? AxiosError.ERR_BAD_RESPONSE : AxiosError.ERR_BAD_REQUEST, config, {}, response);
}

const mockAdapter: AxiosAdapter = async (config) => {
    await sleep(MIN_LATENCY_MS + Math.random() * (MAX_LATENCY_MS - MIN_LATENCY_MS));

    const method = (config.method ?? 'get').toUpperCase();
    const { path, query } = resolvePath(config);
    const body = parseBody(config.data);
    const match = matchRoute(method, path);

    if (!match) {
        if (method === 'GET') {
            console.warn(`[mock api] No fake data for GET ${path}. Add a route in src/mocks/handlers.ts.`);
            throw fail(config, 404, 'MOCK_NOT_FOUND', `No mock data for ${path}`);
        }
        // Let forms submit: unhandled writes succeed and echo what was sent
        console.info(`[mock api] ${method} ${path} accepted without a handler`, body);
        return respond(config, 200, { success: true, data: { id: crypto.randomUUID(), ...body } });
    }

    try {
        const result = await match.handler({ method, path, params: match.params, query, body, role: currentRole() });
        if (result instanceof RawBody) return respond(config, 200, result.body);
        return respond(config, 200, { success: true, data: result });
    } catch (error) {
        if (error instanceof MockError) throw fail(config, error.status, error.code, error.message);
        throw error;
    }
};

export function installMockApi() {
    apiClient.defaults.adapter = mockAdapter;
    // propertyService.searchProperties calls the global axios instance directly
    axios.defaults.adapter = mockAdapter;
    console.info('%c[mock api] Keystead fake data is on. Sign in as tenant@, landlord@ or agent@ (any password).', 'color:#0b65c2;font-weight:bold');
}
