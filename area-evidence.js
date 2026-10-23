(() => {
  const navigation = document.querySelector("#criterion-navigation");
  const navigationStatus = document.querySelector("#criterion-navigation-status");
  const browser = document.querySelector("#area-source-browser");
  const areas = window.OMSC_ACCREDITATION_AREAS || {};
  const criteriaById = new Map();
  const groups = [
    ["system", "System — Inputs and Processes"],
    ["implementation", "Implementation"],
    ["outcomes", "Outcome/s"],
    ["best-practices", "Best Practices"],
    ["other", "Other evidence"]
  ];
  let selection = null;
  let entries = [];
  let activeEntry = null;
  let activeGroup = "";
  let activeFolderPath = [];
  let activeFolderContents = null;
  let activeFile = null;
  let rootLoading = false;
  let rootError = "";
  let folderLoading = false;
  let folderError = "";
  let requestId = 0;

  Object.entries(window.OMSC_AREA_ONE_CRITERIA || {}).forEach(([parameterKey, parameter]) => {
    parameter.levels.forEach((level) => {
      level.criteria.forEach(([id, text]) => criteriaById.set(`${parameterKey}:${id}`, text));
    });
  });

  function getApiKey() {
    return window.OMSC_DRIVE_API_KEY || "";
  }

  function getCriterionId(name) {
    const match = name.match(/(?:^|[^A-Z])([SIO])\s*[._-]\s*(\d+)(?=$|[^0-9])/i);
    return match ? `${match[1].toUpperCase()}.${match[2]}` : "";
  }

  function getGroup(name, criterionId) {
    if (/best[\s_-]*practices?/i.test(name) || criterionId === "BP") return "best-practices";
    if (criterionId.startsWith("S.")) return "system";
    if (criterionId.startsWith("I.")) return "implementation";
    if (criterionId.startsWith("O.")) return "outcomes";
    if (/\bsystem\b|\binputs?\s*(?:-|and)\s*processes?\b/i.test(name)) return "system";
    if (/\bimplementation\b/i.test(name)) return "implementation";
    if (/\b(outcomes?|outputs?)\b/i.test(name)) return "outcomes";
    return "other";
  }

  function isLevelContainer(entry) {
    return entry.isFolder && !entry.criterionId && entry.group !== "other" && entry.group !== "best-practices";
  }

  function getCriterionText(criterionId) {
    return selection?.area === "I" ? criteriaById.get(`${selection.parameterKey}:${criterionId}`) || "" : "";
  }

  function setStatus(message, isError = false, retry = null) {
    navigationStatus.replaceChildren();
    navigationStatus.textContent = message;
    navigationStatus.classList.toggle("is-error", isError);
    if (retry) {
      const button = document.createElement("button");
      button.className = "criterion-retry";
      button.type = "button";
      button.textContent = "Try again";
      button.addEventListener("click", retry);
      navigationStatus.append(" ", button);
    }
  }

  async function fetchDriveFolder(folderId) {
    const files = [];
    let pageToken = "";
    do {
      const parameters = new URLSearchParams({
        q: `'${folderId.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}' in parents and trashed = false`,
        fields: "nextPageToken,files(id,name,mimeType,modifiedTime,size)",
        orderBy: "folder,name",
        pageSize: "1000",
        supportsAllDrives: "true",
        includeItemsFromAllDrives: "true",
        key: getApiKey()
      });
      if (pageToken) parameters.set("pageToken", pageToken);
      const response = await fetch(`https://www.googleapis.com/drive/v3/files?${parameters}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.error?.message || `Google Drive API returned HTTP ${response.status}.`);
      }
      if (!Array.isArray(result.files)) {
        throw new Error("Google Drive returned an unexpected folder response.");
      }
      files.push(...result.files);
      pageToken = result.nextPageToken || "";
    } while (pageToken);
    return files;
  }

  function makeEntries(files) {
    return files.map((file) => {
      const isFolder = file.mimeType === "application/vnd.google-apps.folder";
      const criterionId = getCriterionId(file.name);
      return {
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        size: file.size || "",
        modifiedTime: file.modifiedTime || "",
        isFolder,
        criterionId,
        group: getGroup(file.name, criterionId)
      };
    }).sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
  }

  async function loadParameterEntries(folderId) {
    const rootEntries = makeEntries(await fetchDriveFolder(folderId));
    const containers = rootEntries.filter(isLevelContainer);
    if (!containers.length) return rootEntries;

    const nestedEntries = await Promise.all(containers.map(async (container) => {
      try {
        const children = makeEntries(await fetchDriveFolder(container.id));
        if (!children.length) return [container];
        return children.map((child) => ({
          ...child,
          group: child.group === "other" ? container.group : child.group,
          parent: { id: container.id, name: container.name }
        }));
      } catch (error) {
        throw new Error(`Could not read ${container.name}: ${error.message}`);
      }
    }));
    return rootEntries.filter((entry) => !isLevelContainer(entry)).concat(...nestedEntries)
      .sort((left, right) => left.name.localeCompare(right.name, undefined, { numeric: true }));
  }

  function renderNavigation() {
    navigation.replaceChildren();
    if (rootLoading) {
      setStatus("Loading criteria folders from Google Drive…");
      return;
    }
    if (rootError) {
      setStatus(rootError, true, loadParameter);
      return;
    }
    if (!entries.length) {
      setStatus("No criteria folders or files were returned for this parameter.");
      return;
    }

    const orderedGroups = groups.filter(([key]) => entries.some((entry) => entry.group === key));
    orderedGroups.forEach(([key, label]) => {
      const groupEntries = entries.filter((entry) => entry.group === key);
      const section = document.createElement("details");
      section.className = "criteria-group";
      section.open = key === activeGroup;

      const summary = document.createElement("summary");
      summary.className = "criteria-group-summary";
      const heading = document.createElement("span");
      heading.textContent = label;
      const count = document.createElement("span");
      count.className = "criteria-group-count";
      count.textContent = String(groupEntries.length);
      summary.append(heading, count);
      section.append(summary);

      const list = document.createElement("div");
      list.className = "criteria-group-items";
      groupEntries.forEach((entry) => {
        const button = document.createElement("button");
        button.className = `criterion-option${activeEntry?.id === entry.id ? " is-selected" : ""}`;
        button.type = "button";
        button.setAttribute("aria-pressed", String(activeEntry?.id === entry.id));
        const id = document.createElement("span");
        id.className = "option-id";
        id.textContent = entry.criterionId || (entry.isFolder ? "Folder" : "File");
        const text = document.createElement("span");
        text.className = "option-text";
        text.textContent = getCriterionText(entry.criterionId) || entry.name;
        button.append(id, text);
        button.addEventListener("click", () => selectEntry(entry, true));
        list.append(button);
      });
      section.append(list);
      navigation.append(section);
    });
    setStatus(`${entries.length} item${entries.length === 1 ? "" : "s"} in this parameter. Expand a level to browse.`);
  }

  function setCriterionHeading(entry) {
    const criterionId = entry.criterionId;
    const text = getCriterionText(criterionId);
    const note = selection.area === "I" && selection.parameterKey === "B"
      ? window.OMSC_AREA_ONE_CRITERIA?.B?.note
      : "";
    document.querySelector("#area-content-title").textContent = text
      ? `${criterionId} · ${text}`
      : entry.name;
    document.querySelector("#area-content-description").textContent = text
      ? `Supporting evidence for ${criterionId}.${criterionId === "O.2" && note ? ` ${note}` : ""}`
      : "Browse the source materials in this criterion folder.";
    document.querySelector("#area-source-title").textContent = entry.name;
    document.querySelector("#area-source-help").textContent = `Read-only Google Drive materials for Area ${selection.area}, Parameter ${selection.parameterKey}.`;
  }

  function selectEntry(entry, updateAddress) {
    activeEntry = entry;
    activeGroup = entry.group;
    activeFolderPath = entry.parent ? [entry.parent, { id: entry.id, name: entry.name }] : [];
    activeFolderContents = null;
    activeFile = null;
    folderError = "";
    renderNavigation();
    if (updateAddress) {
      const url = new URL(window.location.href);
      url.searchParams.set("criterion", entry.id);
      window.history.pushState({}, "", url);
    }
    setCriterionHeading(entry);
    if (entry.isFolder) {
      if (!entry.parent) activeFolderPath = [{ id: entry.id, name: entry.name }];
      loadFolder(entry.id);
    } else {
      activeFolderContents = [entry];
      activeFile = entry;
      renderBrowser();
    }
  }

  async function loadParameter() {
    if (!selection) return;
    const currentRequest = ++requestId;
    entries = [];
    activeEntry = null;
    activeGroup = "";
    activeFolderPath = [];
    activeFolderContents = null;
    activeFile = null;
    folderError = "";
    rootError = "";
    rootLoading = true;
    document.querySelector("#area-content-title").textContent = "Select a criterion";
    document.querySelector("#area-content-description").textContent = "Expand a level in the sidebar to open its supporting materials.";
    document.querySelector("#area-source-title").textContent = `${selection.parameterName} · Supporting documents`;
    document.querySelector("#area-source-help").textContent = "Select a criterion to browse its read-only Drive folder and files.";
    renderNavigation();
    renderBrowser();
    try {
      if (!getApiKey()) throw new Error("Drive API key is not configured for this site.");
      const parameterEntries = await loadParameterEntries(selection.parameterFolderId);
      if (currentRequest !== requestId) return;
      entries = parameterEntries;
      rootLoading = false;
      renderNavigation();
      renderBrowser();

      const requestedCriterion = new URLSearchParams(window.location.search).get("criterion");
      const requestedEntry = entries.find((entry) => entry.id === requestedCriterion || entry.criterionId === requestedCriterion);
      if (selection.viewMode !== "areas" && requestedEntry) selectEntry(requestedEntry, false);
    } catch (error) {
      if (currentRequest !== requestId) return;
      rootLoading = false;
      rootError = error.message;
      renderNavigation();
      renderBrowser();
    }
  }

  async function loadFolder(folderId) {
    const currentRequest = ++requestId;
    folderLoading = true;
    folderError = "";
    activeFolderContents = null;
    activeFile = null;
    renderBrowser();
    try {
      const files = await fetchDriveFolder(folderId);
      if (currentRequest !== requestId) return;
      activeFolderContents = makeEntries(files);
      folderLoading = false;
      renderBrowser();
    } catch (error) {
      if (currentRequest !== requestId) return;
      folderLoading = false;
      folderError = error.message;
      renderBrowser();
    }
  }

  function getFileUrl(file) {
    return `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/view`;
  }

  function getPreviewUrl(file) {
    const documentTypes = {
      "application/vnd.google-apps.document": "document",
      "application/vnd.google-apps.spreadsheet": "spreadsheets",
      "application/vnd.google-apps.presentation": "presentation"
    };
    if (documentTypes[file.mimeType]) {
      return `https://docs.google.com/${documentTypes[file.mimeType]}/d/${encodeURIComponent(file.id)}/preview`;
    }
    return `https://drive.google.com/file/d/${encodeURIComponent(file.id)}/preview`;
  }

  function renderBrowserState(title, message, isError = false, retry = null, replace = true) {
    const state = document.createElement("div");
    state.className = `folder-state${isError ? " folder-state-error" : ""}`;
    state.setAttribute("role", isError ? "alert" : "status");
    const copy = document.createElement("div");
    const heading = document.createElement("strong");
    heading.textContent = title;
    const messageCopy = document.createElement("p");
    messageCopy.textContent = message;
    copy.append(heading, messageCopy);
    state.append(copy);
    if (retry) {
      const button = document.createElement("button");
      button.className = "folder-retry";
      button.type = "button";
      button.textContent = "Try again";
      button.addEventListener("click", retry);
      state.append(button);
    }
    if (replace) browser.replaceChildren(state);
    else browser.append(state);
  }

  function renderBreadcrumbs() {
    const nav = document.createElement("nav");
    nav.className = "drive-crumbs";
    nav.setAttribute("aria-label", "Folder location");
    activeFolderPath.forEach((folder, index) => {
      if (index) {
        const separator = document.createElement("span");
        separator.setAttribute("aria-hidden", "true");
        separator.textContent = "›";
        nav.append(separator);
      }
      if (index < activeFolderPath.length - 1) {
        const button = document.createElement("button");
        button.className = "drive-crumb";
        button.type = "button";
        button.textContent = folder.name;
        button.addEventListener("click", () => {
          activeFolderPath = activeFolderPath.slice(0, index + 1);
          loadFolder(folder.id);
        });
        nav.append(button);
      } else {
        const current = document.createElement("span");
        current.className = "drive-crumb is-current";
        current.setAttribute("aria-current", "page");
        current.textContent = folder.name;
        nav.append(current);
      }
    });
    browser.append(nav);
  }

  function renderPreview(file) {
    const section = document.createElement("section");
    section.className = "api-pdf-preview";
    section.setAttribute("aria-label", "Selected file preview");
    const heading = document.createElement("div");
    heading.className = "api-preview-heading";
    const title = document.createElement("div");
    const label = document.createElement("p");
    label.className = "eyebrow";
    label.textContent = file.mimeType === "application/pdf" ? "PDF preview" : "File preview";
    const name = document.createElement("h3");
    name.textContent = file.name;
    title.append(label, name);
    const open = document.createElement("a");
    open.className = "button button-primary";
    open.href = getFileUrl(file);
    open.target = "_blank";
    open.rel = "noopener noreferrer";
    open.textContent = "Open in Google Drive ↗";
    heading.append(title, open);
    const frame = document.createElement("div");
    frame.className = "preview-frame api-preview-frame";
    const iframe = document.createElement("iframe");
    iframe.title = `Preview of ${file.name}`;
    iframe.src = getPreviewUrl(file);
    iframe.loading = "lazy";
    iframe.setAttribute("allow", "autoplay");
    frame.append(iframe);
    const note = document.createElement("p");
    note.className = "preview-note";
    note.textContent = "If this preview is unavailable, open the file in Google Drive. Visibility depends on the file's sharing settings.";
    section.append(heading, frame, note);
    browser.append(section);
  }

  function renderBrowser() {
    browser.replaceChildren();
    if (window.location.protocol === "file:") {
      renderBrowserState("Open through a web server", "Google Drive API requests require an HTTP or HTTPS page. Use the project's local web server and allowed API-key referrer.");
      return;
    }
    if (rootLoading) {
      renderBrowserState("Loading parameter folders", "Reading the selected Drive folder in read-only mode.");
      return;
    }
    if (rootError) {
      renderBrowserState("Could not load parameter folders", rootError, true, loadParameter);
      return;
    }
    if (!activeEntry) {
      renderBrowserState(
        entries.length ? "Select an assessment level" : "No criteria found",
        entries.length
          ? "Expand System, Implementation, Outcome/s, or Best Practices in the sidebar, then choose a criterion."
          : "Google Drive returned no folders or files for this parameter."
      );
      return;
    }
    if (folderLoading) {
      renderBrowserState("Loading folder contents", "Reading nested folders and files from Google Drive in read-only mode.");
      return;
    }
    if (folderError) {
      renderBrowserState("Could not read this Drive folder", folderError, true, () => loadFolder(activeFolderPath.at(-1).id));
      return;
    }
    if (!activeFolderContents) {
      renderBrowserState("Preparing evidence viewer", "Connecting to Google Drive in read-only mode.");
      return;
    }

    if (activeFolderPath.length) renderBreadcrumbs();
    const folders = activeFolderContents.filter((item) => item.isFolder);
    const files = activeFolderContents.filter((item) => !item.isFolder);
    const heading = document.createElement("div");
    heading.className = "drive-list-heading";
    const title = document.createElement("div");
    const eyebrow = document.createElement("p");
    eyebrow.className = "eyebrow";
    eyebrow.textContent = "Folder contents";
    const name = document.createElement("h3");
    name.textContent = activeFolderPath.at(-1)?.name || activeEntry.name;
    title.append(eyebrow, name);
    const count = document.createElement("span");
    count.className = "file-count";
    count.textContent = `${folders.length} folder${folders.length === 1 ? "" : "s"} · ${files.length} file${files.length === 1 ? "" : "s"}`;
    heading.append(title, count);
    browser.append(heading);

    if (!folders.length && !files.length) {
      renderBrowserState("No items in this folder", "Google Drive returned no visible files or subfolders. This can also occur when the account does not have Viewer access.", false, null, false);
      return;
    }

    const list = document.createElement("div");
    list.className = "drive-items";
    list.setAttribute("role", "list");
    [...folders, ...files].forEach((item) => {
      const button = document.createElement("button");
      button.className = `drive-item${item.isFolder ? " drive-folder-item" : " drive-file-item"}${activeFile?.id === item.id ? " is-selected" : ""}`;
      button.type = "button";
      button.setAttribute("role", "listitem");
      if (item.isFolder) {
        button.addEventListener("click", () => {
          activeFolderPath.push({ id: item.id, name: item.name });
          loadFolder(item.id);
        });
      } else {
        button.setAttribute("aria-pressed", String(activeFile?.id === item.id));
        button.addEventListener("click", () => {
          activeFile = item;
          renderBrowser();
        });
      }
      const icon = document.createElement("span");
      icon.className = `drive-item-icon ${item.isFolder ? "folder-icon" : item.mimeType === "application/pdf" ? "pdf-icon" : "other-file-icon"}`;
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = item.isFolder ? "▰" : item.mimeType === "application/pdf" ? "PDF" : "FILE";
      const itemName = document.createElement("span");
      itemName.className = "drive-item-name";
      itemName.textContent = item.name;
      const meta = document.createElement("span");
      meta.className = "drive-item-meta";
      meta.textContent = item.isFolder
        ? "Folder"
        : item.modifiedTime
          ? new Date(item.modifiedTime).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" })
          : "";
      const action = document.createElement("span");
      action.className = "drive-item-action";
      action.textContent = item.isFolder ? "Browse ›" : item.mimeType === "application/pdf" ? "Preview ›" : "View ›";
      button.append(icon, itemName, meta, action);
      list.append(button);
    });
    browser.append(list);
    if (activeFile) renderPreview(activeFile);
    const note = document.createElement("p");
    note.className = "read-only-note";
    note.textContent = "Read-only access. This page lists folder contents and displays previews; it does not modify Drive files.";
    browser.append(note);
  }

  function syncSelection(nextSelection) {
    const changed = !selection
      || selection.area !== nextSelection.area
      || selection.parameterKey !== nextSelection.parameterKey
      || selection.parameterFolderId !== nextSelection.parameterFolderId;
    selection = nextSelection;
    if (changed) loadParameter();
  }

  window.addEventListener("area-selection-change", (event) => {
    syncSelection(event.detail);
    if (event.detail.viewMode === "areas" && activeEntry) {
      requestId += 1;
      activeEntry = null;
      activeGroup = "";
      activeFolderPath = [];
      activeFolderContents = null;
      activeFile = null;
      folderLoading = false;
      folderError = "";
      const area = areas[event.detail.area];
      document.querySelector("#area-content-title").textContent = `Area ${event.detail.area} · ${area.title}`;
      document.querySelector("#area-content-description").textContent = `${area.summary}. Choose a parameter from the area list to review its source documents.`;
      document.querySelector("#area-source-title").textContent = `${event.detail.parameterName} · Supporting documents`;
      document.querySelector("#area-source-help").textContent = "Select a criterion to browse its read-only Drive folder and files.";
      renderNavigation();
      renderBrowser();
    }
  });
  window.addEventListener("popstate", () => {
    const url = new URL(window.location.href);
    const areaKey = url.searchParams.get("area") || "I";
    const parameterKey = url.searchParams.get("parameter") || "A";
    const area = areas[areaKey];
    const parameter = area?.parameters.find(([key]) => key === parameterKey);
    if (parameter) {
      const nextSelection = {
        area: areaKey,
        parameterKey,
        parameterName: parameter[1],
        parameterFolderId: parameter[2]
      };
      const changed = !selection
        || selection.area !== nextSelection.area
        || selection.parameterKey !== nextSelection.parameterKey;
      syncSelection({
        ...nextSelection
      });
      if (!changed) {
        const requestedCriterion = url.searchParams.get("criterion");
        const entry = entries.find((item) => item.id === requestedCriterion || item.criterionId === requestedCriterion);
        if (entry && entry.id !== activeEntry?.id) {
          selectEntry(entry, false);
        } else if (!requestedCriterion && activeEntry) {
          activeEntry = null;
          activeGroup = "";
          activeFolderPath = [];
          activeFolderContents = null;
          activeFile = null;
          document.querySelector("#area-content-title").textContent = "Select a criterion";
          document.querySelector("#area-content-description").textContent = "Expand a level in the sidebar to open its supporting materials.";
          document.querySelector("#area-source-title").textContent = `${selection.parameterName} · Supporting documents`;
          renderNavigation();
          renderBrowser();
        }
      }
    }
  });

  if (window.OMSC_AREA_SELECTION) syncSelection(window.OMSC_AREA_SELECTION);
})();
