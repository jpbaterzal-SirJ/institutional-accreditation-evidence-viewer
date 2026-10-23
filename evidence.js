const criteria = [
  { id: "S.1", group: "system", groupLabel: "System — Inputs and Processes", text: "The governance of the institution is clearly defined in the organizational structure." },
  { id: "S.2", group: "system", groupLabel: "System — Inputs and Processes", text: "The powers, functions/duties, and responsibilities of key officials are clearly delineated." },
  { id: "S.3", group: "system", groupLabel: "System — Inputs and Processes", text: "Administrative and academic councils/bodies exist to assist in decision-making as defined in the organizational structure." },
  { id: "I.1", group: "implementation", groupLabel: "Implementation", text: "The policy-making body demonstrates strong leadership and supports the institution's programs and operations." },
  { id: "I.2", group: "implementation", groupLabel: "Implementation", text: "The key officials follow the functional relationship structure in decision-making." },
  { id: "I.3", group: "implementation", groupLabel: "Implementation", text: "The organizational structure is used in defining the lines of communication and coordination." },
  { id: "I.4", group: "implementation", groupLabel: "Implementation", text: "The Administrative and Academic Councils function effectively." },
  { id: "O.1", group: "outcomes", groupLabel: "Outcome/s", text: "Functions of various units and implementation of programs and projects are well-coordinated." },
  { id: "O.2", group: "outcomes", groupLabel: "Outcome/s", text: "Conflict in administrative jurisdictions and official relationships are minimal." },
  { id: "O.3", group: "outcomes", groupLabel: "Outcome/s", text: "Stakeholders feel satisfied in the management of the institution." },
  { id: "O.4", group: "outcomes", groupLabel: "Outcome/s", text: "Stronger cooperation and coordination among individuals and units are observable." },
  { id: "O.5", group: "outcomes", groupLabel: "Outcome/s", text: "The governing body demonstrates integrity and objectivity in all transactions in the pursuit of the mission of the institution." },
  { id: "O.6", group: "outcomes", groupLabel: "Outcome/s", text: "Various stakeholders' expression of satisfaction with openness and transparency in the dissemination of the Governing Body's decisions." },
  { id: "BP", group: "best-practices", groupLabel: "Best Practices", text: "Noteworthy governance practices and institutional highlights." }
];

const navigation = document.querySelector("#criteria-navigation");
const documentContent = document.querySelector("#document-content");
const searchInput = document.querySelector("#criteria-search");
const filterButtons = Array.from(document.querySelectorAll(".filter-chip"));
const driveLinks = window.OMSC_EVIDENCE_LINKS || {};
let activeFilter = "all";
let activeCriterion = criteria.find((item) => item.id === new URLSearchParams(window.location.search).get("criterion")) || criteria[0];
let activeEvidenceIndex = 0;
let activeFileIndex = 0;

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function filteredCriteria() {
  const search = searchInput.value.trim().toLowerCase();
  return criteria.filter((criterion) => {
    const matchesGroup = activeFilter === "all" || criterion.group === activeFilter;
    const matchesSearch = !search || `${criterion.id} ${criterion.groupLabel} ${criterion.text}`.toLowerCase().includes(search);
    return matchesGroup && matchesSearch;
  });
}

function renderNavigation() {
  const shown = filteredCriteria();
  const grouped = new Map();
  shown.forEach((criterion) => {
    if (!grouped.has(criterion.groupLabel)) grouped.set(criterion.groupLabel, []);
    grouped.get(criterion.groupLabel).push(criterion);
  });

  navigation.innerHTML = [...grouped.entries()].map(([label, items]) => `
    <section class="criteria-group">
      <h3>${escapeHtml(label)}</h3>
      ${items.map((criterion) => `
        <button class="criterion-option${criterion.id === activeCriterion.id ? " is-selected" : ""}" type="button" data-criterion="${escapeHtml(criterion.id)}" aria-current="${criterion.id === activeCriterion.id ? "page" : "false"}">
          <span class="option-id">${escapeHtml(criterion.id)}</span><span class="option-text">${escapeHtml(criterion.text)}</span>
        </button>`).join("")}
    </section>`).join("");

  if (!shown.length) {
    navigation.innerHTML = '<p class="no-results">No criteria match your search.</p>';
  }
  navigation.querySelectorAll("[data-criterion]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = criteria.find((item) => item.id === button.dataset.criterion);
      if (selected) selectCriterion(selected);
    });
  });
}

function getPreviewUrl(url) {
  const folderId = getFolderId(url);
  if (folderId) {
    return `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`;
  }
  if (/^https:\/\/drive\.google\.com\/file\/d\/[^/]+/i.test(url)) {
    return url.replace(/\/(view|edit)(\?.*)?$/i, "/preview");
  }
  if (/^https:\/\/docs\.google\.com\/(document|spreadsheets|presentation)\/d\/[^/]+/i.test(url)) {
    return url.replace(/\/(edit|view)(\?.*)?$/i, "/preview");
  }
  return url;
}

function getFolderId(value) {
  try {
    const url = new URL(value);
    if (url.hostname !== "drive.google.com") return null;
    return url.pathname.match(/(?:^|\/)folders\/([^/]+)/i)?.[1] || null;
  } catch {
    return null;
  }
}

function getDriveUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || !["drive.google.com", "docs.google.com"].includes(url.hostname)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function getEvidenceItems(value) {
  if (!value) return [];
  const entries = Array.isArray(value) ? value : [value];
  return entries.map((entry, index) => {
    const item = typeof entry === "string" ? { url: entry } : entry;
    if (!item || typeof item.url !== "string") return null;
    const url = getDriveUrl(item.url);
    if (!url) return null;
    const isFolder = Boolean(getFolderId(url));
    const label = typeof item.label === "string" && item.label.trim()
      ? item.label.trim()
      : `${isFolder ? "Evidence folder" : "Evidence file"} ${index + 1}`;
    const path = Array.isArray(item.path)
      ? item.path.map((crumb) => {
        if (typeof crumb === "string") return { label: crumb, url: null };
        if (!crumb || typeof crumb.label !== "string") return null;
        return { label: crumb.label, url: typeof crumb.url === "string" ? getDriveUrl(crumb.url) : null };
      }).filter(Boolean)
      : [];
    const files = Array.isArray(item.files)
      ? item.files.map((file) => {
        if (!file || typeof file.url !== "string") return null;
        const fileUrl = getDriveUrl(file.url);
        if (!fileUrl || getFolderId(fileUrl)) return null;
        const name = typeof file.name === "string" && file.name.trim()
          ? file.name.trim()
          : typeof file.label === "string" && file.label.trim()
            ? file.label.trim()
            : "PDF evidence";
        return {
          name,
          url: fileUrl,
          size: typeof file.size === "string" ? file.size : "",
          modified: typeof file.modified === "string" ? file.modified : ""
        };
      }).filter(Boolean)
      : [];
    return { url, label, isFolder, path, files };
  }).filter(Boolean);
}

function getInvalidEvidenceCount(value) {
  const entries = Array.isArray(value) ? value : value ? [value] : [];
  return entries.reduce((count, entry) => {
    const item = typeof entry === "string" ? { url: entry } : entry;
    if (!item || typeof item.url !== "string" || !getDriveUrl(item.url)) return count + 1;
    const files = Array.isArray(item.files) ? item.files : [];
    return count + files.filter((file) => !file || typeof file.url !== "string" || !getDriveUrl(file.url) || getFolderId(file.url)).length;
  }, 0);
}

