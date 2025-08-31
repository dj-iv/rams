import React, { useEffect } from 'react';
import PrintableDocument from './PrintableDocument';

export default function PrintView({ data, allTasks }) {
  useEffect(() => {
    // Auto-print when component mounts
    window.print();
  }, []);

  return (
    <div className="print-only">
      <style>
        {`
          @page {
            size: A4;
            margin: 20mm;
          }
          
          body {
            margin: 0;
            padding: 0;
            background: white !important;
            font-family: Arial, sans-serif !important;
          }

          .print-only {
            background: white;
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 0;
          }

          @media print {
            html, body {
              width: 210mm;
              height: 297mm;
            }
            .print-only {
              width: 100%;
              min-height: 100%;
              margin: 0;
              padding: 0;
            }
            /* Do not force page breaks for each section */
            h2 { page-break-before: auto; }
            /* Avoid breaking inside elements */
            table, tr, img {
              page-break-inside: avoid;
            }
            /* Keep headers with their content */
            h1, h2, h3, h4 {
              page-break-after: avoid;
            }
            .preview-toolbar { display: none !important; }
          }
        `}
      </style>
      <PrintableDocument data={data} allTasks={allTasks} />
    </div>
  );
}
