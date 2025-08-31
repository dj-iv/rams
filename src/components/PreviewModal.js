import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintableDocument from './PrintableDocument';

const PreviewModal = ({ isOpen, onClose, data, allTasks }) => {
    const printableRef = useRef();

    const handlePrint = useReactToPrint({
        content: () => printableRef.current,
        documentTitle: `RAMS-${data?.client || 'document'}-${new Date().toISOString().slice(0, 10)}`,
    });

    if (!isOpen) {
        return null;
    }

    return (
        <>
            {/* This is the on-screen modal for previewing */}
            <div className="preview-modal-overlay no-print" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 1000,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                overflowY: 'auto',
            }}>
                <header style={{
                    width: '100%',
                    padding: '1rem 2rem',
                    backgroundColor: '#fff',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    position: 'sticky',
                    top: 0,
                    zIndex: 1001,
                }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--uctel-blue, #2c4f6b)' }}>
                        RAMS Document Preview
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button 
                            onClick={handlePrint} 
                            className="bg-[var(--uctel-teal)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors"
                        >
                            Download PDF
                        </button>
                        <button 
                            onClick={onClose}
                            className="bg-slate-200 text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </header>
                
                <div style={{ width: '210mm', margin: '2rem 0', backgroundColor: 'white' }}>
                    <PrintableDocument data={data} allTasks={allTasks} />
                </div>
            </div>

            {/* This is a hidden container used ONLY for printing */}
            <div className="print-only" style={{ display: 'none' }}>
                <div ref={printableRef}>
                    <PrintableDocument data={data} allTasks={allTasks} />
                </div>
            </div>

            <style>{`
                @media print {
                    /* Add margin to the printed page */
                    @page {
                        margin-top: 1cm;
                    }

                    /* Hide everything on screen that is not for printing */
                    .no-print, .main-content {
                        display: none !important;
                    }

                    /* Make the print-only container visible */
                    .print-only {
                        display: block !important;
                    }
                }
            `}</style>
        </>
    );
};

export default PreviewModal;