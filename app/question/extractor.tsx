
// /**
//  * pdf-extractor-react.js
//  *
//  * React component (JavaScript) for extracting text from a PDF in the browser
//  * using pdfjs-dist and sending the extracted rawText to a backend endpoint.
//  *
//  * Usage:
//  * 1. Copy `pdf.worker.mjs` from node_modules/pdfjs-dist/build/ to your public/ folder:
//  *      node_modules/pdfjs-dist/build/pdf.worker.mjs  ->  public/pdf.worker.mjs
//  *
//  * 2. Install pdfjs-dist:
//  *      npm install pdfjs-dist
//  *
//  * 3. Import and use this component:
//  *      import PdfExtractor from './pdf-extractor-react';
//  *
//  *      <PdfExtractor setId={123} uploadUrl="/api/questions/bulk-upload" />
//  *
//  * Behavior:
//  * - Loads the selected PDF in the browser using pdfjs-dist.
//  * - Extracts text from every page.
//  * - Sends POST to `${uploadUrl}/${setId}` with JSON { rawText: <extracted text> }.
//  *
//  * Note:
//  * - This component uses the public-hosted worker at /pdf.worker.mjs.
//  * - If you prefer bundling the worker, adjust pdfjsLib.GlobalWorkerOptions.workerSrc accordingly.
//  */

// import React, { useState } from "react";
// import * as pdfjsLib from "pdfjs-dist";

// /* IMPORTANT:
//  * Ensure you copied pdf.worker.mjs into your public directory and expose it at /pdf.worker.mjs
//  * e.g., public/pdf.worker.mjs
//  */
// if (typeof window !== "undefined") {
//   // Use the worker from your public folder
//   pdfjsLib.GlobalWorkerOptions.workerSrc = 
//     `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
// }

// function extractPdfTextFromFile(file : File, onProgress : any) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const arrayBuffer = await file.arrayBuffer();
//       const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

//       let fullText = "";
//       for (let i = 1; i <= pdf.numPages; i++) {
//         const page = await pdf.getPage(i);
//         const content = await page.getTextContent();
//         const strings = content.items.map((item) => {
//           // item.str contains the text; some items may include small fragments
//           return item.str;
//         });
//         const pageText = strings.join(" ");
//         fullText += pageText + "\n\n";

//         if (typeof onProgress === "function") {
//           onProgress({
//             current: i,
//             total: pdf.numPages,
//             percent: Math.round((i / pdf.numPages) * 100),
//           });
//         }
//       }

//       resolve(fullText);
//     } catch (err) {
//       reject(err);
//     }
//   });
// }

// export default function PdfExtractor({ setId, uploadUrl = "/api/questions/bulk-upload" }) {
//   const [file, setFile] = useState(null);
//   const [status, setStatus] = useState("");
//   const [progress, setProgress] = useState(null);
//   const [extractedTextPreview, setExtractedTextPreview] = useState("");

//   const onFileChange = (e) => {
//     setFile(e.target.files[0]);
//     setStatus("");
//     setProgress(null);
//     setExtractedTextPreview("");
//   };

//   const onExtractAndUpload = async () => {
//     if (!file) {
//       setStatus("Please select a PDF file first.");
//       return;
//     }

//     setStatus("Extracting text from PDF...");
//     setProgress({ current: 0, total: 0, percent: 0 });

//     try {
//       const text = await extractPdfTextFromFile(file, (p) => setProgress(p));
//       setExtractedTextPreview(text.slice(0, 800)); // show a preview

//       setStatus("Sending extracted text to server...");
//       const targetUrl = `${uploadUrl}/${setId}`;

//       const response = await fetch(targetUrl, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ rawText: text }),
//       });

//       if (!response.ok) {
//         const txt = await response.text();
//         throw new Error(`Server responded ${response.status}: ${txt}`);
//       }

//       setStatus("Upload and processing request completed successfully.");
//     } catch (err) {
//       console.error(err);
//       setStatus("Error: " + (err.message || err.toString()));
//     } finally {
//       setProgress(null);
//     }
//   };

//   return (
//     <div style={{
//       border: "1px solid #ddd",
//       padding: "1rem",
//       borderRadius: 8,
//       maxWidth: 720
//     }}>
//       <h3>PDF Extractor (Frontend) — send rawText to backend</h3>
//       <p style={{ marginTop: 0 }}>
//         Select a PDF file. The component will extract text and POST it to <code>{uploadUrl}/{"{setId}"}</code>.
//       </p>

//       <input type="file" accept="application/pdf" onChange={onFileChange} />
//       <div style={{ marginTop: "0.5rem" }}>
//         <button onClick={onExtractAndUpload} disabled={!file} style={{ padding: "0.5rem 1rem" }}>
//           Extract & Upload
//         </button>
//       </div>

//       {progress && (
//         <div style={{ marginTop: "0.75rem" }}>
//           <strong>Progress:</strong> {progress.current}/{progress.total} pages — {progress.percent}%
//         </div>
//       )}

//       {status && (
//         <div style={{ marginTop: "0.75rem" }}>
//           <strong>Status:</strong> {status}
//         </div>
//       )}

//       {extractedTextPreview && (
//         <div style={{ marginTop: "0.75rem" }}>
//           <strong>Preview (first 800 chars):</strong>
//           <pre style={{ whiteSpace: "pre-wrap", background: "#f9f9f9", padding: 8 }}>{extractedTextPreview}</pre>
//         </div>
//       )}

//       <div style={{ marginTop: "0.75rem", fontSize: 12, color: "#666" }}>
//         Notes:
//         <ul>
//           <li>Copy <code>pdf.worker.mjs</code> from <code>node_modules/pdfjs-dist/build/</code> to <code>public/</code>.</li>
//           <li>If you use a different worker location, update <code>pdfjsLib.GlobalWorkerOptions.workerSrc</code>.</li>
//           <li>Large PDFs may take time to extract — progress is shown per page.</li>
//         </ul>
//       </div>
//     </div>
//   );
// }
