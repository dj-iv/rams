import React, { useState } from 'react';

const AddCustomItemForm = ({ onSave, onCancel }) => {
    const [name, setName] = useState('');

    const handleSave = () => {
        if (name.trim()) {
            onSave(name.trim());
            setName('');
        }
    };

    return (
        <div className="mt-3 p-3 bg-blue-50 border border-dashed border-blue-200 rounded-md flex items-center gap-2">
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter new item name..."
                className="flex-grow p-2 border border-slate-300 rounded-md text-sm"
            />
            <button onClick={handleSave} className="bg-[var(--uctel-blue)] text-white font-semibold py-1 px-3 rounded-md text-sm">Add</button>
            <button onClick={onCancel} className="bg-slate-200 text-slate-700 py-1 px-3 rounded-md text-sm">Cancel</button>
        </div>
    );
};

const SelectableList = ({ category, onToggle, onAddCustom }) => {
    const [showCustomForm, setShowCustomForm] = useState(false);

    return (
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
            <h3 className="text-xl font-bold mb-4 text-slate-800">{category.title}</h3>
            <div className="space-y-3">
                {category.items.map(item => ( <label key={item.id} className="flex items-center gap-3 p-3 border rounded-md bg-white cursor-pointer hover:border-[var(--uctel-blue)] has-[:checked]:bg-teal-50 has-[:checked]:border-[var(--uctel-teal)] transition-colors"> <input type="checkbox" checked={item.selected} onChange={() => onToggle(category.id, item.id)} className="h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" /> <span className="flex-1 text-sm">{item.name}</span> </label> ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-200">
                {!showCustomForm ? ( <button onClick={() => setShowCustomForm(true)} className="w-full bg-blue-100 text-[var(--uctel-blue)] font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm"> + Add Custom Item </button> ) : ( <AddCustomItemForm onSave={(itemName) => { onAddCustom(category.id, itemName); setShowCustomForm(false); }} onCancel={() => setShowCustomForm(false)} /> )}
            </div>
        </div>
    );
};

export default SelectableList;