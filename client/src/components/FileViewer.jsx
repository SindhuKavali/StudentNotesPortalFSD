import React, { useState, useEffect } from 'react';
import axios from 'axios';
import mammoth from 'mammoth';
import { Loader2, AlertCircle } from 'lucide-react';

export default function FileViewer({ fileUrl }) {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fileType = fileUrl ? fileUrl.split('.').pop().toLowerCase() : '';
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(fileType);
  const isPdf = fileType === 'pdf';
  const isDocx = fileType === 'docx';
  const isDoc = fileType === 'doc';

  useEffect(() => {
    if (isDocx) {
      const loadDocx = async () => {
        try {
          const response = await axios.get(`http://localhost:5000${fileUrl}`, {
            responseType: 'arraybuffer'
          });
          const result = await mammoth.convertToHtml({ arrayBuffer: response.data });
          setHtmlContent(result.value);
        } catch (err) {
          console.error(err);
          setError('Failed to load document preview.');
        } finally {
          setLoading(false);
        }
      };
      loadDocx();
    } else {
      setLoading(false);
    }
  }, [fileUrl, isDocx]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-slate-600 font-medium">Preparing document preview...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-red-50 rounded-xl text-red-600 h-64 border border-red-100">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="flex justify-center bg-slate-100 p-4 rounded-xl overflow-auto h-[60vh]">
        <img src={`http://localhost:5000${fileUrl}`} alt="Preview" className="max-w-full h-auto object-contain" />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="w-full h-[70vh] bg-slate-100 rounded-xl overflow-hidden border border-slate-200">
        <iframe src={`http://localhost:5000${fileUrl}`} className="w-full h-full border-0" title="PDF Preview" />
      </div>
    );
  }

  if (isDocx) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-inner h-[60vh] overflow-y-auto text-slate-800 space-y-4">
        <div 
          className="preview-content" 
          style={{ 
            lineHeight: '1.6', 
            fontSize: '1rem',
            fontFamily: 'sans-serif'
          }}
          dangerouslySetInnerHTML={{ __html: htmlContent || '<p><em>Document is empty</em></p>' }} 
        />
      </div>
    );
  }

  if (isDoc) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-yellow-50 rounded-xl border border-yellow-200 h-64">
        <AlertCircle className="w-10 h-10 text-yellow-600 mb-4" />
        <h3 className="text-lg font-bold text-yellow-800 mb-2">Legacy Format Detected</h3>
        <p className="text-yellow-700 text-center max-w-md">
          This file is in an older <strong>.doc</strong> format which cannot be safely previewed in the browser. 
          Please download the file to view it on your computer.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 bg-slate-50 rounded-xl h-64 border border-slate-200">
      <AlertCircle className="w-8 h-8 text-slate-400 mb-4" />
      <p className="text-slate-600">Preview not available for this file type.</p>
    </div>
  );
}
