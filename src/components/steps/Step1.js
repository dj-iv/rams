import React from 'react';
import FormSection from '../ui/FormSection';
import { Input } from '../ui/FormControls';

const Step1 = ({ data = {}, handler, onSignatureImageUpload, onSignatureImageRemove }) => {
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

    const signatureData = data.signatureBlock || {};
    const signatureMode = signatureData.mode || 'typed';
    const typedSignatureValue = signatureData.signatureText ?? signatureData.name ?? data.preparedBy ?? '';
    const handleSignatureUpload = (e) => {
        const file = e.target.files && e.target.files[0];
        if (file && onSignatureImageUpload) {
            onSignatureImageUpload(file);
            e.target.value = '';
        }
    };

    const handleSignatureModeChange = (mode) => {
        handler({
            target: {
                name: 'signatureBlock.mode',
                value: mode,
                type: 'text'
            }
        });

        if (mode === 'typed' && signatureData.signatureImage && onSignatureImageRemove) {
            onSignatureImageRemove();
        }
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

            <div className="mt-8 p-6 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="flex flex-col gap-2">
                    <h3 className="text-xl font-semibold text-[var(--uctel-blue)]">Sign-off &amp; Approval</h3>
                    <p className="text-sm text-slate-600">
                        These details are pre-filled from the prepared by information and will appear on the final document.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                    <Input
                        label="Signatory Name"
                        name="signatureBlock.name"
                        value={signatureData.name ?? data.preparedBy ?? ''}
                        onChange={handler}
                    />
                    <Input
                        label="Sign-off Date"
                        name="signatureBlock.date"
                        type="date"
                        value={signatureData.date ?? data.documentCreationDate ?? ''}
                        onChange={handler}
                    />
                </div>

                <div className="mt-6">
                    <p className="text-sm font-semibold text-slate-700 mb-2">Signature Source</p>
                    <div className="flex flex-wrap gap-6 text-sm text-slate-700">
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="signature-mode"
                                value="typed"
                                checked={signatureMode !== 'image'}
                                onChange={() => handleSignatureModeChange('typed')}
                            />
                            Use handwritten text
                        </label>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="signature-mode"
                                value="image"
                                checked={signatureMode === 'image'}
                                onChange={() => handleSignatureModeChange('image')}
                            />
                            Upload signature image
                        </label>
                    </div>
                </div>

                {signatureMode !== 'image' && (
                    <div className="mt-6 space-y-4">
                        <Input
                            label="Signature (typed)"
                            name="signatureBlock.signatureText"
                            value={typedSignatureValue}
                            onChange={handler}
                        />
                        <div className="p-4 border-2 border-dashed border-[var(--uctel-teal)] rounded-xl bg-slate-50">
                            <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Preview</p>
                            <div style={{
                                fontFamily: '"Allura", "Great Vibes", "Brush Script MT", cursive',
                                fontSize: '2.5rem',
                                color: '#1f2937'
                            }}>
                                {typedSignatureValue || 'Type a signature'}
                            </div>
                        </div>
                    </div>
                )}

                {signatureMode === 'image' && (
                    <div className="mt-6 space-y-4">
                        {signatureData.signatureImage ? (
                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <img
                                    src={signatureData.signatureImage.dataUrl}
                                    alt="Uploaded signature"
                                    className="max-h-24 object-contain border border-slate-200 rounded-md bg-white"
                                />
                                <button
                                    type="button"
                                    onClick={onSignatureImageRemove}
                                    className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600"
                                >
                                    Remove image
                                </button>
                            </div>
                        ) : (
                            <p className="text-sm text-slate-600">
                                Upload a transparent PNG or JPG of your handwritten signature.
                            </p>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleSignatureUpload}
                            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--uctel-blue)] file:text-white hover:file:bg-blue-700"
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Step1;