import React from 'react';

const Step7 = ({ previewHandler }) => (
    <div>
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 7: Review & Generate</h2>
        <div className="p-6 bg-slate-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-4 text-slate-800">You are ready to preview your document.</h3>
            <p className="text-slate-600 mb-6">Click the button below to see a full-page preview of your RAMS document. You can make changes by going back to previous steps.</p>
            <button onClick={previewHandler} className="bg-[var(--uctel-teal)] text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"> Preview Document </button>
        </div>
    </div>
);

export default Step7;