function renderFolderEvidence(evidence) {
  const files = evidence.files;
  const breadcrumbs = evidence.path.length ? evidence.path : [{ label: evidence.label, url: null }];
  if (breadcrumbs[breadcrumbs.length - 1].label !== evidence.label) {
    breadcrumbs.push({ label: evidence.label, url: evidence.url });
  } else if (!breadcrumbs[breadcrumbs.length - 1].url) {
    breadcrumbs[breadcrumbs.length - 1].url = evidence.url;
  }

  const breadcrumbMarkup = `
    <nav class="drive-path" aria-label="Google Drive folder path">
      ${breadcrumbs.map((crumb, index) => `
        ${index ? '<span class="path-separator" aria-hidden="true">›</span>' : ""}
        ${crumb.url && index < breadcrumbs.length - 1
          ? `<a href="${escapeHtml(crumb.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(crumb.label)}</a>`
          : `<span aria-current="page">${escapeHtml(crumb.label)}</span>`}
      `).join("")}
    </nav>`;

  if (!files.length) return `
    ${breadcrumbMarkup}
    <section class="folder-browser" aria-label="Google Drive folder contents">
      <div class="folder-browser-heading">
        <div><p class="eyebrow">Evidence files</p><h2>${escapeHtml(evidence.label)}</h2></div>
        <span class="file-count">Folder preview</span>
      </div>
      <div class="preview-frame folder-preview-frame"><iframe title="Files in Google Drive folder ${escapeHtml(evidence.label)}" src="${escapeHtml(getPreviewUrl(evidence.url))}" allow="autoplay"></iframe></div>
      <p class="preview-note">Browse the folder contents above to view its files. If Google Drive requests access, the folder must be shared with the accreditor's Google account or set to the appropriate link-viewing access.</p>
    </section>`;

  const selectedFile = files[activeFileIndex] || files[0];

  return `
    ${breadcrumbMarkup}
    <section class="pdf-library" aria-label="PDF files in this folder">
      <div class="pdf-library-heading">
        <div><p class="eyebrow">Folder contents</p><h2>Supporting documents</h2></div>
        <span class="file-count">${files.length} PDF${files.length === 1 ? "" : "s"}</span>
      </div>
      <div class="pdf-file-list">
        ${files.map((file, index) => `
          <article class="pdf-file-card${index === activeFileIndex ? " is-selected" : ""}">
            <button class="pdf-file-select" type="button" data-file-index="${index}" aria-pressed="${index === activeFileIndex}">
              <span class="pdf-icon" aria-hidden="true">PDF</span>
              <span class="pdf-file-info">
                <span class="pdf-file-name">${escapeHtml(file.name)}</span>
                <span class="pdf-file-meta">${file.modified ? `<span>Modified ${escapeHtml(file.modified)}</span>` : ""}${file.size ? `<span>${escapeHtml(file.size)}</span>` : ""}</span>
              </span>
            </button>
            <a class="pdf-open-link" href="${escapeHtml(file.url)}" target="_blank" rel="noopener noreferrer" aria-label="Open ${escapeHtml(file.name)} in Google Drive">Open <span aria-hidden="true">↗</span></a>
          </article>`).join("")}
      </div>
    </section>
    <section class="pdf-preview" aria-label="PDF preview">
      <div class="pdf-preview-heading">
        <div><p class="eyebrow">Document preview</p><h2>${escapeHtml(selectedFile.name)}</h2></div>
        <a class="button button-primary" href="${escapeHtml(selectedFile.url)}" target="_blank" rel="noopener noreferrer">Open full PDF <span aria-hidden="true">↗</span></a>
      </div>
      <div class="preview-frame pdf-preview-frame"><iframe title="PDF preview: ${escapeHtml(selectedFile.name)}" src="${escapeHtml(getPreviewUrl(selectedFile.url))}" allow="autoplay"></iframe></div>
      <p class="preview-note">If the PDF preview is unavailable, open the file directly in Google Drive. View access depends on the file's sharing settings.</p>
    </section>`;
}

function renderFolderButtons(folders) {
  return `
    <section class="folder-picker" aria-label="Evidence folders">
      <div class="folder-picker-heading">
        <div><p class="eyebrow">Browse evidence</p><h2>Evidence folders</h2></div>
        <span class="file-count">${folders.length} folder${folders.length === 1 ? "" : "s"}</span>
      </div>
      <div class="folder-picker-list">
        ${folders.map(({ evidence, index }) => `
          <button class="folder-button${index === activeEvidenceIndex ? " is-selected" : ""}" type="button" data-evidence-index="${index}" aria-pressed="${index === activeEvidenceIndex}">
            <span class="folder-button-icon" aria-hidden="true">▰</span>
            <span class="folder-button-copy"><strong>${escapeHtml(evidence.label)}</strong><small>${evidence.files.length ? `${evidence.files.length} linked PDF${evidence.files.length === 1 ? "" : "s"}` : "Browse folder contents"}</small></span>
            <span class="folder-button-arrow" aria-hidden="true">→</span>
          </button>`).join("")}
      </div>
    </section>`;
}

