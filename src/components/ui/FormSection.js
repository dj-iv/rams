import React from 'react';

const FormSection = ({ title, children, gridCols = 2 }) => (
    <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">{title}</h2>
        <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>{children}</div>
    </div>
);

export default FormSection;