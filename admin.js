const iframe = document.getElementById('editorFrame');
const btnEdit = document.getElementById('toggleEdit');
const btnSave = document.getElementById('saveBtn');
const btnReload = document.getElementById('reloadBtn');
const btnSelectText = document.getElementById('selectText');
const saveStatus = document.getElementById('saveStatus');

let editing = false;
let selectMode = null; // 'text' | 'image' | null
let lastHighlighted = null;
let dropOverlay = null;

function setEditing(enable) {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.designMode = enable ? 'on' : 'off';
    editing = enable;
    btnEdit.textContent = enable ? 'DISABLE EDITOR' : 'ENABLE EDITOR';
  } catch (e) {
    alert('Unable to toggle edit mode. Make sure the iframe content is served from the same origin.');
  }
}

iframe.addEventListener('load', () => {
  setEditing(false);
  attachSelectionHandlers();
  if (saveStatus) saveStatus.textContent = 'READY';
});

btnEdit.addEventListener('click', () => {
  setEditing(!editing);
});

btnReload.addEventListener('click', () => {
  iframe.src = '/?t=' + Date.now();
});

btnSave.addEventListener('click', async () => {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    // create a reusable drop overlay element inside the iframe (single scoped variable)
    if (!dropOverlay) {
      dropOverlay = doc.getElementById('admin-drop-overlay');
      if (!dropOverlay) {
        dropOverlay = doc.createElement('div');
        dropOverlay.id = 'admin-drop-overlay';
        dropOverlay.style.position = 'absolute';
        dropOverlay.style.zIndex = 999999;
        dropOverlay.style.display = 'none';
        dropOverlay.style.pointerEvents = 'none';
        dropOverlay.style.background = 'rgba(0,0,0,0.45)';
        dropOverlay.style.color = '#fff';
        dropOverlay.style.alignItems = 'center';
        dropOverlay.style.justifyContent = 'center';
        dropOverlay.style.textAlign = 'center';
        dropOverlay.style.fontSize = '16px';
        dropOverlay.style.fontWeight = '600';
        dropOverlay.style.borderRadius = '6px';
        dropOverlay.textContent = 'Drop image to replace';
        doc.body.appendChild(dropOverlay);
      }
    }
      if (saveStatus) saveStatus.textContent = 'Saving...';
      // cleanup admin-only artifacts inside iframe before serializing
      cleanupEditorArtifacts();
    const html = '<!doctype html>\n' + doc.documentElement.outerHTML;
    const res = await fetch('/api/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ html })
    });
    if (!res.ok) throw new Error(await res.text());
    const j = await res.json();
    alert('CHANGES APPLIED TO FOXIWEAR ' + (j.backup || 'none'));
    if (saveStatus) saveStatus.textContent = 'SAVED';
  } catch (err) {
    alert('Save failed: ' + err.message);
    if (saveStatus) saveStatus.textContent = 'FAILED TO SAVE';
  }
});

function clearHighlight() {
  if (!lastHighlighted) return;
  lastHighlighted.style.outline = lastHighlighted.__oldOutline || '';
  lastHighlighted = null;
}

