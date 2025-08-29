import React from 'react';
import FormSection from '../ui/FormSection';
import { Input } from '../ui/FormControls';

const Step1 = ({ data, handler }) => (
    <div>
        <FormSection title="Step 1: Project Details" gridCols={2}>
            <Input label="Client Name" name="client" value={data.client} onChange={handler} gridSpan={2} />
            <Input label="Site Address" name="siteAddress" value={data.siteAddress} onChange={handler} gridSpan={2} />
            <Input label="Commencement Date" name="commencementDate" value={data.commencementDate} onChange={handler} type="date"/>
            <Input label="Estimated Completion Date" name="estimatedCompletionDate" value={data.estimatedCompletionDate} onChange={handler} type="date"/>
            <Input label="Prepared By" name="preparedBy" value={data.preparedBy} onChange={handler} />
            <Input label="Email" name="preparedByEmail" value={data.preparedByEmail} onChange={handler} type="email"/>
            <Input label="Telephone" name="preparedByPhone" value={data.preparedByPhone} onChange={handler} type="tel"/>
            <Input label="Document Creation Date" name="documentCreationDate" value={data.documentCreationDate} onChange={handler} type="date"/>
            <Input label="Revision Number" name="revisionNumber" value={data.revisionNumber} onChange={handler} />
        </FormSection>
    </div>
);

export default Step1;