const CONTENT_PATH = 'src/assets/data.json';

const JSON_HEADERS = {
  'Content-Type': 'application/json; charset=utf-8'
};

function reply(statusCode, payload) {
  return {
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(payload)
  };
}

function readRequiredEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error('Missing environment variable: ' + name);
  }

  return value;
}

function parseJsonSafe(value) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (_) {
    return null;
  }
}

async function githubRequest(url, options, token) {
  const headers = Object.assign(
    {
      Accept: 'application/vnd.github+json',
      Authorization: 'Bearer ' + token,
      'User-Agent': 'mundialapp2-netlify-function',
      'X-GitHub-Api-Version': '2022-11-28'
    },
    options && options.headers ? options.headers : {}
  );

  const response = await fetch(
    url,
    Object.assign({}, options, { headers })
  );

  const text = await response.text();
  const body = parseJsonSafe(text);

  if (!response.ok) {
    const message = body && typeof body.message === 'string'
      ? body.message
      : 'GitHub request failed';
    throw new Error(message);
  }

  return body;
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

  const commitMessage =
    typeof payload.commitMessage === 'string' && payload.commitMessage.trim()
      ? payload.commitMessage.trim()
      : 'chore: update src/assets/data.json';

  try {
    const token = readRequiredEnv('GITHUB_TOKEN');
    const owner = readRequiredEnv('GITHUB_OWNER');
    const repo = readRequiredEnv('GITHUB_REPO');
    const branch = process.env.GITHUB_BRANCH || 'main';

    const getUrl =
      'https://api.github.com/repos/' +
      owner +
      '/' +
      repo +
      '/contents/' +
      CONTENT_PATH +
      '?ref=' +
      encodeURIComponent(branch);

    const current = await githubRequest(getUrl, { method: 'GET' }, token);
    if (!current || !current.sha) {
      return reply(500, { message: 'Unable to read current file SHA from GitHub' });
    }

    const normalizedJson = JSON.stringify(updatedData, null, 2) + '\n';
    const encodedContent = Buffer.from(normalizedJson, 'utf8').toString('base64');

    const putUrl =
      'https://api.github.com/repos/' +
      owner +
      '/' +
      repo +
      '/contents/' +
      CONTENT_PATH;

    const updateResponse = await githubRequest(
      putUrl,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          message: commitMessage,
          content: encodedContent,
          sha: current.sha,
          branch
        })
      },
      token
    );

    return reply(200, {
      ok: true,
      message: 'Publicado en GitHub correctamente',
      commitUrl: updateResponse && updateResponse.commit ? updateResponse.commit.html_url || '' : '',
      commitSha: updateResponse && updateResponse.commit ? updateResponse.commit.sha || '' : ''
    });
  } catch (error) {
    return reply(500, {
      message: error instanceof Error ? error.message : 'Unexpected publish error'
    });
  }
};