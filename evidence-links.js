// Add shared Google Drive folder and file URLs for each criterion.
// Folder entries can include a breadcrumb path and multiple PDF file links.
window.OMSC_EVIDENCE_LINKS = {
  "S.1": [{
    label: "1. Par.A_S.1",
    url: "https://drive.google.com/drive/folders/1NXB7WfRlM_JI3HNIwXliNDcI6oKSaFgA",
    path: [{ label: "1. Par.A_S.1" }]
  }]
  // Example with direct PDF links if you want the site to list/preview files individually:
  // "S.1": [{
  //   label: "a. Approved Organizational Structure/Organizational Chart",
  //   url: "https://drive.google.com/drive/folders/FOLDER_ID",
  //   path: [
  //     { label: "1. Par.A_S.1", url: "https://drive.google.com/drive/folders/PARENT_FOLDER_ID" },
  //     { label: "a. Approved Organizational Structure/Organizational Chart" }
  //   ],
  //   files: [
  //     { name: "Par.A_S.1a Organizational Structure 2023.pdf", url: "https://drive.google.com/file/d/FILE_ID_2023/view", size: "388 KB", modified: "Jul 3" },
  //     { name: "Par.A_S.1a Organizational Structure 2024.pdf", url: "https://drive.google.com/file/d/FILE_ID_2024/view", size: "1.2 MB", modified: "Jun 18" }
  //   ]
  // }],
  // "S.2": [{
  //   label: "Approved documents",
  //   url: "https://drive.google.com/drive/folders/FOLDER_ID",
  //   path: [{ label: "1. Par.A_S.2", url: "https://drive.google.com/drive/folders/PARENT_FOLDER_ID" }],
  //   files: [{ name: "Evidence.pdf", url: "https://drive.google.com/file/d/FILE_ID/view" }]
  // }]
};
