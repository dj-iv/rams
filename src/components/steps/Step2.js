import React from 'react';
import FormSection from '../ui/FormSection';

const Step2 = ({ data, onChange, onAdd, onRemove }) => (
    <div>
        <FormSection title="Step 2: Project Team" gridCols={1}>
            <p className="text-slate-600 md:col-span-1 -mt-4 mb-2">List the key personnel involved in this project.</p>
            <div className="space-y-4">
                {data.projectTeam.map((member, index) => (
                    <div key={member.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border rounded-lg bg-slate-50 relative">
                        <div className="md:col-span-3">
                            <label className="text-sm font-semibold text-slate-600">Name</label>
                            <input type="text" value={member.name} onChange={(e) => onChange(index, 'name', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-slate-600">Role</label>
                            <input type="text" value={member.role} onChange={(e) => onChange(index, 'role', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-semibold text-slate-600">Competencies</label>
                            <textarea value={member.competencies} onChange={(e) => onChange(index, 'competencies', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" rows="2" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-semibold text-slate-600">Telephone</label>
                            <input type="text" value={member.phone} onChange={(e) => onChange(index, 'phone', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                        </div>
                        {data.projectTeam.length > 1 && (
                            <button onClick={() => onRemove(index)} className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">&times;</button>
                        )}
                    </div>
                ))}
            </div>
            <button onClick={onAdd} className="mt-4 bg-blue-100 text-[var(--uctel-blue)] font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                + Add Team Member
            </button>
        </FormSection>
    </div>
);

export default Step2;