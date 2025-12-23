import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useDocumentTitle from 'app/common/use-document-title';
import * as yup from 'yup';
import { handleServerError, setYupDefaults } from 'app/common/utils';
import { useNavigate } from 'react-router';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import InputRow from 'app/common/input-row/input-row';



function getSchema() {
  setYupDefaults();
  
  const questionSchema = yup.object({
    
  });

  return yup.object({
    set: yup.number().integer().emptyToNull().required(),
    questions: yup.array(questionSchema)
  });
}

export default function UploadQuestions() {
  const { t } = useTranslation();
  useDocumentTitle(t('question.add.headline'));
  
  const navigate = useNavigate();
  const [setValues, setSetValues] = useState<Map<number,string>>(new Map());
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isParsingCsv, setIsParsingCsv] = useState<boolean>(false);
  const [parsedCount, setParsedCount] = useState<number>(0);
  const [categoryValues, setCategoryValues] = useState<Map<number,string>>(new Map());

  const useFormResult = useForm({
    resolver: yupResolver(getSchema()),
    defaultValues: {
      questions: []
    }
  });

  const prepareRelations = async () => {
    try {
      const setValuesResponse = await axios.get('/api/questions/setValues');
      setSetValues(setValuesResponse.data);

      const categoryValuesResponse = await axios.get('/api/questions/categoryValues');
      setCategoryValues(categoryValuesResponse.data);
    } catch (error: any) {
      handleServerError(error, navigate);
    }
  };

  useEffect(() => {
    prepareRelations();
  }, []);

  // Handle CSV file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.name.endsWith('.csv') && !file.type.includes('csv')) {
        alert(t('question.upload.csvOnly'));
        event.target.value = '';
        return;
      }
      
      // Validate file size (e.g., 5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert(t('question.upload.fileTooLarge'));
        event.target.value = '';
        return;
      }
      
      setCsvFile(file);
      setUploadProgress(0);
      setParsedCount(0);
      
      // Auto-parse CSV when selected
      parseCsvFile(file);
    }
  };

  // Parse CSV file and populate form
  const parseCsvFile = async (file: File) => {
  setIsParsingCsv(true);
  try {
    // Read file as text
    const text = await readFileAsText(file);
    
    // Parse CSV
    const rows = parseCSV(text);
    
    if (rows.length === 0) {
      alert(t('question.upload.csvError'));
      return;
    }

    // Check if first row is header
    const firstRow = rows[0];
    const hasHeader = firstRow && firstRow[0]?.toLowerCase().includes('questiontext') ||
                     firstRow && firstRow[0]?.toLowerCase().includes('question text');
    
    const startRow = hasHeader ? 1 : 0;
    const questions = [];

    for (let i = startRow; i < rows.length; i++) {
      const row = rows[i];
      
      // Skip if row doesn't exist or is empty
      if (!row || row.every(cell => !cell || cell.trim() === '')) continue;

      const questionObj: any = {
        questionText: row[0]?.trim() || '',
        optA: row[1]?.trim() || '',
        optB: row[2]?.trim() || '',
        optC: row[3]?.trim() || '',
        optD: row[4]?.trim() || '',
        answer: row[5]?.trim() || '',
        correctScore: parseFloat(row[6]?.trim() || '0'),
        incorrectScore: parseFloat(row[7]?.trim() || '0'),
        lang: row[8]?.trim() || 'en',
        category: getCategoryIdByName(row[9]?.trim() || ''),
      };

      questions.push(questionObj);
    }

    

    setParsedCount(questions.length);
    
    // Set the questions in form
    useFormResult.setValue('questions', questions);
    
    // Show success message
    //alert(t('question.upload.csvParsed', { count: questions.length }));
    
  } catch (error) {
    console.error('Error parsing CSV:', error);
    alert(t('question.upload.csvError'));
  } finally {
    setIsParsingCsv(false);
  }
};

