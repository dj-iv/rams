import React from 'react';
import FormSection from '../ui/FormSection';
import { Input } from '../ui/FormControls';

const Step1 = ({ data = {}, handler }) => {
    const handleTimeChange = (field) => (e) => {
        const newHoursOfWork = {
            ...(data.hoursOfWork || { startTime: '08:00', endTime: '17:00' }),
            [field]: e.target.value
        };
        handler({
            target: {
                name: 'hoursOfWork',
                value: newHoursOfWork
            }
        });
    };

    return (
        <div>
            <FormSection title="Step 1: Project Details" gridCols={2}>
                <Input label="Client Name" name="client" value={data.client || ''} onChange={handler} gridSpan={2} />
                <Input label="Site Address" name="siteAddress" value={data.siteAddress || ''} onChange={handler} gridSpan={2} />
                <Input label="Commencement Date" name="commencementDate" value={data.commencementDate || ''} onChange={handler} type="date"/>
                <Input label="Estimated Completion Date" name="estimatedCompletionDate" value={data.estimatedCompletionDate || ''} onChange={handler} type="date"/>
                
                {/* Hours of Work Section */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Hours of Work</label>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={data.hoursOfWork?.startTime || '08:00'}
                                onChange={handleTimeChange('startTime')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">End Time</label>
                            <input
                                type="time"
                                value={data.hoursOfWork?.endTime || '17:00'}
                                onChange={handleTimeChange('endTime')}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>
                </div>
                
                <Input label="Prepared By" name="preparedBy" value={data.preparedBy || ''} onChange={handler} />
                <Input label="Email" name="preparedByEmail" value={data.preparedByEmail || ''} onChange={handler} type="email"/>
                <Input label="Telephone" name="preparedByPhone" value={data.preparedByPhone || ''} onChange={handler} type="tel"/>
                <Input label="Document Creation Date" name="documentCreationDate" value={data.documentCreationDate || ''} onChange={handler} type="date"/>
                <Input label="Revision Number" name="revisionNumber" value={data.revisionNumber || ''} onChange={handler} />
            </FormSection>
        </div>
    );
};

export default Step1;