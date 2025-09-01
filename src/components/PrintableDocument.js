import React from 'react';
import riskEvaluationMatrix from '../assets/risk-evaluation-matrix.png';
import uctelLogo from '../assets/uctel-logo.png';

const getRiskColor = (score) => {
    if (score >= 20) return '#ef5350'; // Red
    if (score >= 15) return '#ffa726'; // Orange
    if (score >= 8) return '#ffca28'; // Yellow
    if (score >= 1) return '#66bb6a'; // Green
    return 'transparent';
};

const Section = ({ title, children }) => (
    <div style={{ marginTop: '40px', pageBreakInside: 'avoid' }}>
        <h2 style={{ color: '#2c4f6b', borderBottom: '2px solid #008080', paddingBottom: '5px', marginBottom: '20px' }}>
            {title}
        </h2>
        {children}
    </div>
);

const DetailItem = ({ label, value }) => (
    <div style={{ marginBottom: '10px' }}>
        <p style={{ margin: 0, fontSize: '10px', color: '#555', fontWeight: 'bold' }}>{label}</p>
        <p style={{ margin: 0, fontSize: '12px' }}>{value}</p>
    </div>
);

const PrintableDocument = ({ data, allTasks }) => {
    if (!data) {
        return <div>Loading document...</div>;
    }

    const {
        client,
        siteAddress,
        projectDescription,
        commencementDate,
        estimatedCompletionDate,
        preparedBy,
        preparedByEmail,
        preparedByPhone,
        documentCreationDate,
        revisionNumber,
        projectTeam,
        selectedTasks,
        risks,
        ppe,
        tools,
        materials,
        safetyLogistics
    } = data;

    const enabledTasks = selectedTasks.filter(task => task.enabled);

    const tableHeaderStyle = {
        backgroundColor: '#2c4f6b',
        color: 'white',
        padding: '8px',
        fontSize: '10px',
        textAlign: 'left', // Align all header text to the left for consistency
        border: '1px solid #ddd',
        verticalAlign: 'middle',
        height: '50px', // Set a fixed height to ensure room for rotated/stacked text in PDF
    };

    const rotatedHeaderStyle = {
        ...tableHeaderStyle,
        writingMode: 'vertical-rl',
        textAlign: 'center',
        transform: 'rotate(180deg)', // Flips the vertical text to read bottom-to-top
    };

    const rotatedTextStyle = {
        writingMode: 'vertical-rl',
        textAlign: 'center',
        transform: 'rotate(180deg)',
        display: 'inline-block',
        whiteSpace: 'nowrap',
        lineHeight: '1.2',
    };

    const cellStyle = {
        padding: '8px',
        fontSize: '10px',
        border: '1px solid #ddd',
        textAlign: 'left',
        verticalAlign: 'middle',
        // REMOVED: wordBreak: 'break-word',
    };

    const riskCell = (score) => ({
        ...cellStyle,
        backgroundColor: getRiskColor(score),
        fontWeight: 'bold',
        textAlign: 'center',
        color: score > 12 ? 'white' : 'black',
    });

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', color: '#333', padding: '40px', backgroundColor: 'white' }}>
            <header style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: '40px' 
            }}>
                {/* Force image size with a container */}
                <div style={{ width: '6cm', marginBottom: '8mm' }}>
                    <img 
                        src={uctelLogo} 
                        alt="UCtel Logo" 
                        style={{ 
                            width: '100%', 
                            height: 'auto',
                        }} 
                    />
                </div>
                <h1 style={{ 
                    color: '#2c4f6b', 
                    margin: 0, 
                    fontSize: '32px', 
                    lineHeight: '1.2',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}>
                    Risk Assessment<br />& Method Statement
                </h1>
            </header>

            {/* Table of Contents */}
            <Section title="Table of Contents">
                <div style={{ fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>1.0 Project Details</span>
                        <span>2</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>2.0 Project Team</span>
                        <span>3</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>3.0 Method Statement (Sequence of Works)</span>
                        <span>4</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>4.0 Risk Assessments</span>
                        <span>5</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>5.0 Safety & Logistics</span>
                        <span>6</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>6.0 Equipment</span>
                        <span>7</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                        <span>7.0 Approval & Sign-Off</span>
                        <span>8</span>
                    </div>
                </div>
            </Section>

            <Section title="1.0 Project Details">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                        <DetailItem label="Client" value={client} />
                        <DetailItem label="Site Address" value={siteAddress} />
                        <DetailItem label="Project Description" value={projectDescription} />
                    </div>
                    <div>
                        <DetailItem label="Commencement Date" value={commencementDate} />
                        <DetailItem label="Estimated Completion Date" value={estimatedCompletionDate} />
                        <DetailItem label="Prepared By" value={`${preparedBy} | ${preparedByEmail} | ${preparedByPhone}`} />
                        <DetailItem label="Document Creation Date" value={documentCreationDate} />
                        <DetailItem label="Revision Number" value={revisionNumber} />
                    </div>
                </div>
            </Section>

            <Section title="2.0 Project Team">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr>
                            <th style={tableHeaderStyle}>Name</th>
                            <th style={tableHeaderStyle}>Role</th>
                            <th style={tableHeaderStyle}>Competencies</th>  {/* Swapped: Competencies now before Phone */}
                            <th style={tableHeaderStyle}>Phone</th>       {/* Swapped: Phone now after Competencies */}
                        </tr>
                    </thead>
                    <tbody>
                        {projectTeam.filter(member => member.name).map(member => (
                            <tr key={member.id}>
                                <td style={cellStyle}>{member.name}</td>
                                <td style={cellStyle}>{member.role}</td>
                                <td style={cellStyle}>{member.competencies}</td>  {/* Swapped: Competencies now before Phone */}
                                <td style={cellStyle}>{member.phone}</td>         {/* Swapped: Phone now after Competencies */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Section>

            <Section title="3.0 Method Statement (Sequence of Works)">
                <div style={{ fontSize: '12px' }}>
                    {enabledTasks.map((task, index) => (
                        <div key={task.id} style={{ marginBottom: '20px' }}>
                            <h4 style={{
                                margin: '0 0 5px 0',
                                color: '#2c4f6b',
                                fontSize: '14px',
                                fontWeight: 'bold'
                            }}>
                                3.{index + 1} {allTasks[task.taskId]?.title || 'Unknown Task'}
                            </h4>
                            <p style={{
                                margin: 0,
                                lineHeight: '1.5'
                            }}>
                                {task.description}
                            </p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section title="4.0 Risk Assessments">
                {Object.entries(risks).map(([key, riskCategory]) => (
                    <div key={key} style={{ pageBreakInside: 'avoid', marginBottom: '40px' }}>
                        <h3 style={{ color: '#2c4f6b', marginBottom: '15px' }}>{riskCategory.title}</h3>
                        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd', tableLayout: 'fixed' }}>
                            <thead>
                                <tr>
                                    {/* Using stacked text for narrow columns */}
                                    <th style={{...tableHeaderStyle, width: '6%', textAlign: 'center'}}>Risk<br/>No.</th>
                                    <th style={{...tableHeaderStyle, width: '15%'}}>Hazard</th>
                                    <th style={{...tableHeaderStyle, width: '17%'}}>Who/How Harmed</th>
                                    
                                    {/* Use flexbox for robust centering in PDF */}
                                    <th style={{...tableHeaderStyle, width: '6%'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                            <span>Initial</span>
                                            <span>Li</span>
                                        </div>
                                    </th>
                                    <th style={{...tableHeaderStyle, width: '6%'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                            <span>Initial</span>
                                            <span>Si</span>
                                        </div>
                                    </th>
                                    <th style={{...tableHeaderStyle, width: '6%'}}>
                                        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                                            <span>Initial</span>
                                            <span>Risk</span>
                                        </div>
                                    </th>

                                    <th style={{...tableHeaderStyle, width: '26%'}}>Controls</th>
                                    <th style={{...tableHeaderStyle, width: '6%', height: '60px'}}>
                                        <span style={{...rotatedTextStyle}}>
                                            Residual<br/>Lr
                                        </span>
                                    </th>
                                    <th style={{...tableHeaderStyle, width: '6%', height: '60px'}}>
                                        <span style={{...rotatedTextStyle}}>
                                            Residual<br/>Sr
                                        </span>
                                    </th>
                                    <th style={{...tableHeaderStyle, width: '6%', height: '60px'}}>
                                        <span style={{...rotatedTextStyle}}>
                                            Residual<br/>Risk
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {riskCategory.hazards.filter(h => h.selected).map((hazard, index) => {
                                    const initialRisk = (hazard.initialLikelihood || 0) * (hazard.initialSeverity || 0);
                                    const residualRisk = (hazard.residualLikelihood || 0) * (hazard.residualSeverity || 0);
                                    return (
                                        <tr key={hazard.id}>
                                            <td style={{...cellStyle, textAlign: 'center'}}>{index + 1}</td>
                                            
                                            <td style={cellStyle}>{hazard.hazard}</td>
                                            <td style={cellStyle}>{hazard.who}</td>
                                            
                                            {/* Use flexbox for robust centering in PDF */}
                                            <td style={cellStyle}>
                                                <div style={{display: 'flex', justifyContent: 'center'}}>{hazard.initialLikelihood}</div>
                                            </td>
                                            <td style={cellStyle}>
                                                <div style={{display: 'flex', justifyContent: 'center'}}>{hazard.initialSeverity}</div>
                                            </td>
                                            {/* Apply flexbox centering to risk cells */}
                                            <td style={riskCell(initialRisk)}>
                                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>{initialRisk}</div>
                                            </td>
                                            <td style={cellStyle}>{hazard.controls}</td>
                                            <td style={cellStyle}>
                                                <div style={{display: 'flex', justifyContent: 'center'}}>{hazard.residualLikelihood}</div>
                                            </td>
                                            <td style={cellStyle}>
                                                <div style={{display: 'flex', justifyContent: 'center'}}>{hazard.residualSeverity}</div>
                                            </td>
                                            {/* Apply flexbox centering to risk cells */}
                                            <td style={riskCell(residualRisk)}>
                                                <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%'}}>{residualRisk}</div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
                {/* Force image size with a container */}
                <div style={{ width: '12cm', marginTop: '20px', marginLeft: 'auto', marginRight: 'auto' }}>
                    <img src={riskEvaluationMatrix} alt="Risk Evaluation Matrix" style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
            </Section>

            <Section title="5.0 Safety & Logistics">
                {safetyLogistics.map((item, index) => (
                    <div key={item.id} style={{ marginBottom: '15px' }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2c4f6b', fontSize: '14px', fontWeight: 'bold' }}>
                            5.{index + 1} {item.title}
                        </h4>
                        
                        {/* Display details for permits if provided */}
                        {item.id === 'permits' && data.permitsDetails && (
                            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0f8ff', borderLeft: '3px solid #2c4f6b' }}>
                                <p style={{ margin: 0, fontSize: '12px', fontStyle: 'italic', color: '#2c4f6b' }}>
                                    {data.permitsDetails}
                                </p>
                            </div>
                        )}
                        
                        {item.type === 'selectableList' && (
                            <ul style={{ 
                                margin: 0, 
                                paddingLeft: '25px', 
                                fontSize: '12px',
                                listStyleType: 'disc'
                            }}>
                                {item.items.filter(i => i.selected).map(i => (
                                    <li key={i.id} style={{ 
                                        marginBottom: '5px',
                                        lineHeight: '1.4'
                                    }}>
                                        {i.name}
                                    </li>
                                ))}
                            </ul>
                        )}
                        {(item.type === 'booleanWithText' || item.type === 'textArea') && (
                            <p style={{ margin: 0, fontSize: '12px', whiteSpace: 'pre-wrap' }}>{item.details}</p>
                        )}
                    </div>
                ))}
            </Section>

            <Section title="6.0 Equipment">
                <div style={{ fontSize: '12px' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c4f6b', fontSize: '14px', fontWeight: 'bold' }}>6.1 Personal Protective Equipment (PPE)</h4>
                        
                        {/* Display PPE details if provided */}
                        {data.ppeDetails && (
                            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#f0fff0', borderLeft: '3px solid #2c4f6b' }}>
                                <p style={{ margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#2c4f6b' }}>
                                    {data.ppeDetails}
                                </p>
                            </div>
                        )}
                        
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                            {ppe.filter(i => i.selected).map(i => <li key={i.id} style={{ marginBottom: '5px' }}>{i.name}</li>)}
                        </ul>
                    </div>

                    <div style={{ marginBottom: '30px' }}>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c4f6b', fontSize: '14px', fontWeight: 'bold' }}>6.2 Tools & Equipment</h4>
                        
                        {/* Display Tools details if provided */}
                        {data.toolsDetails && (
                            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#fff8f0', borderLeft: '3px solid #2c4f6b' }}>
                                <p style={{ margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#2c4f6b' }}>
                                    {data.toolsDetails}
                                </p>
                            </div>
                        )}
                        
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                            {tools.filter(i => i.selected).map(i => <li key={i.id} style={{ marginBottom: '5px' }}>{i.name}</li>)}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ margin: '0 0 10px 0', color: '#2c4f6b', fontSize: '14px', fontWeight: 'bold' }}>6.3 Materials</h4>
                        
                        {/* Display Materials details if provided */}
                        {data.materialsDetails && (
                            <div style={{ marginBottom: '10px', padding: '8px', backgroundColor: '#faf0ff', borderLeft: '3px solid #2c4f6b' }}>
                                <p style={{ margin: 0, fontSize: '11px', fontStyle: 'italic', color: '#2c4f6b' }}>
                                    {data.materialsDetails}
                                </p>
                            </div>
                        )}
                        
                        <ul style={{ margin: 0, paddingLeft: '20px', listStyleType: 'disc' }}>
                            {materials.filter(i => i.selected).map(i => <li key={i.id} style={{ marginBottom: '5px' }}>{i.name}</li>)}
                        </ul>
                    </div>
                </div>
            </Section>

            <Section title="7.0 Approval & Sign-Off">
                <p style={{ fontSize: '12px', fontStyle: 'italic' }}>
                    I confirm that I have read and understood the contents of this Risk Assessment and Method Statement. I agree to comply with all specified safety procedures and control measures.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', marginTop: '50px' }}>
                    <div>
                        <div style={{ borderBottom: '1px solid #333', height: '30px' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', fontWeight: 'bold' }}>Print Name</p>
                    </div>
                    <div>
                        <div style={{ borderBottom: '1px solid #333', height: '30px' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', fontWeight: 'bold' }}>Signature</p>
                    </div>
                    <div>
                        <div style={{ borderBottom: '1px solid #333', height: '30px' }}></div>
                        <p style={{ margin: '5px 0 0 0', fontSize: '10px', fontWeight: 'bold' }}>Date</p>
                    </div>
                </div>
            </Section>

            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 15mm;
                    }
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                    .no-page-break {
                        page-break-inside: avoid;
                    }
                    h1, h2, h3, h4 {
                        page-break-after: avoid;
                    }
                    table {
                        page-break-inside: avoid;
                    }
                    ul, ol {
                        page-break-inside: avoid;
                    }
                    li {
                        page-break-inside: avoid;
                    }
                }
            `}</style>
        </div>
    );
};

export default PrintableDocument;
