const { getStore } = require('@netlify/blobs');

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function reply(statusCode, payload) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) };
}

exports.handler = async () => {
  try {
    const store = getStore('game-data');
    const data = await store.get('current', { type: 'json' });

    if (!data) {
      return reply(404, { message: 'No data in Blobs store yet' });
    }

    return reply(200, data);
  } catch (error) {
    return reply(500, {
      message: error instanceof Error ? error.message : 'Failed to read from Blobs'
    });
  }
};
