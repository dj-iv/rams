import React from 'react';
import PrintableDocument from './PrintableDocument';

const PreviewPage = ({ data, allTasks, onClose }) => {
  return (
  <div className="fixed inset-0 bg-white z-50 overflow-auto min-h-screen">
  <div className="sticky top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center shadow-sm print-hidden preview-toolbar">
        <h1 className="text-xl font-semibold text-gray-800">Document Preview</h1>
        <div className="flex gap-4">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 bg-[var(--uctel-blue)] text-white px-4 py-2 rounded-md hover:bg-opacity-90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17H7V7h10v10zm0 0v4H7v-4"/>
            </svg>
            Print / Save as PDF
          </button>
          <button
            onClick={onClose}
            className="flex items-center gap-2 bg-gray-100 text-gray-600 px-4 py-2 rounded-md hover:bg-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Close Preview
          </button>
        </div>
      </div>
  <div className="py-8 flex flex-col items-center">
        <PrintableDocument data={data} allTasks={allTasks} />
      </div>
    </div>
  );
};

export default PreviewPage;
