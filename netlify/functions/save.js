// Netlify Function to save file content to GitHub repo using REST API
// Expects JSON body: { path: 'index.html', content: '<full html>' }

const { Buffer } = require('buffer');

exports.handler = async function (event) {
  try {
    if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
    const token = process.env.GITHUB_TOKEN;
    const repo = process.env.GITHUB_REPO; // format: owner/repo
    const branch = process.env.GITHUB_BRANCH || 'main';
    if (!token || !repo) return { statusCode: 500, body: 'Missing GITHUB_TOKEN or GITHUB_REPO env var' };

    const body = JSON.parse(event.body || '{}');
    const path = body.path || 'index.html';
    const content = body.content || '';

    const [owner, repoName] = repo.split('/');
    const apiBase = 'https://api.github.com';
    // check if file exists to get sha
    const getUrl = `${apiBase}/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`;
    const headers = { Authorization: `token ${token}`, 'User-Agent': 'netlify-function' };
    let sha = null;
    const getRes = await fetch(getUrl, { headers });
    if (getRes.status === 200) {
      const getJson = await getRes.json();
      sha = getJson.sha;
    }

    const putUrl = `${apiBase}/repos/${owner}/${repoName}/contents/${encodeURIComponent(path)}`;
    const message = `Update ${path} via Netlify admin`;
    const b64 = Buffer.from(content, 'utf8').toString('base64');
    const payload = { message, content: b64, branch };
    if (sha) payload.sha = sha;

    const putRes = await fetch(putUrl, { method: 'PUT', headers: { ...headers, 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
    const putJson = await putRes.json();
    if (!putRes.ok) return { statusCode: putRes.status, body: JSON.stringify(putJson) };
    return { statusCode: 200, body: JSON.stringify({ ok: true, commit: putJson.commit && putJson.commit.sha }) };
  } catch (err) {
    return { statusCode: 500, body: String(err && err.message ? err.message : err) };
  }
};
