const { getStore } = require('@netlify/blobs');

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8',
  'Cache-Control': 'no-store'
};

function reply(statusCode, payload) {
  return { statusCode, headers: JSON_HEADERS, body: JSON.stringify(payload) };
}

function createGameDataStore() {
  const siteID = process.env.SITE_ID;
  const token = process.env.NETLIFY_TOKEN;

  if ((siteID && !token) || (!siteID && token)) {
    throw new Error('Blobs manual config is incomplete: set both SITE_ID and NETLIFY_TOKEN, or set neither to use Netlify runtime credentials');
  }

  if (siteID && token) {
    return getStore({
      name: 'game-data',
      siteID,
      token
    });
  }

  return getStore({ name: 'game-data' });
}

exports.handler = async () => {
  try {
    const store = createGameDataStore();
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
