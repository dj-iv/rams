import React, { useState } from 'react';
import SelectableList from '../ui/SelectableList';
import { TextArea } from '../ui/FormControls';

const BooleanWithTextCategory = ({ category, onChange }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
        <h3 className="text-xl font-bold mb-4 text-slate-800">{category.title}</h3>
        <div className="flex items-center gap-6 mb-4">
            <p>{category.question}</p>
            <label className="flex items-center gap-2">
                <input type="radio" name={category.id} checked={category.enabled} onChange={() => onChange(category.id, 'enabled', true)} className="h-4 w-4 text-[var(--uctel-teal)]"/> Yes
            </label>
            <label className="flex items-center gap-2">
                <input type="radio" name={category.id} checked={!category.enabled} onChange={() => onChange(category.id, 'enabled', false)} className="h-4 w-4 text-[var(--uctel-teal)]"/> No
            </label>
        </div>
        <TextArea 
            label="Details" 
            name={`${category.id}-details`} 
            value={category.details} 
            onChange={(e) => onChange(category.id, 'details', e.target.value)} 
            rows={3} 
        />
    </div>
);

const TextAreaCategory = ({ category, onChange }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
        <h3 className="text-xl font-bold mb-4 text-slate-800">{category.title}</h3>
        <TextArea 
            label="Details" 
            name={`${category.id}-details`} 
            value={category.details} 
            onChange={(e) => onChange(category.id, 'details', e.target.value)} 
            rows={4} 
        />
    </div>
);

const AddNewCategoryForm = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('textArea');

    const handleSave = () => {
        if (!title.trim()) {
            alert('Please enter a title for the new category.');
            return;
        }
        onSave({ title, type });
    };

    return (
        <div className="mt-6 p-4 bg-green-50 border-2 border-dashed border-green-300 rounded-lg space-y-3">
            <h4 className="font-bold text-slate-800">Add New Logistics Category</h4>
            <input
                type="text"
                placeholder="Category Title (e.g., 'Site Access Details')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
            <select value={type} onChange={(e) => setType(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm">
                <option value="textArea">Text Area (for notes)</option>
                <option value="selectableList">Selectable List (like Permits)</option>
            </select>
            <div className="flex gap-2 pt-2">
                <button onClick={handleSave} className="bg-green-600 text-white font-semibold py-1 px-3 rounded-md text-sm">Save Category</button>
                <button onClick={onCancel} className="bg-slate-200 text-slate-700 py-1 px-3 rounded-md text-sm">Cancel</button>
            </div>
        </div>
    );
};


const Step5 = ({ data, handlers }) => {
    const [showNewCategoryForm, setShowNewCategoryForm] = useState(false);

    return (
        <div>
            <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 5: Safety & Logistics</h2>
            <div className="space-y-8">
                {data.safetyLogistics.map(category => {
                    switch (category.type) {
                        case 'selectableList':
                            return (
                                <div key={category.id}>
                                    <SelectableList 
                                        category={category} 
                                        onToggle={handlers.handleSafetyListItemToggle} 
                                        onAddCustom={handlers.handleAddCustomSafetyItem} 
                                    />
                                    {category.id === 'permits' && (
                                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <label className="block text-sm font-medium text-blue-800 mb-2">
                                                Permits Details (Optional)
                                            </label>
                                            <textarea
                                                value={data.permitsDetails || ''}
                                                onChange={(e) => handlers.handleInputChange({ target: { name: 'permitsDetails', value: e.target.value } })}
                                                placeholder="Add site-specific details about where/how permits are obtained..."
                                                rows={3}
                                                className="w-full p-2 border border-blue-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                    )}
                                </div>
                            );
                        case 'booleanWithText':
                            return <BooleanWithTextCategory key={category.id} category={category} onChange={handlers.handleSafetyLogisticsChange} />;
                        case 'textArea':
                             return <TextAreaCategory key={category.id} category={category} onChange={handlers.handleSafetyLogisticsChange} />;
                        default:
                            return null;
                    }
                })}
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200">
                {!showNewCategoryForm ? (
                    <button onClick={() => setShowNewCategoryForm(true)} className="w-full bg-green-100 text-green-800 font-semibold py-2 px-4 rounded-lg hover:bg-green-200 transition-colors text-sm">
                        + Add New Logistics Category
                    </button>
                ) : (
                    <AddNewCategoryForm 
                        onSave={(newCategory) => { handlers.handleAddNewSafetyCategory(newCategory); setShowNewCategoryForm(false); }}
                        onCancel={() => setShowNewCategoryForm(false)}
                    />
                )}
            </div>
        </div>
    );
};

export default Step5;