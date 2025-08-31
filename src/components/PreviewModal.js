import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import PrintableDocument from './PrintableDocument';

const PreviewModal = ({ isOpen, onClose, data, allTasks }) => {
    const printableRef = useRef(null);

    const handlePrint = useReactToPrint({
        content: () => printableRef.current,
        contentRef: printableRef,
        documentTitle: `RAMS-${data?.client || 'document'}-${new Date().toISOString().slice(0, 10)}`,
        pageStyle: `
          @page { size: A4; margin:15mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        `,
        copyStyles: true
    });

    if (!isOpen) return null;

    return (
        <>
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
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--uctel-blue, #2c4f6b)', margin: 0 }}>
                        RAMS Document Preview
                    </h2>
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            onClick={handlePrint}
                            style={{
                                backgroundColor: 'var(--uctel-teal, #0d6efd)',
                                color: '#ffffff',
                                fontWeight: 600,
                                padding: '0.6rem 1.25rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.15)',
                                cursor: 'pointer',
                                fontSize: '0.95rem',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                                letterSpacing: '.3px'
                            }}
                        >
                            Print To PDF
                        </button>
                        <button
                            onClick={onClose}
                            style={{
                                backgroundColor: '#e2e8f0',
                                color: '#334155',
                                fontWeight: 600,
                                padding: '0.6rem 1.25rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(0,0,0,0.12)',
                                cursor: 'pointer',
                                fontSize: '0.95rem'
                            }}
                        >
                            Close
                        </button>
                    </div>
                </header>

                <div style={{ width: '210mm', margin: '2rem 0', backgroundColor: 'white' }}>
                    <PrintableDocument data={data} allTasks={allTasks} />
                </div>
            </div>

            <div className="print-only" style={{ display: 'none' }}>
                <div ref={printableRef}>
                    <PrintableDocument data={data} allTasks={allTasks} />
                </div>
            </div>

            <style>{`
                @media print {
                    @page { margin-top: 1cm; }
                    .no-print, .main-content { display: none !important; }
                    .print-only { display: block !important; }
                }
            `}</style>
        </>
    );
};

export default PreviewModal;