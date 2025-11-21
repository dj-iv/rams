import React from 'react';
import SelectableList from '../ui/SelectableList';

const Step6 = ({ data, handlers }) => {
    const { ppe, tools, materials, ppeDetails, toolsDetails, materialsDetails } = data;
    const { 
        handleSelectableListToggle, 
        handleAddCustomSafetyItem, 
        handleCustomItemChange, 
        handleRemoveCustomItem,
        handleInputChange
    } = handlers;

    return (
        <div>
            <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 6: Equipment & Materials</h2>
            <p className="mb-6 text-slate-600">Select the Personal Protective Equipment (PPE), tools, and materials for this job. You can also add custom items and site-specific details.</p>
            <div className="space-y-6">
                <div>
                    <SelectableList 
                        category={{ id: 'ppe', title: 'Personal Protective Equipment (PPE)', items: ppe }} 
                        onToggle={handleSelectableListToggle} 
                        onAddCustom={handleAddCustomSafetyItem} 
                        onEditItem={handleCustomItemChange}
                        onRemoveItem={handleRemoveCustomItem}
                    />
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <label className="block text-sm font-medium text-green-800 mb-2">
                            PPE Details (Optional)
                        </label>
                        <textarea
                            value={ppeDetails || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'ppeDetails', value: e.target.value } })}
                            placeholder="Add site-specific PPE details (e.g., storage location, maintenance requirements)..."
                            rows={3}
                            className="w-full p-2 border border-green-300 rounded-md text-sm focus:ring-green-500 focus:border-green-500"
                        />
                    </div>
                </div>

                <div>
                    <SelectableList 
                        category={{ id: 'tools', title: 'Plant / Equipment / Tools', items: tools }} 
                        onToggle={handleSelectableListToggle} 
                        onAddCustom={handleAddCustomSafetyItem} 
                        onEditItem={handleCustomItemChange}
                        onRemoveItem={handleRemoveCustomItem}
                    />
                    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                        <label className="block text-sm font-medium text-orange-800 mb-2">
                            Tools & Equipment Details (Optional)
                        </label>
                        <textarea
                            value={toolsDetails || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'toolsDetails', value: e.target.value } })}
                            placeholder="Add site-specific tool details (e.g., hire arrangements, storage requirements)..."
                            rows={3}
                            className="w-full p-2 border border-orange-300 rounded-md text-sm focus:ring-orange-500 focus:border-orange-500"
                        />
                    </div>
                </div>

                <div>
                    <SelectableList 
                        category={{ id: 'materials', title: 'Materials', items: materials }} 
                        onToggle={handleSelectableListToggle} 
                        onAddCustom={handleAddCustomSafetyItem} 
                        onEditItem={handleCustomItemChange}
                        onRemoveItem={handleRemoveCustomItem}
                    />
                    <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                        <label className="block text-sm font-medium text-purple-800 mb-2">
                            Materials Details (Optional)
                        </label>
                        <textarea
                            value={materialsDetails || ''}
                            onChange={(e) => handleInputChange({ target: { name: 'materialsDetails', value: e.target.value } })}
                            placeholder="Add site-specific material details (e.g., supplier information, handling requirements)..."
                            rows={3}
                            className="w-full p-2 border border-purple-300 rounded-md text-sm focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Step6;