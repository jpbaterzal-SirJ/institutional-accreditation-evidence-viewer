# Institutional Accreditation Evidence Viewer

Responsive accreditation pages for Occidental Mindoro State University (OMSC) Institutional Quality Assurance.

## Pages

- `index.html` — Area I, Parameter A: Governance and Organizational Structure.
- `evidence.html` — criterion-based Google Drive folder and PDF viewer.

## Google Drive evidence links

Configure links in `evidence-links.js`. Folder URLs can be embedded in the evidence viewer. To show a curated PDF list with previews, add each PDF's shared Google Drive file URL under the folder's `files` array. For example:

```js
window.OMSC_EVIDENCE_LINKS = {
  "S.1": [{
    label: "a. Approved Organizational Structure/Organizational Chart",
    url: "https://drive.google.com/drive/folders/FOLDER_ID",
    path: [{ label: "1. Par.A_S.1" }],
    files: [
      { name: "Organizational Structure 2024.pdf", url: "https://drive.google.com/file/d/FILE_ID/view", size: "1.2 MB", modified: "Jun 18" }
    ]
  }]
};
```

Make sure the intended accreditors have Viewer access to the Drive folders and PDF files. A file being listed here does not change its Google Drive permissions.

## GitHub Pages

This is a static site and does not require a build step. In the repository settings, open **Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, and save. The site will be available at:

`https://jpbaterzal-SirJ.github.io/institutional-accreditation-evidence-viewer/`
