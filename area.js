const accreditationAreas = {
  I: {
    folderId: "1Q4fTNMI3tu2JvJQJ3cfw10tQVRXT-2aZ",
    title: "Governance — Organizational Structure",
    summary: "10 parameter folders · A–J",
    parameters: Array.from("ABCDEFGHIJ", (letter) => `Parameter ${letter}`)
  },
  II: {
    folderId: "12v9kUO6_o6Sw8FDgFTnAabFps00hze7S",
    title: "Institutional accreditation",
    summary: "5 parameter folders · A–E",
    parameters: Array.from("ABCDE", (letter) => `Parameter ${letter}`)
  },
  III: {
    folderId: "1AumTkd78k-vdbN7gZyq74aaav9Fd8uhY",
    title: "Institutional accreditation",
    summary: "4 parameter folders · A–D, with 2 additional files",
    parameters: Array.from("ABCD", (letter) => `Parameter ${letter}`),
    additionalItems: ["OMSU Faculty and Staff Infographic (1).png", "OMSU_Area_III_TEMPLATE (1).docx"]
  },
  IV: {
    folderId: "1AWtXU3Yf9bLji9AiKwHzhMSGZWK4Gbiz",
    title: "Research, Strategy and Capacity",
    summary: "Research, strategy and capacity · includes the 2026 checklist",
    parameters: ["Parameter A: Research, Strategy and Capacity"],
    additionalItems: ["Area IV IA Checklist 2026.pdf"]
  },
  V: {
    folderId: "12Vqv0kADr6TAN6V8NvA4_JJ2Ee0kFX4v",
    title: "Extension and Networking",
    summary: "Extension and outreach · networking and linkages",
    parameters: ["A. Extension and Outreach", "B. Networking and Linkages"]
  },
  VI: {
    folderId: "1VMmqFclTbpo5Hwkrw1bx7LcyWzz5LjvV",
    title: "Student Support Services",
    summary: "4 parameter folders · recruitment, scholarship, student services and placement",
    parameters: [
      "Parameter A: Recruitment, Admission and Academic Support",
      "Parameter B: Student Scholarship",
      "Parameter C: Student Services",
      "Parameter D: Placement Support"
    ]
  },
  VII: {
    folderId: "1mF7fArgGaHneiiuVax6pZZCAuwfmYSRc",
    title: "Institutional accreditation",
    summary: "7 parameter folders · A–G",
    parameters: Array.from("ABCDEFG", (letter) => `Parameter ${letter}`)
  },
  VIII: {
    folderId: "12U_C0hyD_FPHMsmwEzfpQFPpo_ytsd7e",
    title: "Institutional accreditation",
    summary: "4 parameter folders · A–D",
    parameters: Array.from("ABCD", (letter) => `Parameter ${letter}`)
  },
  IX: {
    folderId: "1sgkLIleV4sRnqLi2c45wlFWHYmc6BP0R",
    title: "Institutional accreditation",
    summary: "4 parameter folders · A–D",
    parameters: Array.from("ABCD", (letter) => `Parameter ${letter}`)
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
document.querySelector("#area-source-help").textContent = `Browse the verified parameter folders and supporting materials in the live Drive listing.`;
document.querySelector("#area-parameter-count").textContent = area.parameters.length;
document.querySelector("#area-parameter-label").textContent = `${area.parameters.length} verified parameter ${area.parameters.length === 1 ? "folder" : "folders"}`;
document.querySelector("#area-parameter-summary").textContent = area.summary;

const parameterList = document.querySelector("#area-parameter-list");
area.parameters.forEach((parameter, index) => {
  const item = document.createElement("article");
  item.className = "area-parameter-card";
  const number = document.createElement("span");
  number.className = "area-parameter-number";
  number.textContent = String(index + 1).padStart(2, "0");
  const label = document.createElement("strong");
  label.textContent = parameter;
  item.append(number, label);
  parameterList.append(item);
});

if (area.additionalItems?.length) {
  area.additionalItems.forEach((name) => {
    const item = document.createElement("article");
    item.className = "area-parameter-card area-parameter-file";
    const icon = document.createElement("span");
    icon.className = "area-parameter-number";
    icon.textContent = "FILE";
    const label = document.createElement("strong");
    label.textContent = name;
    item.append(icon, label);
    parameterList.append(item);
  });
}

document.querySelector("#area-one-criteria").hidden = selectedArea !== "I";

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
