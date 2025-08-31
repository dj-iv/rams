import React from 'react';
import PrintableDocument from './PrintableDocument';

/**
 * This is the definitive fix.
 * We are using React.forwardRef to create the connection that the parent component (`PreviewModal.js`) needs.
 * This will stop the "did not receive a 'contentRef'" error.
 */
const DocumentPreview = React.forwardRef((props, ref) => {
    const { data, allTasks } = props;

    // The `ref` from the parent is attached to this div.
    // The broken print system in `PreviewModal.js` will now be able to connect to this content.
    return (
        <div ref={ref}>
            <PrintableDocument data={data} allTasks={allTasks} />
        </div>
    );
});

export default DocumentPreview;