function attachSelectionHandlers() {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.body.addEventListener('mousemove', (e) => {
      if (!selectMode) return;
      const el = e.target;
      if (lastHighlighted && lastHighlighted !== el) {
        lastHighlighted.style.outline = lastHighlighted.__oldOutline || '';
      }
      if (el && el !== doc.body && el !== doc.documentElement) {
        lastHighlighted = el;
        lastHighlighted.__oldOutline = lastHighlighted.style.outline;
        lastHighlighted.style.outline = '2px dashed orange';
      }
    });

    // Drag & drop: allow dropping an image file onto an <img> to replace it
    doc.body.addEventListener('dragover', (e) => {
      e.preventDefault();
      const items = (e.dataTransfer && e.dataTransfer.items) || [];
      const hasFile = Array.from(items).some(it => it.kind === 'file');
      if (!hasFile) return;
      const el = e.target;
      let imgEl = null;
      if (el && el.tagName && el.tagName.toLowerCase() === 'img') imgEl = el;
      else if (el && typeof el.closest === 'function') imgEl = el.closest('img');
      if (imgEl) {
        const rect = imgEl.getBoundingClientRect();
        dropOverlay.style.left = (rect.left + (doc.defaultView.pageXOffset || 0)) + 'px';
        dropOverlay.style.top = (rect.top + (doc.defaultView.pageYOffset || 0)) + 'px';
        dropOverlay.style.width = rect.width + 'px';
        dropOverlay.style.height = rect.height + 'px';
        dropOverlay.style.display = 'flex';
      } else {
        dropOverlay.style.display = 'none';
      }
    });

    doc.body.addEventListener('dragleave', (e) => {
      // hide overlay when leaving the document or no longer over an img
      const related = e.relatedTarget;
      if (!related || related === doc.body || related === doc.documentElement) {
        dropOverlay.style.display = 'none';
      }
    });

    doc.body.addEventListener('drop', async (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        dropOverlay.style.display = 'none';
        const file = (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]);
        if (!file) return;
        const el = e.target;
        let imgEl = null;
        if (el && el.tagName && el.tagName.toLowerCase() === 'img') imgEl = el;
        else if (el && typeof el.closest === 'function') imgEl = el.closest('img');
        if (!imgEl) {
          alert('Drop the image directly onto an existing image to replace it.');
          return;
        }
        await handleImageReplace(imgEl, file);
      } catch (err) {
        console.error('Drop handler error', err);
      }
    });

    doc.body.addEventListener('click', async (e) => {
      if (!selectMode) return;
      e.preventDefault();
      e.stopPropagation();
      const el = e.target;
      if (selectMode === 'text') {
        const curr = el.textContent || '';
        const newText = prompt('Edit text (styles will be preserved).', curr);
        if (newText !== null) {
          el.textContent = newText;
        }
      }
      // after an action, exit select mode
      selectMode = null;
      clearHighlight();
    }, true);
  } catch (e) {
    // cross-origin — selection won't work
    console.warn('Selection handlers could not be attached:', e);
  }
}

async function handleImageReplace(el, file) {
  if (!file) return;
  // preserve layout: capture computed size and attributes
  try {
    const computed = (iframe.contentWindow.getComputedStyle && iframe.contentWindow.getComputedStyle(el)) || {};
    const width = el.width || parseInt(computed.width) || el.clientWidth;
    const height = el.height || parseInt(computed.height) || el.clientHeight;
    if (width) el.style.width = (typeof width === 'number' ? width + 'px' : width);
    if (height) el.style.height = (typeof height === 'number' ? height + 'px' : height);
    // keep object-fit so image fills the box without changing layout
    if (!el.style.objectFit) el.style.objectFit = 'cover';

    const fd = new FormData();
    fd.append('file', file);
    const resp = await fetch('/api/upload', { method: 'POST', body: fd });
    if (!resp.ok) throw new Error(await resp.text());
    const j = await resp.json();
    // set a data attribute to indicate change for possible restore
    el.setAttribute('data-admin-replaced-src', j.url);
    el.src = j.url;
    if (saveStatus) saveStatus.textContent = 'Unsaved changes';
    alert('Image replaced. Click Save to persist changes.');
  } catch (err) {
    alert('Image replace failed: ' + (err.message || err));
  }
}

function cleanupEditorArtifacts() {
  try {
    const doc = iframe.contentDocument || iframe.contentWindow.document;
    if (!doc) return;
    // remove drop overlay if present
    try {
      const ov = doc.getElementById('admin-drop-overlay');
      if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
    } catch (e) {}
    // clear any inline outline styles added during selection
    try {
      const all = doc.querySelectorAll('*');
      all.forEach(el => {
        if (el.style) {
          el.style.outline = '';
          el.style.boxShadow = '';
          el.style.border = '';
        }
        // remove contenteditable attributes that may persist
        if (el.hasAttribute && el.hasAttribute('contenteditable')) {
          el.removeAttribute('contenteditable');
        }
        // remove admin tabindex markers (only those we added)
        if (el.hasAttribute && el.hasAttribute('data-admin-tabindex')) {
          el.removeAttribute('tabindex');
          el.removeAttribute('data-admin-tabindex');
        }
      });
    } catch (e) {}
    // remove admin-specific attributes
    try {
      const replaced = doc.querySelectorAll('[data-admin-replaced-src]');
      replaced.forEach(el => el.removeAttribute('data-admin-replaced-src'));
    } catch (e) {}
    // ensure designMode is off
    try { doc.designMode = 'off'; } catch (e) {}
    // reset overlay reference so it will be recreated next time
    dropOverlay = null;
  } catch (e) {
    console.warn('cleanupEditorArtifacts failed', e);
  }
}

btnSelectText.addEventListener('click', () => {
  selectMode = 'text';
  alert('CLICK SOMETHING TO EDIT.');
});
// drag & drop and click-to-edit image replacement still works via dropping onto images

// Update save status when saving
// finished
