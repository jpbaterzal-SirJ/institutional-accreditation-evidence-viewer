const accreditationAreas = {
  I: {
    folderId: "1Q4fTNMI3tu2JvJQJ3cfw10tQVRXT-2aZ",
    title: "Governance and organizational structure",
    summary: "10 parameter folders · A–J",
    parameters: 10
  },
  II: {
    folderId: "12v9kUO6_o6Sw8FDgFTnAabFps00hze7S",
    title: "Accreditation evidence collection",
    summary: "5 parameter folders · A–E",
    parameters: 5
  },
  III: {
    folderId: "1AumTkd78k-vdbN7gZyq74aaav9Fd8uhY",
    title: "Accreditation evidence collection",
    summary: "4 parameter folders · A–D, with 2 additional files",
    parameters: 4
  },
  IV: {
    folderId: "1AWtXU3Yf9bLji9AiKwHzhMSGZWK4Gbiz",
    title: "Research, strategy and capacity",
    summary: "Research, strategy and capacity · includes the 2026 checklist",
    parameters: null
  },
  V: {
    folderId: "12Vqv0kADr6TAN6V8NvA4_JJ2Ee0kFX4v",
    title: "Extension and networking",
    summary: "Extension and outreach · networking and linkages",
    parameters: null
  },
  VI: {
    folderId: "1VMmqFclTbpo5Hwkrw1bx7LcyWzz5LjvV",
    title: "Student support services",
    summary: "4 parameter folders · recruitment, scholarship, student services and placement",
    parameters: 4
  },
  VII: {
    folderId: "1mF7fArgGaHneiiuVax6pZZCAuwfmYSRc",
    title: "Accreditation evidence collection",
    summary: "7 parameter folders · A–G",
    parameters: 7
  },
  VIII: {
    folderId: "12U_C0hyD_FPHMsmwEzfpQFPpo_ytsd7e",
    title: "Accreditation evidence collection",
    summary: "4 parameter folders · A–D",
    parameters: 4
  },
  IX: {
    folderId: "1sgkLIleV4sRnqLi2c45wlFWHYmc6BP0R",
    title: "Accreditation evidence collection",
    summary: "4 parameter folders · A–D",
    parameters: 4
  }
};

const requestedArea = new URLSearchParams(window.location.search).get("area")?.toUpperCase();
const selectedArea = Object.prototype.hasOwnProperty.call(accreditationAreas, requestedArea) ? requestedArea : "I";
const area = accreditationAreas[selectedArea];
const folderUrl = `https://drive.google.com/drive/folders/${encodeURIComponent(area.folderId)}`;

document.title = `Area ${selectedArea} | OMSC Institutional Accreditation`;
document.querySelector("#area-title").textContent = `Area ${selectedArea}`;
document.querySelector("#area-breadcrumb").textContent = `Area ${selectedArea}`;
document.querySelector("#area-sidebar-label").textContent = selectedArea;
document.querySelector("#document-area-crumb").textContent = `Area ${selectedArea}`;
document.querySelector("#area-content-title").textContent = `Area ${selectedArea} · ${area.title}`;
document.querySelector("#area-content-description").textContent = `${area.summary}. Browse the source folder and its current contents below.`;
document.querySelector("#area-description").textContent = `${area.title}. Explore its verified parameter structure and supporting materials in the shared, read-only Google Drive folder.`;
document.querySelector("#area-source-title").textContent = `Area ${selectedArea} evidence folder`;
document.querySelector("#area-source-help").textContent = area.parameters
  ? `The scanned folder contains ${area.parameters} parameter folders. Select the parameter you need in the Drive listing below.`
  : "Browse the parameter folders and supporting materials in the shared Drive listing below.";
document.querySelector("#area-parameter-count").textContent = area.parameters ?? "—";
document.querySelector("#area-parameter-label").textContent = area.parameters
  ? `${area.parameters === 1 ? "Parameter folder" : "Parameter folders"} · ${area.summary.split("·")[1]?.trim() || "see Drive listing"}`
  : "Browse the current folder structure below";

const folderFrame = document.querySelector("#area-folder-frame");
folderFrame.src = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(area.folderId)}#list`;
folderFrame.title = `Area ${selectedArea} source folder in read-only Google Drive`;
document.querySelector("#area-drive-link").href = folderUrl;
document.querySelector("#area-source-open").href = folderUrl;

document.querySelectorAll("[data-area-link]").forEach((link) => {
  if (link.dataset.areaLink === selectedArea) {
    link.setAttribute("aria-current", "page");
    link.classList.add("is-current-area");
  } else {
    link.removeAttribute("aria-current");
    link.classList.remove("is-current-area");
  }
});

if (requestedArea !== selectedArea) {
  const url = new URL(window.location.href);
  url.searchParams.set("area", selectedArea);
  window.history.replaceState({}, "", url);
}
