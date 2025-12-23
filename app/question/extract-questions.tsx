import { readFileAsText } from 'app/utils/utils';
import React, { useState, useCallback } from 'react';


// --- 1. Data Structure Interface ---

interface Question {
    sl : number | null;
    questionText: string|null;
    optA: string|undefined;
    optB: string|null|undefined;
    optC: string|null;
    optD: string|null;
    answer: string|null;
}

/**
 * Parses the raw text into structured Q&A data using regex patterns 
 * tailored for the user's document structure.
 */
function parseQuestions(rawText: string): Question[] {
    console.log('Parsing questions from raw text... (Length: %d)', rawText.length);
    
    

    return extractQuestions(rawText);
}


function extractQuestions(text: string) : Question[] {

    const questionBlocks = text.split(/(?=\d+\.\s)/);

    console.log('Extracted %d question blocks.', questionBlocks.length );
  const questionRegex =
    /(\d+)\.\s*(.*?)\n\s*A\s*(.*?)\n\s*B\s*(.*?)\n\s*C\s*(.*?)\n\s*D\s*(.*?)(?=\n\d+\.|\n1b|\n$)/gs;

  const questions : Question[] = [];
  let match : RegExpExecArray | null;

  while ((match = questionRegex.exec(text)) !== null) {

    const qNum = match[1] ? parseInt(match[1], 10) : null;
    const questionText = match[2]?.trim() || '';
    const optA = match[3]?.trim() || '';
    const optB = match[4]?.trim() || '';
    const optC = match[5]?.trim() || '';
    const optD = match[6]?.trim() || '';

    questions.push({
        sl : qNum,
        questionText: questionText,
        optA: optA,
        optB: optB,
        optC: optC,
        optD: optD,
        answer: "" // will be filled later
        
    });
  }

  return questions;
}
// --- 4. CSV Conversion and Download Logic ---

/**
 * Converts the structured Q&A data into a CSV string.
 */
function jsonToCsv(data: Question[]): string {
    const header = ['ID', 'questionText', 'optA',"optB", "optC", "optD",  "answer"];
    const csvRows = [header.join(',')];

    for (const row of data) {
        
        // Escape quotes within the string by doubling them (standard CSV rule)
        const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;
        
        const values = [
            row.sl !== null ? row.sl.toString() : '',
            escapeCsv(row.questionText? row.questionText : ''),
            escapeCsv(row.optA ? row.optA : ''),
            escapeCsv(row.optB ? row.optB : ''),
            escapeCsv(row.optC ? row.optC : ''),
            escapeCsv(row.optD ? row.optD : ''),
            escapeCsv(row.answer? row.answer : '')
        ];
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

/**
 * Triggers a download of the CSV data.
 */
function downloadCsv(csvData: string, filename: string = 'qa_data.csv'): void {
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
}

// --- 5. React Component ---

const PdfQnATransformer: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files ? event.target.files[0] : null;
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
            setError(null);
        } else {
            setFile(null);
            setError('Please select a valid PDF file.');
        }
    };

    const handleTransform = useCallback(async () => {
        if (!file) {
            setError('Please upload a PDF file first.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // 1. Extract Text from PDF
            const rawText = await readFileAsText(file);

            // 2. Parse Text into Structured Data
            const qnaData = parseQuestions(rawText);

            if (qnaData.length === 0) {
                throw new Error('Could not find any questions in the PDF content. Check the structure.');
            }

            // 3. Convert to CSV
            const csvData = jsonToCsv(qnaData);

            // 4. Trigger Download
            const baseName = file.name.replace(/\.pdf$/i, '');
            downloadCsv(csvData, `${baseName}_qa_transformed.csv`);

        } catch (err: any) {
            console.error(err);
            setError(`Transformation failed: ${err.message || 'An unknown error occurred during processing.'}`);
        } finally {
            setIsLoading(false);
        }
    }, [file]);

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
            <h2 style={{ borderBottom: '2px solid #eee', paddingBottom: '10px' }}>PDF Q&A Transformer</h2>
            
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="pdf-upload" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    1. Upload PDF Document
                </label>
                <input
                    id="pdf-upload"
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    style={{ padding: '10px', border: '1px solid #ccc', borderRadius: '4px', width: '100%', boxSizing: 'border-box' }}
                />
                {file && (
                    <p style={{ marginTop: '10px', color: '#007bff' }}>
                        Selected File: <strong>{file.name}</strong>
                    </p>
                )}
            </div>

            {error && (
                <div style={{ color: 'red', marginBottom: '15px', border: '1px solid red', padding: '10px', borderRadius: '4px' }}>
                    ⚠️ {error}
                </div>
            )}

            <button
                onClick={handleTransform}
                disabled={!file || isLoading}
                style={{
                    padding: '12px 20px',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    backgroundColor: isLoading ? '#ccc' : '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    width: '100%'
                }}
            >
                {isLoading ? 'Processing... Please wait.' : '2. Transform & Download CSV'}
            </button>
            
            <p style={{ marginTop: '20px', color: '#666', fontSize: '14px' }}>
                *Note: The transformation relies on complex pattern matching (OCR and Regular Expressions) designed for the Q&A format you provided. Performance depends on PDF size and complexity.
            </p>
        </div>
    );
};

export default PdfQnATransformer;