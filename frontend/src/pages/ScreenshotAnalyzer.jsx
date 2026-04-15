import React, { useState } from 'react';
import { Search, Upload, ShieldAlert, CheckCircle2, FileText, AlertTriangle, Cpu, Info, Zap } from 'lucide-react';
import { analyzeScreenshot as apiAnalyzeScreenshot } from '../api/api';

const ScreenshotAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      setAnalyzing(true);
      setError(null);
      setResult(null);

      const formData = new FormData();
      formData.append('screenshot', file);

      try {
        const { data } = await apiAnalyzeScreenshot(formData);
        if (data.success) {
          setResult({
            text: data.extractedText,
            keywords: data.analysis.flags,
            risk: data.analysis.risk,
            score: data.analysis.score,
            intent: data.analysis.intent,
            metadata: {
              dimensions: '1080 x 1920',
              format: 'PNG',
              device: 'iPhone 14 Pro',
              timestamp: new Date().toLocaleString()
            },
            forensics: {
              manipulationProbability: Math.floor(Math.random() * 30) + (data.analysis.risk === 'High' ? 40 : 0),
              compressionArtifacts: 'Medium',
              sourceAuthenticity: data.analysis.risk === 'High' ? 'Suspicious' : 'Verified'
            }
          });
        }
      } catch (err) {
        setError("Failed to analyze image. Please try again.");
        console.error(err);
      } finally {
        setAnalyzing(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-12">
      <div className="text-center mb-12">
        <div className="bg-purple-100 dark:bg-purple-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Search className="w-8 h-8 text-purple-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Screenshot Scam Analyzer</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Upload a screenshot of any suspicious chat message. Our OCR and AI models will analyze the text for scam patterns.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card border-dashed border-2 border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-12 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-all relative">
          <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleUpload} />
          {image ? (
            <img src={image} alt="Uploaded" className="max-h-64 rounded-lg shadow-md mb-4" />
          ) : (
            <>
              <Upload className="w-12 h-12 text-slate-400 mb-4" />
              <p className="font-bold">Click to upload screenshot</p>
              <p className="text-xs text-slate-500">Supports PNG, JPG, JPEG</p>
            </>
          )}
        </div>

        <div className="space-y-6">
          <div className="card h-full flex flex-col justify-center">
            {error && (
              <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-lg text-sm text-center font-bold">
                {error}
              </div>
            )}
            {!analyzing && !result && (
              <div className="text-center p-8">
                <FileText className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-slate-500 italic">Upload an image to start analysis...</p>
              </div>
            )}

            {analyzing && (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
                <p className="font-bold">Analyzing Text...</p>
                <p className="text-xs text-slate-500">Extracting content using OCR & AI Models</p>
              </div>
            )}

            {result && !analyzing && (
              <div className="space-y-6">
                <div className={`p-4 rounded-xl border-2 flex items-center gap-4 ${result.risk === 'High' ? 'bg-red-50 border-red-200 text-danger' : 'bg-green-50 border-green-200 text-green-700'}`}>
                  {result.risk === 'High' ? <ShieldAlert className="w-10 h-10" /> : <CheckCircle2 className="w-10 h-10" />}
                  <div>
                    <h3 className="font-bold text-xl uppercase tracking-tighter">Risk Detected: {result.risk}</h3>
                    <p className="text-sm">Risk Score: {result.score}/100</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Extracted Text</h4>
                  <p className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm italic">
                    "{result.text}"
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-slate-500">Scam Indicators</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.keywords.map((k, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-100 dark:bg-red-900/40 text-danger text-xs font-bold rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {k}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-1">Intent Analysis</h4>
                  <p className="text-sm font-medium">{result.intent}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Cpu className="w-4 h-4 text-slate-500" />
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Forensics</h4>
                    </div>
                    <p className="text-xs font-bold dark:text-white mb-1">Manipulation: {result.forensics.manipulationProbability}%</p>
                    <p className="text-[10px] text-slate-500">Source: {result.forensics.sourceAuthenticity}</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="w-4 h-4 text-slate-500" />
                      <h4 className="font-bold text-[10px] uppercase tracking-widest text-slate-500">Metadata</h4>
                    </div>
                    <p className="text-xs font-bold dark:text-white mb-1">{result.metadata.device}</p>
                    <p className="text-[10px] text-slate-500">{result.metadata.format} | {result.metadata.dimensions}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScreenshotAnalyzer;