# Institutional Accreditation Evidence Viewer

Responsive accreditation pages for Occidental Mindoro State University (OMSC) Institutional Quality Assurance.

## Pages

- `index.html` — Area I, Parameter A: Governance and Organizational Structure.
- `evidence.html` — criterion-based Google Drive folder and PDF viewer.
- `area.html` — accreditor workspace for Areas I–IX; choose an area from the header menu or area directory and browse its read-only source folder.
- `drive-structure.html` — read-only browser for the Institutional Accreditation 2026 Drive root and its nine area folders.

The folder structure page embeds the shared Drive root, summarizes the scanned structure of Areas I–IX, and lets visitors browse an area's current folder contents without granting the website write access or requiring the Google Drive API key. Area labels/counts are a scan snapshot; the embedded Drive contents are the source of truth. File visibility remains controlled by Google Drive sharing permissions.

The home, evidence, area, and Drive structure pages use consistent navigation for browsing accreditation areas. Each area page displays the current shared Drive folder and scanned parameter count when known. Area names and parameter summaries are limited to information verified in the initial folder scan; the embedded Drive listing remains the source of truth. The evidence viewer supports search and section filters, including Best Practices.

## Google Drive evidence links

`evidence.js` uses the read-only Google Drive API to list folders and files inside each configured folder. Accreditors can open subfolders and preview PDFs in the page. Add the restricted API key to `drive-config.js` before publishing.

The static website sends this API key from the visitor's browser, so it is visible to site visitors. Restrict it in Google Cloud Console to this website's HTTP referrer and to the Google Drive API only. Never use an unrestricted key or a service-account/private credential in the website.

For local testing, serve the site over HTTP instead of opening `evidence.html` directly as a file. For example, run `python -m http.server 8000` from the site folder, then open `http://localhost:8000/evidence.html`. Add `http://localhost:8000/*` to the API key's allowed HTTP referrers while testing. The Drive API cannot authorize requests from `file://` pages.

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
