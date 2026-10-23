# Institutional Accreditation Evidence Viewer

Responsive accreditation pages for Occidental Mindoro State University (OMSC) Institutional Quality Assurance.

## Pages

- `index.html` — Area I, Parameter A: Governance and Organizational Structure.
- `evidence.html` — criterion-based Google Drive folder and PDF viewer.

## Google Drive evidence links

`evidence.js` uses the read-only Google Drive API to list folders and files inside each configured folder. Accreditors can open subfolders and preview PDFs in the page. Add the restricted API key to `drive-config.js` before publishing.

The static website sends this API key from the visitor's browser, so it is visible to site visitors. Restrict it in Google Cloud Console to this website's HTTP referrer and to the Google Drive API only. Never use an unrestricted key or a service-account/private credential in the website.

Make the evidence folder and its contents available as **Anyone with the link — Viewer** if accreditors should browse without Google sign-in. This permits anyone with the link to view those files. The API key does not grant access to private Drive content.

Configure criterion root folders in `evidence-links.js`:

```js
window.OMSC_EVIDENCE_LINKS = {
  "S.1": "https://drive.google.com/drive/folders/FOLDER_ID"
};
```

Make sure the intended accreditors have Viewer access to the Drive folders and PDF files. A file being listed here does not change its Google Drive permissions.

## GitHub Pages

This is a static site and does not require a build step. In the repository settings, open **Pages**, choose **Deploy from a branch**, select `main` and `/(root)`, and save. The site will be available at:

`https://jpbaterzal-SirJ.github.io/institutional-accreditation-evidence-viewer/`