const getCategoryIdByName = (name: string): number | null => {
  for (const [key, value] of Object.entries(categoryValues)) {
    if (value.toLowerCase() === name.toLowerCase()) {
      return Number(key);
    }
  }
  return null;
};
  // Helper function to read file as text
  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => resolve(event.target?.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsText(file);
    });
  };

  // Simple CSV parser with quoted value support
  const parseCSV = (text: string): string[][] => {
    const lines = text.split(/\r\n|\n|\r/);
    const result: string[][] = [];
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      const fields: string[] = [];
      let currentField = '';
      let insideQuotes = false;
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          if (insideQuotes && line[i + 1] === '"') {
            // Escaped quote
            currentField += '"';
            i++;
          } else {
            // Start or end quotes
            insideQuotes = !insideQuotes;
          }
        } else if (char === ',' && !insideQuotes) {
          // End of field
          fields.push(currentField);
          currentField = '';
        } else {
          currentField += char;
        }
      }
      
      // Add the last field
      fields.push(currentField);
      result.push(fields);
    }
    
    return result;
  };

  // Clear selected file
  const clearFile = () => {
    setCsvFile(null);
    setParsedCount(0);
    useFormResult.setValue('questions', []);
    const fileInput = document.getElementById('csvFile') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  

  const uploadQuestions = async (data: any) => {
    window.scrollTo(0, 0);
    //alert('set id '+ data.set);

    // Validate questions exist
    if (!data.questions || data.questions.length === 0) {
      alert('Please upload a CSV file with questions first.');
      return;
    }

    try {
      // Prepare data for upload
      const username = (() => {
          try { return sessionStorage.getItem('username') || undefined; } catch (e) { return undefined; }
        })();
        const uploadData = {
            set: data.set,
            questions: data.questions.map((question: any) => ({
              ...question,
              set: data.set, // Include set ID in each question
              updatedBy: username,
              shapeType: 'SVG',
              status: 'Created' 
          }))
        };

      // Upload each question individually
      for (const question of uploadData.questions) {
        await axios.post('/api/questions', question);
      }
      
      // Show success and navigate
      setUploadProgress(100);
      alert(t('question.upload.success', { count: uploadData.questions.length }));
      
      setTimeout(() => {
        useFormResult.reset();
        clearFile();
        setUploadProgress(0);
        navigate('/questions', {
          state: {
            msgSuccess: t('question.create.success')
          }
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadProgress(0);
      handleServerError(error, navigate, useFormResult.setError, t);
    }
  };

  return (
    <>
      <div className="flex flex-wrap mb-6">
        <h1 className="grow text-3xl md:text-4xl font-medium mb-2">{t('question.add.headline')}</h1>
      </div>
      <form onSubmit={useFormResult.handleSubmit(uploadQuestions)} noValidate>
        <InputRow 
          useFormResult={useFormResult} 
          object="question" 
          field="set" 
          required={true} 
          type="select" 
          options={setValues} 
        />
        
        {/* CSV Upload Section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-xl font-medium mb-4">{t('question.upload.csvUpload')}</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-medium mb-2">
              {t('question.upload.selectFile')}
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                id="csvFile"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {csvFile && (
                <button
                  type="button"
                  onClick={clearFile}
                  className="text-red-600 hover:text-red-800 text-sm font-medium"
                >
                  {t('question.upload.clear')}
                </button>
              )}
            </div>
            <p className="mt-2 text-sm text-gray-500">
              {t('question.upload.csvFormat')}
            </p>
          </div>

          {/* Upload Progress */}
          {uploadProgress > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>{t('question.upload.uploading')}</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Parsing Indicator */}
          {isParsingCsv && (
            <div className="mb-4 flex items-center text-blue-600">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {t('question.upload.parsing')}
            </div>
          )}

          {/* Selected File Info */}
          {csvFile && !isParsingCsv && (
            <div className="p-3 bg-blue-50 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-blue-800">{csvFile.name}</p>
                  <p className="text-sm text-blue-600">
                    {Math.round(csvFile.size / 1024)} KB • {parsedCount} questions parsed
                  </p>
                </div>
                <div className="text-green-600 font-medium">
                  ✓ {t('question.upload.ready')}
                </div>
              </div>
            </div>
          )}
        </div>

        <input 
          type="submit" 
          value={t('question.upload.submit')} 
          className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300 focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" 
          disabled={isParsingCsv || !csvFile || parsedCount === 0}
        />
      </form>
    </>
  );
}

  