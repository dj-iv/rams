import React, { useState } from 'react';
import { Input, TextArea, SelectInput } from '../ui/FormControls'; // Input is needed for the new form

const NewHazardForm = ({ onSave, onCancel }) => {
    const [formState, setFormState] = useState({
        hazard: '', who: '', controls: '',
        initialLikelihood: 3, initialSeverity: 3,
        residualLikelihood: 1, residualSeverity: 2,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        if (!formState.hazard || !formState.who || !formState.controls) {
            alert('Please fill out Hazard, Who/How Harmed, and Controls fields.');
            return;
        }
        onSave({
            ...formState,
            initialLikelihood: Number(formState.initialLikelihood),
            initialSeverity: Number(formState.initialSeverity),
            residualLikelihood: Number(formState.residualLikelihood),
            residualSeverity: Number(formState.residualSeverity),
        });
    };

    const scoreOptions = [
        { value: 1, label: '1 - Very Unlikely / Insignificant' },
        { value: 2, label: '2 - Unlikely / Minor' },
        { value: 3, label: '3 - Possible / Moderate' },
        { value: 4, label: '4 - Likely / Major' },
        { value: 5, label: '5 - Very Likely / Catastrophic' },
    ];

    return (
        <div className="mt-4 p-4 bg-teal-50 border-2 border-dashed border-teal-300 rounded-lg space-y-3">
            <h4 className="font-bold text-slate-800">Add New Hazard</h4>
            <Input label="Hazard" name="hazard" value={formState.hazard} onChange={handleChange} gridSpan={2} />
            <Input label="Who/How Harmed" name="who" value={formState.who} onChange={handleChange} gridSpan={2} />
            <TextArea label="Control Measures" name="controls" value={formState.controls} onChange={handleChange} rows={4} gridSpan={2} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <SelectInput label="Initial Likelihood" name="initialLikelihood" value={formState.initialLikelihood} onChange={handleChange} options={scoreOptions} />
                <SelectInput label="Initial Severity" name="initialSeverity" value={formState.initialSeverity} onChange={handleChange} options={scoreOptions} />
                <SelectInput label="Residual Likelihood" name="residualLikelihood" value={formState.residualLikelihood} onChange={handleChange} options={scoreOptions} />
                <SelectInput label="Residual Severity" name="residualSeverity" value={formState.residualSeverity} onChange={handleChange} options={scoreOptions} />
            </div>
            <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="bg-[var(--uctel-teal)] text-white font-semibold py-1 px-3 rounded-md text-sm">Save Hazard</button>
                <button onClick={onCancel} className="bg-slate-200 text-slate-700 py-1 px-3 rounded-md text-sm">Cancel</button>
            </div>
        </div>
    );
};

const NewRiskCategoryForm = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please enter a title for the new risk category.');
            return;
        }
        onSave({ title });
    };

    return (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-dashed border-blue-300 rounded-lg space-y-3">
            <h4 className="font-bold text-slate-800">Add New Risk Category</h4>
            <Input
                label="Category Title (e.g., Electrical Work)"
                name="newRiskCategoryTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                gridSpan={2}
            />
            <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="bg-[var(--uctel-blue)] text-white font-semibold py-1 px-3 rounded-md text-sm">Save Category</button>
                <button onClick={onCancel} className="bg-slate-200 text-slate-700 py-1 px-3 rounded-md text-sm">Cancel</button>
            </div>
        </div>
    );
};

const Step4 = ({ data, handlers, addingHazardTo, showNewRiskCategoryForm }) => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 flex-grow">Step 4: Identify Risks</h2>
            {!showNewRiskCategoryForm && !addingHazardTo && ( <button onClick={() => handlers.setShowNewRiskCategoryForm(true)} className="bg-green-100 text-green-800 font-semibold py-1 px-3 rounded-lg hover:bg-green-200 transition-colors text-sm ml-4 flex-shrink-0" > + Add Risk Category </button> )}
        </div>
        <p className="mb-6 text-slate-600">Select the hazards that are relevant to this project. This will include them in the final document.</p>
        {Object.keys(data.risks).map(riskKey => {
            const risk = data.risks[riskKey];
            return (
                <div key={riskKey} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-slate-800">{risk.title}</h3>
                        <button onClick={() => handlers.setAddingHazardTo(riskKey)} className="bg-blue-100 text-[var(--uctel-blue)] font-semibold py-1 px-3 rounded-lg hover:bg-blue-200 transition-colors text-sm" > + Add Hazard </button>
                    </div>
                    <div className="space-y-3">
                        {risk.hazards.map(hazard => (
                            <label key={hazard.id} className="flex items-start gap-4 p-4 border rounded-md bg-white cursor-pointer hover:border-[var(--uctel-blue)] has-[:checked]:bg-teal-50 has-[:checked]:border-[var(--uctel-teal)] transition-colors">
                                <input type="checkbox" checked={hazard.selected} onChange={() => handlers.handleRiskToggle(riskKey, hazard.id)} className="mt-1 h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" />
                                <div className="flex-1"> <p className="font-semibold">{hazard.hazard}</p> <p className="text-sm text-slate-600 mt-1"><strong className="font-semibold text-slate-700">Who/How:</strong> {hazard.who}</p> <p className="text-sm text-slate-600 mt-1"><strong className="font-semibold text-slate-700">Controls:</strong> {hazard.controls}</p> </div>
                            </label>
                        ))}
                    </div>
                    {addingHazardTo === riskKey && ( <NewHazardForm onSave={(newHazardData) => handlers.handleAddNewHazard(riskKey, newHazardData)} onCancel={() => handlers.setAddingHazardTo(null)} /> )}
                </div>
            );
        })}
        {showNewRiskCategoryForm && (
            <NewRiskCategoryForm 
                onSave={handlers.handleAddNewRiskCategory}
                onCancel={() => handlers.setShowNewRiskCategoryForm(false)}
            />
        )}
    </div>
);

export default Step4;