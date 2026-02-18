// Netlify Function to upload base64 image content to the repo
// Expects JSON body: { filename: 'foo.png', content: '<base64 data>' }
const { Buffer } = require('buffer');

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO; // format: owner/repo
    const branch = process.env.GITHUB_BRANCH || 'main';
    if (!token || !repo) return { statusCode: 500, body: 'Missing GITHUB_TOKEN or GITHUB_REPO env var' };

    const body = JSON.parse(event.body || '{}');
    const filename = body.filename || ('upload-' + Date.now());
    const content = body.content || '';
    const path = `assets/img/uploads/${filename}`;

    const [owner, repoName] = repo.split('/');
    const apiBase = 'https://api.github.com';
    const headers = { Authorization: `token ${token}`, 'User-Agent': 'netlify-function' };

    // check if exists to get sha
    let sha = null;
    const getUrl = `${apiBase}/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
    const getRes = await fetch(getUrl, { headers });
    if (getRes.status === 200) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    const putUrl = `${apiBase}/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}`;
    const message = `Upload ${path} via Netlify admin`;
    const payload = { message, content, branch };
    if (sha) payload.sha = sha;

    const putRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    const putJson = await putRes.json();
    if (!putRes.ok) return { statusCode: putRes.status, body: JSON.stringify(putJson) };
    const url = `/assets/img/uploads/${filename}`;
    return { statusCode: 200, body: JSON.stringify({ ok: true, url, commit: putJson.commit && putJson.commit.sha }) };
  } catch (err) {
    return { statusCode: 500, body: String(err && err.message ? err.message : err) };
  }
};
