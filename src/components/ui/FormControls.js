import React from 'react';

export const Input = ({ label, name, value, onChange, type = 'text', gridSpan = 1 }) => (
    <div className={`flex flex-col md:col-span-${gridSpan}`}>
        <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
        <input type={type} id={name} name={name} value={value} onChange={onChange} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition" />
    </div>
);

export const TextArea = ({ label, name, value, onChange, rows = 8, gridSpan = 2 }) => (
    <div className={`flex flex-col md:col-span-${gridSpan}`}>
        <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition w-full"></textarea>
    </div>
);

export const SelectInput = ({ label, name, value, onChange, options, gridSpan = 1 }) => (
    <div className={`flex flex-col md:col-span-${gridSpan}`}>
        <label htmlFor={name} className="text-sm font-semibold text-slate-600 mb-1">{label}</label>
        <select name={name} value={value} onChange={onChange} className="w-full p-2 border border-slate-300 rounded-md text-sm bg-white focus:ring-2 focus:ring-[var(--uctel-blue)]">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
);