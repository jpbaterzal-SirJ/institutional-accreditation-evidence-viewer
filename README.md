# Institutional Accreditation Evidence Viewer

Responsive accreditation pages for Occidental Mindoro State University (OMSC) Institutional Quality Assurance.

## Pages

- `index.html` — AACCUP accreditor welcome page and introduction to OMSU institutional quality assurance.
- `evidence.html` — criterion-based Google Drive folder and PDF viewer.
- `area.html` — dedicated accreditor pages for Areas I–IX; each page displays the area title and its named parameters from the supplied area references. Select an area in the sidebar to expand its parameter dropdown and open that parameter's read-only source folder. Area I displays the System – Inputs and Processes, Implementation, Outcome/s, and Best Practices sections for Parameters A–J.
- `drive-structure.html` — read-only browser for the Institutional Accreditation 2026 Drive root and its nine area folders.

The folder structure page embeds the shared Drive root, summarizes the scanned structure of Areas I–IX, and lets visitors browse an area's current folder contents without granting the website write access or requiring the Google Drive API key. Area labels/counts are a scan snapshot; the embedded Drive contents are the source of truth. File visibility remains controlled by Google Drive sharing permissions.

The home page welcomes AACCUP accreditors and introduces the university's quality assurance workspace. The header's Areas menu opens dedicated area pages. Each area page offers an expandable parameter list in the sidebar and opens the selected parameter's shared Drive folder. Area I also displays the supplied assessment levels and criteria for Parameters A–J; a note identifies the O.2 text for Parameter B as incomplete in its supplied image. Area and parameter names follow the supplied references; parameter folder IDs remain linked to the read-only Drive scan. The embedded Drive listing remains the source of truth for folder contents. The evidence viewer supports search and section filters, including Best Practices.

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
