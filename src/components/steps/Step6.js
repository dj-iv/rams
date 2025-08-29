import React from 'react';
import SelectableList from '../ui/SelectableList';

const Step6 = ({ data, handlers }) => {
    const { ppe, tools, materials } = data;
    const { 
        handleSelectableListToggle, 
        handleAddCustomSafetyItem, 
        handleCustomItemChange, 
        handleRemoveCustomItem 
    } = handlers;

    return (
        <div>
            <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 6: Equipment & Materials</h2>
            <p className="mb-6 text-slate-600">Select the Personal Protective Equipment (PPE), tools, and materials for this job. You can also add custom items.</p>
            <div className="space-y-6">
                <SelectableList 
                    category={{ id: 'ppe', title: 'Personal Protective Equipment (PPE)', items: ppe }} 
                    onToggle={handleSelectableListToggle} 
                    onAddCustom={handleAddCustomSafetyItem} 
                    onCustomChange={handleCustomItemChange}
                    onRemoveCustom={handleRemoveCustomItem}
                />
                <SelectableList 
                    category={{ id: 'tools', title: 'Plant / Equipment / Tools', items: tools }} 
                    onToggle={handleSelectableListToggle} 
                    onAddCustom={handleAddCustomSafetyItem} 
                    onCustomChange={handleCustomItemChange}
                    onRemoveCustom={handleRemoveCustomItem}
                />
                <SelectableList 
                    category={{ id: 'materials', title: 'Materials', items: materials }} 
                    onToggle={handleSelectableListToggle} 
                    onAddCustom={handleAddCustomSafetyItem} 
                    onCustomChange={handleCustomItemChange}
                    onRemoveCustom={handleRemoveCustomItem}
                />
            </div>
        </div>
    );
};

export default Step6;