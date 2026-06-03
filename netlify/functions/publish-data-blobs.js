const { getStore } = require('@netlify/blobs');

const JSON_HEADERS = { 'Content-Type': 'application/json; charset=utf-8' };

function reply(statusCode, payload) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) };
}

function parseJsonSafe(value) {
  if (!value) return null;
  try { return JSON.parse(value); } catch (_) { return null; }
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return reply(405, { message: 'Method not allowed' });
  }

  const expectedSecret = process.env.ADMIN_SECRET;
  if (!expectedSecret) {
    return reply(500, { message: 'ADMIN_SECRET is not configured' });
  }

  const providedSecret =
    (event.headers && event.headers['x-admin-secret']) ||
    (event.headers && event.headers['X-Admin-Secret']) ||
    '';

  if (!providedSecret || providedSecret !== expectedSecret) {
    return reply(401, { message: 'Unauthorized' });
  }

  const payload = parseJsonSafe(event.body);
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return reply(400, { message: 'Invalid JSON body' });
  }

  const updatedData = payload.updatedData;
  if (!updatedData || typeof updatedData !== 'object' || Array.isArray(updatedData)) {
    return reply(400, { message: 'updatedData is required' });
  }

  try {
    const store = getStore('game-data');
    await store.setJSON('current', updatedData);

    return reply(200, {
      ok: true,
      message: 'Datos guardados en Netlify Blobs correctamente'
    });
  } catch (error) {
    return reply(500, {
      message: error instanceof Error ? error.message : 'Unexpected Blobs error'
    });
  }
};