function renderDocument() {
  const configuredLink = driveLinks[activeCriterion.id];
  const invalidEvidenceCount = getInvalidEvidenceCount(configuredLink);
  const evidenceItems = getEvidenceItems(configuredLink);
  const folderItems = evidenceItems
    .map((item, index) => ({ evidence: item, index }))
    .filter(({ evidence }) => evidence.isFolder);
  const hasConfiguration = Boolean(configuredLink);
  const evidence = evidenceItems[activeEvidenceIndex] || evidenceItems[0];
  if (evidence && activeFileIndex >= evidence.files.length) activeFileIndex = 0;
  const linkMessage = hasConfiguration
    ? "No valid Google Drive URLs were found for this criterion. Check the links in evidence-links.js."
    : `There is no Google Drive folder or file configured for ${activeCriterion.id} yet. Add its shared URL to evidence-links.js to show the evidence here.`;
  const evidenceContent = evidence
    ? evidence.files.length || evidence.path.length
      ? renderFolderEvidence(evidence)
      : `
        ${evidenceItems.length > 1 ? `
          <div class="evidence-picker" role="group" aria-label="Evidence folders and files">
            <span class="evidence-picker-label">Evidence (${evidenceItems.length})</span>
            <div class="evidence-picker-options">
              ${evidenceItems.map((item, index) => `
                <button class="evidence-option${item === evidence ? " is-selected" : ""}" type="button" data-evidence-index="${index}" aria-pressed="${item === evidence}">
                  <span aria-hidden="true">${item.isFolder ? "▤" : "▧"}</span>${escapeHtml(item.label)}
                </button>`).join("")}
            </div>
          </div>` : ""}
        <div class="drive-actions">
          <span class="drive-status"><span class="status-dot"></span>${evidence.isFolder ? "Browse files in this Drive folder" : "Evidence file selected"}: ${escapeHtml(evidence.label)}</span>
          <a class="button button-primary" href="${escapeHtml(evidence.url)}" target="_blank" rel="noopener noreferrer">${evidence.isFolder ? "Open folder in Google Drive" : "Open file in Google Drive"} <span aria-hidden="true">↗</span></a>
        </div>
        ${invalidEvidenceCount ? `<p class="evidence-config-warning" role="alert">${invalidEvidenceCount} evidence link${invalidEvidenceCount === 1 ? "" : "s"} could not be used. Check that each URL is a valid Google Drive link in evidence-links.js.</p>` : ""}
        <div class="preview-frame"><iframe title="${evidence.isFolder ? "Files in" : "Preview of"} ${escapeHtml(evidence.label)} for ${escapeHtml(activeCriterion.id)}" src="${escapeHtml(getPreviewUrl(evidence.url))}" allow="autoplay"></iframe></div>
        <p class="preview-note">${evidence.isFolder ? "Browse the folder contents in the preview. Open the folder in Google Drive if you need the full Drive interface." : "If the preview does not load, open the file directly in Google Drive."} Access depends on the folder/file sharing settings; accreditors must be signed in if access is restricted.</p>`
    : `
      <div class="empty-evidence">
        <div class="empty-icon" aria-hidden="true">↗</div>
        <p class="eyebrow">Evidence viewer</p>
        <h2>Supporting files will appear here</h2>
        <p>${escapeHtml(linkMessage)}</p>
        <a class="text-link" href="https://drive.google.com/" target="_blank" rel="noopener noreferrer">Open Google Drive <span aria-hidden="true">↗</span></a>
      </div>`;

  documentContent.innerHTML = `
    <div class="selected-criterion">
      <p class="eyebrow">${escapeHtml(activeCriterion.groupLabel)}</p>
      <h1><span class="criterion-id">${escapeHtml(activeCriterion.id)}</span> ${escapeHtml(activeCriterion.id === "BP" ? "Best Practices" : "Accreditation Criterion")}</h1>
      <p class="selected-description">${escapeHtml(activeCriterion.text)}</p>
    </div>
    ${folderItems.length ? renderFolderButtons(folderItems) : ""}
    ${evidenceContent}`;

  documentContent.querySelectorAll("[data-evidence-index]").forEach((button) => {
    button.addEventListener("click", () => {
      activeEvidenceIndex = Number(button.dataset.evidenceIndex);
      activeFileIndex = 0;
      renderDocument();
    });
  });
  documentContent.querySelectorAll("[data-file-index]").forEach((button) => {
    button.addEventListener("click", () => {
      activeFileIndex = Number(button.dataset.fileIndex);
      renderDocument();
    });
  });
}

function selectCriterion(criterion) {
  activeCriterion = criterion;
  activeEvidenceIndex = 0;
  activeFileIndex = 0;
  const url = new URL(window.location.href);
  url.searchParams.set("criterion", criterion.id);
  window.history.replaceState({}, "", url);
  renderNavigation();
  renderDocument();
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filterButtons.forEach((filter) => filter.classList.toggle("is-active", filter === button));
    const shown = filteredCriteria();
    if (shown.length && !shown.some((criterion) => criterion.id === activeCriterion.id)) {
      selectCriterion(shown[0]);
    } else {
      renderNavigation();
    }
  });
});

searchInput.addEventListener("input", renderNavigation);
renderNavigation();
renderDocument();
