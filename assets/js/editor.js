const REPO_OWNER = "bernardksarpong";
const REPO_NAME = "bernardksarpong.github.io";
const DEFAULT_BRANCH = "main";
const API_BASE = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents`;
const STORAGE_KEY = "bernard-site-editor-token";

const sectionSchemas = {
  profile: {
    path: "_data/profile.yml",
    message: "Update profile content via site editor",
    containerId: "profile-fields",
    fields: [
      { type: "text", key: "name", label: "Full name" },
      { type: "text", key: "title", label: "Professional title" },
      { type: "text", key: "subtitle", label: "Homepage subtitle", full: true },
      { type: "text", key: "location", label: "Location" },
      {
        type: "list",
        key: "biography",
        label: "Biography paragraphs",
        full: true,
        addLabel: "Add biography paragraph",
        itemType: "textarea",
      },
      {
        type: "list",
        key: "education",
        label: "Education entries",
        full: true,
        addLabel: "Add education entry",
        itemType: "object",
        fields: [
          { type: "text", key: "degree", label: "Degree", full: true },
          { type: "text", key: "institution", label: "Institution" },
          { type: "text", key: "location", label: "Location" },
          { type: "text", key: "dates", label: "Dates" },
          { type: "textarea", key: "dissertation", label: "Dissertation", full: true },
          { type: "textarea", key: "distinction", label: "Prize / distinction", full: true },
        ],
      },
      {
        type: "list",
        key: "research_fields",
        label: "Research fields",
        full: true,
        addLabel: "Add research field",
        itemType: "text",
      },
      {
        type: "list",
        key: "research_interests",
        label: "Research interests",
        full: true,
        addLabel: "Add research interest",
        itemType: "text",
      },
    ],
  },
  research: {
    path: "_data/research.yml",
    message: "Update research content via site editor",
    containerId: "research-fields",
    fields: [
      {
        type: "list",
        key: "overview",
        label: "Research overview paragraphs",
        full: true,
        addLabel: "Add overview paragraph",
        itemType: "textarea",
      },
      { type: "text", key: "scholar.label", label: "Scholar label" },
      { type: "text", key: "scholar.note", label: "Scholar note", full: true },
      { type: "url", key: "scholar.url", label: "Scholar URL", full: true },
    ],
  },
  experience: {
    path: "_data/experience.yml",
    message: "Update experience content via site editor",
    containerId: "experience-fields",
    fields: [
      {
        type: "list",
        key: "teaching_experience",
        label: "Teaching experience",
        full: true,
        addLabel: "Add teaching role",
        itemType: "object",
        fields: [
          { type: "text", key: "role", label: "Role", full: true },
          { type: "text", key: "institution", label: "Institution" },
          { type: "text", key: "location", label: "Location" },
          { type: "text", key: "dates", label: "Dates" },
          {
            type: "list",
            key: "highlights",
            label: "Highlights",
            full: true,
            addLabel: "Add highlight",
            itemType: "textarea",
          },
        ],
      },
    ],
  },
  publications: {
    path: "_data/publications.yml",
    message: "Update publications content via site editor",
    containerId: "publications-fields",
    fields: [
      {
        type: "list",
        key: "intro",
        label: "Intro paragraphs",
        full: true,
        addLabel: "Add intro paragraph",
        itemType: "textarea",
      },
      {
        type: "list",
        key: "published_work",
        label: "Peer-reviewed publications",
        full: true,
        addLabel: "Add publication",
        itemType: "object",
        fields: [
          { type: "text", key: "title", label: "Title", full: true },
          { type: "textarea", key: "citation", label: "Citation", full: true },
        ],
      },
      { type: "text", key: "published_note", label: "Published work note", full: true },
      {
        type: "list",
        key: "working_papers",
        label: "Working papers",
        full: true,
        addLabel: "Add working paper",
        itemType: "object",
        fields: [
          { type: "text", key: "authors", label: "Authors", full: true },
          { type: "text", key: "year", label: "Year" },
          { type: "text", key: "title", label: "Title", full: true },
          { type: "textarea", key: "status", label: "Status / note", full: true },
        ],
      },
      { type: "text", key: "scholar_note", label: "Scholar note", full: true },
    ],
  },
  contact: {
    path: "_data/contact.yml",
    message: "Update contact content via site editor",
    containerId: "contact-fields",
    fields: [
      { type: "text", key: "location", label: "Location" },
      { type: "email", key: "email", label: "Email" },
      { type: "email", key: "official_email", label: "Official / work email", full: true },
      { type: "text", key: "google_scholar_label", label: "Google Scholar label" },
      { type: "text", key: "google_scholar_note", label: "Google Scholar note", full: true },
      { type: "url", key: "google_scholar_url", label: "Google Scholar URL", full: true },
    ],
  },
};

const state = {
  token: "",
  sections: {},
  busy: false,
};

document.addEventListener("DOMContentLoaded", () => {
  wireEditor();
  restoreToken();
  loadAllSections();
});

function wireEditor() {
  document.getElementById("load-content").addEventListener("click", () => loadAllSections());
  document.getElementById("test-token").addEventListener("click", () => testToken());
  document.getElementById("save-all").addEventListener("click", () => saveAllSections());
  document.getElementById("upload-profile").addEventListener("click", () => uploadProfileImage());
  document.getElementById("upload-cv").addEventListener("click", () => uploadCvFile());
  document.getElementById("remember-token").addEventListener("change", syncStoredToken);
  document.getElementById("github-token").addEventListener("input", syncStoredToken);

  document.querySelectorAll("[data-save-section]").forEach((button) => {
    button.addEventListener("click", () => saveSection(button.dataset.saveSection));
  });
}

function restoreToken() {
  const storedToken = localStorage.getItem(STORAGE_KEY);
  if (storedToken) {
    document.getElementById("github-token").value = storedToken;
    document.getElementById("remember-token").checked = true;
    state.token = storedToken;
  }
}

function syncStoredToken() {
  const token = getToken();
  const remember = document.getElementById("remember-token").checked;

  state.token = token;
  if (remember && token) {
    localStorage.setItem(STORAGE_KEY, token);
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

async function loadAllSections() {
  if (state.busy) {
    return;
  }

  try {
    setBusy(true);
    setStatus("Loading the current site content from GitHub...", "warning");

    for (const sectionId of Object.keys(sectionSchemas)) {
      await loadSection(sectionId);
    }

    refreshAssetPreviews();
    setStatus("Content loaded. You can edit the forms below and save any section you change.", "success");
  } catch (error) {
    setStatus(`Could not load the current content: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function testToken() {
  if (state.busy) {
    return;
  }

  try {
    requireToken();
    setBusy(true);
    setStatus("Testing the GitHub token...", "warning");

    const userResponse = await fetch("https://api.github.com/user", {
      headers: buildHeaders(getToken()),
    });

    if (userResponse.status === 401) {
      throw new Error("GitHub rejected the token. Paste a fresh token exactly as copied from GitHub. Fine-grained tokens usually start with github_pat_.");
    }

    if (!userResponse.ok) {
      const message = await readGitHubError(userResponse);
      throw new Error(`GitHub could not validate the token. ${message}`);
    }

    const user = await userResponse.json();
    const repoResponse = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`, {
      headers: buildHeaders(getToken()),
    });

    if (repoResponse.status === 404 || repoResponse.status === 403) {
      throw new Error(`The token belongs to ${user.login}, but it does not have access to ${REPO_OWNER}/${REPO_NAME}. Create a fine-grained token for this repository with Contents set to Read and write.`);
    }

    if (!repoResponse.ok) {
      const message = await readGitHubError(repoResponse);
      throw new Error(`The token was accepted, but repository access could not be verified. ${message}`);
    }

    setStatus(`Token works. Authenticated as ${user.login} and repository access is available.`, "success");
  } catch (error) {
    setStatus(error.message, "error");
  } finally {
    setBusy(false);
  }
}

async function loadSection(sectionId) {
  const schema = sectionSchemas[sectionId];
  const fileData = await fetchRepoFile(schema.path, getToken());
  const parsed = window.jsyaml.load(fileData.content) || {};

  state.sections[sectionId] = {
    sha: fileData.sha,
    data: parsed,
  };

  renderSection(schema, parsed);
}

function renderSection(schema, data) {
  const container = document.getElementById(schema.containerId);
  container.innerHTML = "";

  schema.fields.forEach((field) => {
    container.appendChild(renderField(field, getValueByPath(data, field.key)));
  });
}

function renderField(field, value) {
  if (field.type === "list") {
    return renderListField(field, Array.isArray(value) ? value : []);
  }

  return renderPrimitiveField(field, typeof value === "undefined" ? "" : value);
}

function renderPrimitiveField(field, value) {
  const wrapper = document.createElement("div");
  wrapper.className = `editor-field${field.full ? " editor-field-full" : ""}`;
  wrapper.dataset.fieldKey = field.key;
  wrapper.dataset.fieldType = field.type;

  const label = document.createElement("label");
  label.textContent = field.label;
  wrapper.appendChild(label);

  let input;
  if (field.type === "textarea") {
    input = document.createElement("textarea");
  } else {
    input = document.createElement("input");
    input.type = field.type;
  }

  input.value = value || "";
  input.dataset.role = "input";
  wrapper.appendChild(input);
  return wrapper;
}

function renderListField(field, items) {
  const wrapper = document.createElement("div");
  wrapper.className = `editor-field editor-list-field${field.full ? " editor-field-full" : ""}`;
  wrapper.dataset.fieldKey = field.key;
  wrapper.dataset.fieldType = field.type;

  const label = document.createElement("label");
  label.textContent = field.label;
  wrapper.appendChild(label);

  const list = document.createElement("div");
  list.className = "editor-list";

  const itemsContainer = document.createElement("div");
  itemsContainer.className = "editor-list-items";
  itemsContainer.dataset.role = "list-items";

  if (items.length > 0) {
    items.forEach((item, index) => itemsContainer.appendChild(renderListItem(field, item, index)));
  }

  const addButton = document.createElement("button");
  addButton.type = "button";
  addButton.className = "button button-secondary";
  addButton.textContent = field.addLabel || "Add item";
  addButton.addEventListener("click", () => {
    itemsContainer.appendChild(renderListItem(field, blankListItemValue(field), itemsContainer.children.length));
  });

  list.appendChild(itemsContainer);
  list.appendChild(addButton);
  wrapper.appendChild(list);
  return wrapper;
}

function renderListItem(field, value, index) {
  const item = document.createElement("div");
  item.className = "editor-list-item";
  item.dataset.itemType = field.itemType;

  const head = document.createElement("div");
  head.className = "editor-list-item-head";

  const title = document.createElement("p");
  title.className = "editor-list-item-title";
  const baseLabel = field.itemLabel || (field.addLabel ? field.addLabel.replace(/^Add\s+/i, "") : "Item");
  title.textContent = `${capitalize(baseLabel)} ${index + 1}`;
  head.appendChild(title);

  const removeButton = document.createElement("button");
  removeButton.type = "button";
  removeButton.className = "button button-danger";
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", () => item.remove());
  head.appendChild(removeButton);

  item.appendChild(head);

  if (field.itemType === "object") {
    const objectFields = document.createElement("div");
    objectFields.className = "editor-object-fields";
    objectFields.dataset.role = "object-fields";

    field.fields.forEach((subField) => {
      objectFields.appendChild(renderField(subField, getValueByPath(value || {}, subField.key)));
    });

    item.appendChild(objectFields);
  } else {
    item.appendChild(renderPrimitiveField({ type: field.itemType, key: field.key, label: field.label, full: true }, value || ""));
  }

  return item;
}

function blankListItemValue(field) {
  if (field.itemType !== "object") {
    return "";
  }

  const blank = {};
  field.fields.forEach((subField) => {
    blank[subField.key] = subField.type === "list" ? [] : "";
  });
  return blank;
}

async function saveSection(sectionId) {
  if (state.busy) {
    return;
  }

  try {
    requireToken();
    setBusy(true);
    setStatus(`Saving ${sectionId}...`, "warning");

    const schema = sectionSchemas[sectionId];
    const current = state.sections[sectionId];
    if (!current) {
      await loadSection(sectionId);
    }

    const nextData = deepClone(state.sections[sectionId].data || {});
    const container = document.getElementById(schema.containerId);

    schema.fields.forEach((field) => {
      const fieldElement = Array.from(container.children).find((child) => child.dataset.fieldKey === field.key);
      const fieldValue = readField(fieldElement, field);
      setValueByPath(nextData, field.key, fieldValue);
    });

    const yamlContent = `${window.jsyaml.dump(nextData, { lineWidth: 1000, noRefs: true })}`;
    const updated = await updateRepoFile(schema.path, yamlContent, state.sections[sectionId].sha, schema.message, getToken());

    state.sections[sectionId] = {
      sha: updated.content.sha,
      data: nextData,
    };

    setStatus(`${capitalize(sectionId)} saved. GitHub Pages will refresh the public site in a moment.`, "success");
  } catch (error) {
    setStatus(`Could not save ${sectionId}: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function saveAllSections() {
  if (state.busy) {
    return;
  }

  try {
    requireToken();
    setBusy(true);
    setStatus("Saving all text sections...", "warning");

    for (const sectionId of Object.keys(sectionSchemas)) {
      const schema = sectionSchemas[sectionId];
      const container = document.getElementById(schema.containerId);
      const nextData = deepClone(state.sections[sectionId].data || {});

      schema.fields.forEach((field) => {
        const fieldElement = Array.from(container.children).find((child) => child.dataset.fieldKey === field.key);
        const fieldValue = readField(fieldElement, field);
        setValueByPath(nextData, field.key, fieldValue);
      });

      const yamlContent = `${window.jsyaml.dump(nextData, { lineWidth: 1000, noRefs: true })}`;
      const updated = await updateRepoFile(schema.path, yamlContent, state.sections[sectionId].sha, schema.message, getToken());

      state.sections[sectionId] = {
        sha: updated.content.sha,
        data: nextData,
      };
    }

    setStatus("All text sections were saved. GitHub Pages will publish the changes shortly.", "success");
  } catch (error) {
    setStatus(`Could not save all sections: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

function readField(fieldElement, field) {
  if (field.type !== "list") {
    return fieldElement.querySelector("[data-role='input']").value.trim();
  }

  const itemElements = Array.from(fieldElement.querySelector("[data-role='list-items']").children);

  if (field.itemType === "object") {
    return itemElements
      .map((item) => {
        const objectValue = {};
        const objectFields = item.querySelector("[data-role='object-fields']");

        field.fields.forEach((subField) => {
          const subFieldElement = Array.from(objectFields.children).find((child) => child.dataset.fieldKey === subField.key);
          const subFieldValue = readField(subFieldElement, subField);
          if (subField.type === "list") {
            objectValue[subField.key] = subFieldValue;
          } else if (subFieldValue !== "") {
            objectValue[subField.key] = subFieldValue;
          }
        });

        return pruneEmptyObject(objectValue);
      })
      .filter((item) => Object.keys(item).length > 0);
  }

  return itemElements
    .map((item) => item.querySelector("[data-role='input']").value.trim())
    .filter((value) => value !== "");
}

async function uploadProfileImage() {
  if (state.busy) {
    return;
  }

  try {
    requireToken();
    const input = document.getElementById("profile-upload");
    const file = input.files[0];
    if (!file) {
      throw new Error("Choose an image file first.");
    }

    setBusy(true);
    setStatus("Uploading profile image...", "warning");

    const base64 = await imageToJpegBase64(file);
    const existing = await fetchRepoMeta("assets/img/profile.jpg", getToken());
    await updateRepoFile("assets/img/profile.jpg", base64, existing.sha, "Update profile image via site editor", getToken(), true);

    refreshAssetPreviews();
    input.value = "";
    setStatus("Profile image uploaded. GitHub Pages will refresh the public site shortly.", "success");
  } catch (error) {
    setStatus(`Could not upload the profile image: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function uploadCvFile() {
  if (state.busy) {
    return;
  }

  try {
    requireToken();
    const input = document.getElementById("cv-upload");
    const file = input.files[0];
    if (!file) {
      throw new Error("Choose a PDF file first.");
    }

    if (!file.name.toLowerCase().endsWith(".pdf")) {
      throw new Error("The CV upload must be a PDF file.");
    }

    setBusy(true);
    setStatus("Uploading CV PDF...", "warning");

    const base64 = await fileToBase64(file);
    const existing = await fetchRepoMeta("assets/files/Bernard_Sarpong_CV.pdf", getToken());
    await updateRepoFile("assets/files/Bernard_Sarpong_CV.pdf", base64, existing.sha, "Update CV PDF via site editor", getToken(), true);

    refreshAssetPreviews();
    input.value = "";
    setStatus("CV PDF uploaded. GitHub Pages will refresh the public site shortly.", "success");
  } catch (error) {
    setStatus(`Could not upload the CV PDF: ${error.message}`, "error");
  } finally {
    setBusy(false);
  }
}

async function fetchRepoFile(path, token) {
  const response = await fetch(`${API_BASE}/${encodePath(path)}?ref=${DEFAULT_BRANCH}`, {
    headers: buildHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} while loading ${path}.`);
  }

  const payload = await response.json();
  return {
    sha: payload.sha,
    content: decodeBase64(payload.content),
  };
}

async function fetchRepoMeta(path, token) {
  const response = await fetch(`${API_BASE}/${encodePath(path)}?ref=${DEFAULT_BRANCH}`, {
    headers: buildHeaders(token),
  });

  if (!response.ok) {
    throw new Error(`GitHub returned ${response.status} while loading ${path}.`);
  }

  const payload = await response.json();
  return {
    sha: payload.sha,
  };
}

async function updateRepoFile(path, content, sha, message, token, isBinary = false) {
  const encodedContent = isBinary ? content : encodeBase64(content);
  let response = await sendRepoUpdate(path, encodedContent, sha, message, token);

  if (response.status === 409) {
    const latest = await fetchRepoMeta(path, token);
    response = await sendRepoUpdate(path, encodedContent, latest.sha, message, token);
  }

  if (!response.ok) {
    const errorText = await readGitHubError(response);

    if (response.status === 401) {
      throw new Error(`GitHub rejected the token while saving ${path}. Paste a fresh token exactly as copied from GitHub and test it before saving again.`);
    }

    if (response.status === 403 || response.status === 404) {
      throw new Error(`The token was accepted but does not have write access to ${path}. Use a token for this repository with Contents set to Read and write. ${errorText}`);
    }

    if (response.status === 409) {
      throw new Error(`GitHub reported a file version conflict for ${path}. The editor retried with the latest version, but the conflict remained. Load current content and save again.`);
    }

    throw new Error(`GitHub returned ${response.status} while saving ${path}. ${errorText}`);
  }

  return response.json();
}

async function sendRepoUpdate(path, encodedContent, sha, message, token) {
  return fetch(`${API_BASE}/${encodePath(path)}`, {
    method: "PUT",
    headers: buildHeaders(token),
    body: JSON.stringify({
      message,
      content: encodedContent,
      sha,
      branch: DEFAULT_BRANCH,
    }),
  });
}

function buildHeaders(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getToken() {
  return document
    .getElementById("github-token")
    .value
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\s+/g, "");
}

function requireToken() {
  if (!getToken()) {
    throw new Error("Paste a GitHub fine-grained token before saving.");
  }
}

function setBusy(isBusy) {
  state.busy = isBusy;
  document.querySelectorAll("button").forEach((button) => {
    button.disabled = isBusy;
  });
}

function setStatus(message, type = "") {
  const status = document.getElementById("editor-status");
  status.textContent = message;
  status.className = `editor-status${type ? ` ${type}` : ""}`;
}

function refreshAssetPreviews() {
  const stamp = Date.now();
  document.getElementById("profile-preview").src = `/assets/img/profile.jpg?v=${stamp}`;
  document.getElementById("cv-preview-link").href = `/assets/files/Bernard_Sarpong_CV.pdf?v=${stamp}`;
}

function getValueByPath(object, path) {
  return path.split(".").reduce((current, key) => (current ? current[key] : undefined), object);
}

function setValueByPath(object, path, value) {
  const keys = path.split(".");
  let current = object;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
      return;
    }

    if (!current[key] || typeof current[key] !== "object" || Array.isArray(current[key])) {
      current[key] = {};
    }
    current = current[key];
  });
}

function pruneEmptyObject(object) {
  const next = {};
  Object.entries(object).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      if (value.length > 0) {
        next[key] = value;
      }
    } else if (value && typeof value === "object") {
      const nested = pruneEmptyObject(value);
      if (Object.keys(nested).length > 0) {
        next[key] = nested;
      }
    } else if (value !== "") {
      next[key] = value;
    }
  });
  return next;
}

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function decodeBase64(base64) {
  const cleaned = base64.replace(/\n/g, "");
  const binary = window.atob(cleaned);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function encodeBase64(text) {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return window.btoa(binary);
}

async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const [, base64] = reader.result.split(",");
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read the selected file."));
    reader.readAsDataURL(file);
  });
}

async function imageToJpegBase64(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the selected image."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not process the selected image."));
    img.src = dataUrl;
  });

  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0);

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
  if (!blob) {
    throw new Error("Could not convert the image to JPEG.");
  }

  return fileToBase64(blob);
}

function encodePath(path) {
  return path.split("/").map(encodeURIComponent).join("/");
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

async function readGitHubError(response) {
  const text = await response.text();

  try {
    const payload = JSON.parse(text);
    return payload.message || text;
  } catch {
    return text;
  }
}
