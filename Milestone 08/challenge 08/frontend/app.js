const API_BASE_URL = window.DIFFDRAFT_API_URL || 'http://localhost:3000';
const diffInput = document.querySelector('#diffInput');
const charCount = document.querySelector('#charCount');
const sampleButton = document.querySelector('#sampleButton');
const generateButton = document.querySelector('#generateButton');
const copyButton = document.querySelector('#copyButton');
const output = document.querySelector('#output');
const errorMessage = document.querySelector('#errorMessage');

const exampleDiff = `diff --git a/src/components/SaveButton.jsx b/src/components/SaveButton.jsx
index 79a02d1..06ce8b4 100644
--- a/src/components/SaveButton.jsx
+++ b/src/components/SaveButton.jsx
@@ -8,8 +8,16 @@ export function SaveButton({ onSave }) {
-  return <button onClick={onSave}>Save</button>;
+  const [saving, setSaving] = useState(false);
+
+  async function handleSave() {
+    setSaving(true);
+    await onSave();
+    setSaving(false);
+  }
+
+  return <button disabled={saving} onClick={handleSave}>
+    {saving ? 'Saving…' : 'Save'}
+  </button>;
+}`;

function updateCount() {
  charCount.textContent = `${diffInput.value.length.toLocaleString()} / 120,000`;
}

function showError(message) {
  errorMessage.textContent = message || '';
}

function setLoading(isLoading) {
  generateButton.disabled = isLoading;
  generateButton.querySelector('span').textContent = isLoading ? 'Drafting your description…' : 'Generate PR description';
  output.className = isLoading ? 'output empty-state' : 'output';
  if (isLoading) output.innerHTML = '<div class="loading">✦ Reading the shape of your change…</div>';
}

sampleButton.addEventListener('click', () => {
  diffInput.value = exampleDiff;
  updateCount();
  showError('');
  diffInput.focus();
});

diffInput.addEventListener('input', updateCount);

generateButton.addEventListener('click', async () => {
  showError('');
  if (!diffInput.value.trim()) {
    showError('Paste a git diff before generating a description.');
    diffInput.focus();
    return;
  }
  setLoading(true);
  copyButton.disabled = true;
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diff: diffInput.value })
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.error || 'Unable to generate a description.');
    output.className = 'output output-content';
    output.textContent = payload.description;
    copyButton.disabled = false;
  } catch (error) {
    output.className = 'output empty-state';
    output.innerHTML = '<div class="empty-icon">!</div><p>We could not draft this one.</p><span>Check the backend URL and try again.</span>';
    showError(error.message);
  } finally {
    setLoading(false);
  }
});

copyButton.addEventListener('click', async () => {
  await navigator.clipboard.writeText(output.textContent);
  const original = copyButton.textContent;
  copyButton.textContent = 'Copied';
  setTimeout(() => { copyButton.textContent = original; }, 1400);
});

updateCount();
