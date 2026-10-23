const areaFolders = {
  I: "1Q4fTNMI3tu2JvJQJ3cfw10tQVRXT-2aZ",
  II: "12v9kUO6_o6Sw8FDgFTnAabFps00hze7S",
  III: "1AumTkd78k-vdbN7gZyq74aaav9Fd8uhY",
  IV: "1AWtXU3Yf9bLji9AiKwHzhMSGZWK4Gbiz",
  V: "12Vqv0kADr6TAN6V8NvA4_JJ2Ee0kFX4v",
  VI: "1VMmqFclTbpo5Hwkrw1bx7LcyWzz5LjvV",
  VII: "1mF7fArgGaHneiiuVax6pZZCAuwfmYSRc",
  VIII: "12U_C0hyD_FPHMsmwEzfpQFPpo_ytsd7e",
  IX: "1sgkLIleV4sRnqLi2c45wlFWHYmc6BP0R"
};

const folderFrame = document.querySelector(".drive-structure-frame iframe");
const areaButtons = Array.from(document.querySelectorAll(".drive-area-button, .area-card"));
const areaStatus = document.querySelector("#drive-area-status");
const areaSummaries = {
  I: "10 parameter folders",
  II: "5 parameter folders",
  III: "4 parameter folders and 2 files",
  IV: "Research, Strategy and Capacity plus the 2026 checklist",
  V: "Extension and Outreach; Networking and Linkages",
  VI: "4 student-support parameter folders",
  VII: "7 parameter folders",
  VIII: "4 parameter folders",
  IX: "4 parameter folders"
};

function selectArea(area) {
  const isArea = Object.prototype.hasOwnProperty.call(areaFolders, area);
  const folderId = isArea ? areaFolders[area] : folderFrame.dataset.rootFolder;
  const label = isArea ? `Area ${area}` : "All Areas";
  folderFrame.src = `https://drive.google.com/embeddedfolderview?id=${encodeURIComponent(folderId)}#list`;
  folderFrame.title = `${label} folder structure for Institutional Accreditation 2026`;
  areaStatus.textContent = isArea
    ? `${label} selected. ${areaSummaries[area]}. Browse the current Google Drive folder list below.`
    : "Showing all nine accreditation areas in the shared Google Drive root.";
  areaButtons.forEach((button) => {
    const isSelected = button.dataset.area === area;
    button.classList.toggle("is-active", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });
  const url = new URL(window.location.href);
  if (isArea) url.searchParams.set("area", area);
  else url.searchParams.delete("area");
  window.history.replaceState({}, "", url);
}

areaButtons.forEach((button) => {
  button.addEventListener("click", () => selectArea(button.dataset.area));
});

const initialArea = new URLSearchParams(window.location.search).get("area");
if (initialArea && Object.prototype.hasOwnProperty.call(areaFolders, initialArea)) selectArea(initialArea);
