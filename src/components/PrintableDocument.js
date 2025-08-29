import React from 'react';
import uctelLogo from '../assets/uctel-logo.png';

const RiskMatrix = ({ title, likelihood, severity }) => {
    const likelihoodLabels = ["", "Very Unlikely", "Unlikely", "Possible", "Likely", "Very Likely"];
    const severityLabels = ["", "Insignificant", "Minor", "Moderate", "Major", "Catastrophic"];

    const getCellColor = (risk) => {
        if (risk >= 15) return '#ef4444';
        if (risk >= 8) return '#f97316';
        if (risk >= 4) return '#eab308';
        return '#22c55e';
    };
    
    const cellStyle = { border: '1px solid #ccc', width: '25px', height: '25px', textAlign: 'center', verticalAlign: 'middle', position: 'relative', fontSize: '10pt', color: 'white', fontWeight: 'bold' };
    const headerCellStyle = { fontWeight: 'bold', fontSize: '8pt', writingMode: 'vertical-rl', transform: 'rotate(180deg)', textAlign: 'center', padding: '0 2px' };
    const labelCellStyle = { fontWeight: 'bold', fontSize: '8pt', padding: '0 4px', textAlign: 'right' };

    return (
        <div style={{ flexShrink: 0 }}>
            <h4 style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '10pt', marginBottom: '4px' }}>{title}</h4>
            <table style={{ borderCollapse: 'collapse', direction: 'ltr' }}>
                <tbody>
                    <tr>
                        <td rowSpan="6" style={headerCellStyle}><span>Severity</span></td>
                    </tr>
                    {Array.from({ length: 5 }, (_, i) => 5 - i).map(sev => (
                        <tr key={sev}>
                            <td style={labelCellStyle}>{severityLabels[sev]}</td>
                            {Array.from({ length: 5 }, (_, j) => j + 1).map(lik => {
                                const isHighlighted = lik === likelihood && sev === severity;
                                return (
                                    <td key={lik} style={{ ...cellStyle, backgroundColor: getCellColor(lik * sev) }}>
                                        {isHighlighted ? 'X' : ''}
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    <tr>
                        <td style={{border: 'none'}}></td>
                        {Array.from({ length: 5 }, (_, i) => i + 1).map(lik => (
                            <td key={lik} style={{...labelCellStyle, transform: 'rotate(-45deg)', height: '50px', border: 'none' }}>{likelihoodLabels[lik]}</td>
                        ))}
                    </tr>
                     <tr>
                         <td colSpan="7" style={{ fontWeight: 'bold', textAlign: 'center', fontSize: '10pt', paddingTop: '4px', border: 'none' }}>Likelihood</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

const PrintableDocument = ({ data, allTasks }) => {
    const methodStatement = data.selectedTasks
        .filter(task => task.enabled)
        .map((task, index) => {
            const taskTitle = allTasks[task.taskId]?.title || 'Unknown Task';
            return `3.${index + 1} ${taskTitle}: ${task.description}`;
        })
        .join('\n\n');
        
    const styles = {
        page: { background: 'white', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '25mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontFamily: "'Inter', 'Helvetica', sans-serif", fontSize: '10pt', color: '#333', boxSizing: 'border-box', position: 'relative' },
        h1: { fontSize: '22pt', fontWeight: 'bold', color: '#2c4f6b', marginBottom: '20px' },
        h2: { fontSize: '14pt', fontWeight: 'bold', color: '#2c4f6b', marginTop: '25px', marginBottom: '15px', borderBottom: '2px solid #d88e43', paddingBottom: '8px', pageBreakAfter: 'avoid' },
        h3: { fontSize: '11pt', fontWeight: 'bold', color: '#008080', marginTop: '15px', marginBottom: '8px' },
        section: { marginBottom: '20px', pageBreakInside: 'avoid' },
        p: { marginBottom: '8px', lineHeight: '1.4' },
        pre: { whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '10pt', lineHeight: '1.5', margin: 0 },
        ul: { paddingLeft: '20px', listStyle: 'disc', fontSize: '10pt', margin: 0 },
        li: { marginBottom: '5px' },
        table: { width: '100%', borderCollapse: 'collapse', fontSize: '9pt', pageBreakInside: 'avoid' },
        th: { border: '1px solid #e2e8f0', padding: '8px', textAlign: 'left', backgroundColor: '#f1f5f9', fontWeight: 'bold', width: '30%' },
        td: { border: '1px solid #e2e8f0', padding: '8px', textAlign: 'left', verticalAlign: 'top' },
        riskAssessmentContainer: { display: 'flex', gap: '20px', marginTop: '15px', pageBreakInside: 'avoid', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' },
        riskDetails: { flexGrow: 1 },
        riskMatrixGroup: { display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' },
        pageHeader: { position: 'absolute', top: '0', left: '0', right: '0', padding: '15mm 25mm 0 25mm' },
        pageFooter: { position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0 25mm 15mm 25mm' },
        headerLine: { borderTop: '3px solid #008080', marginTop: '12px' },
        footerLine: { borderTop: '3px solid #008080', marginBottom: '8px' },
        footerText: { fontSize: '8pt', color: '#666', display: 'flex', justifyContent: 'space-between' },
        grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' },
        logisticsQuestion: { fontWeight: 'bold', marginBottom: '8px', fontSize: '10pt' },
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', options);
    };

    const logistics = {
        permits: data.safetyLogistics.find(c => c.id === 'permits'),
        waste: data.safetyLogistics.find(c => c.id === 'waste'),
        coshh: data.safetyLogistics.find(c => c.id === 'coshh'),
        thirdPartySafety: data.safetyLogistics.find(c => c.id === 'thirdPartySafety'),
        emergencyArrangements: data.safetyLogistics.find(c => c.id === 'emergencyArrangements'),
    };

    const selectedRisks = Object.values(data.risks).flatMap(r => r.hazards.filter(h => h.selected).map(h => ({...h, category: r.title})));
    const selectedPermits = (logistics.permits?.items || []).filter(p => p.selected && p.name.trim() !== '');
    const selectedPPE = data.ppe.filter(p => p.selected && p.name.trim() !== '');
    const selectedTools = data.tools.filter(t => t.selected && t.name.trim() !== '');
    const selectedMaterials = data.materials.filter(m => m.selected && m.name.trim() !== '');

    const renderTwoColumnList = (items) => {
        const midPoint = Math.ceil(items.length / 2);
        const col1 = items.slice(0, midPoint);
        const col2 = items.slice(midPoint);
        return (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                <ul style={styles.ul}>{col1.map(item => <li key={item.id}>{item.name}</li>)}</ul>
                <ul style={styles.ul}>{col2.map(item => <li key={item.id}>{item.name}</li>)}</ul>
            </div>
        );
    };

    return (
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <img src={uctelLogo} alt="UCtel Logo" style={{ height: '12mm' }} />
                <div style={styles.headerLine}></div>
            </div>
            
            <div style={{ paddingTop: '25mm', paddingBottom: '25mm' }}>
                <h1 style={styles.h1}>Risk Assessment & Method Statement</h1>

                <div style={styles.section}>
                    <h2 style={styles.h2}>1.0 Document Control</h2>
                    <div style={styles.grid2}>
                        <div>
                            <p><strong>Client:</strong> {data.client}</p>
                            <p><strong>Work Location:</strong> {data.siteAddress}</p>
                            <p><strong>Project:</strong> {data.projectDescription}</p>
                        </div>
                        <div>
                            <p><strong>Prepared By:</strong> {data.preparedBy}</p>
                            <p><strong>Email:</strong> {data.preparedByEmail}</p>
                            <p><strong>Telephone:</strong> {data.preparedByPhone}</p>
                            <p><strong>Commencement:</strong> {formatDate(data.commencementDate)}</p>
                            <p><strong>Completion:</strong> {formatDate(data.estimatedCompletionDate)}</p>
                        </div>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>2.0 Project Team</h2>
                    <table style={styles.table}>
                        <thead>
                            <tr>
                                <th style={{...styles.th, width: '40%'}}>Name</th>
                                <th style={{...styles.th, width: '30%'}}>Role</th>
                                <th style={{...styles.th, width: '30%'}}>Telephone</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.projectTeam.filter(m => m.name.trim() !== '').map((member, index) => (
                                <tr key={index}>
                                    <td style={styles.td}>{member.name}</td>
                                    <td style={styles.td}>{member.role}</td>
                                    <td style={styles.td}>{member.phone}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>3.0 Method Statement</h2>
                    <pre style={styles.pre}>{methodStatement}</pre>
                </div>
                
                <div style={{ ...styles.section, pageBreakBefore: 'always' }}>
                    <h2 style={styles.h2}>Risk Assessments</h2>
                     {selectedRisks.map((hazard, index) => (
                        <div key={index} style={{...styles.riskAssessmentContainer, marginBottom: '16px'}}>
                            <div style={styles.riskDetails}>
                                <table style={styles.table}>
                                    <tbody>
                                        <tr>
                                            <th style={styles.th}>Hazard</th>
                                            <td style={styles.td}><strong>{hazard.hazard}</strong> ({hazard.category})</td>
                                        </tr>
                                        <tr>
                                            <th style={styles.th}>Who/How Harmed</th>
                                            <td style={styles.td}>{hazard.who}</td>
                                        </tr>
                                        <tr>
                                            <th style={styles.th}>Controls</th>
                                            <td style={styles.td}>{hazard.controls}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style={styles.riskMatrixGroup}>
                                <RiskMatrix title="Initial" likelihood={hazard.initialLikelihood} severity={hazard.initialSeverity} />
                                <RiskMatrix title="Residual" likelihood={hazard.residualLikelihood} severity={hazard.residualSeverity} />
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{...styles.section, pageBreakBefore: 'always' }}>
                    <h2 style={styles.h2}>4.0 Permits Required</h2>
                    {renderTwoColumnList(selectedPermits)}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>5.0 Personal Protective Equipment (PPE)</h2>
                    {renderTwoColumnList(selectedPPE)}
                </div>

                 <div style={styles.section}>
                    <h2 style={styles.h2}>6.0 Plant / Equipment / Tools</h2>
                    {renderTwoColumnList(selectedTools)}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>7.0 Materials</h2>
                    {renderTwoColumnList(selectedMaterials)}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>8.0 Waste</h2>
                    <p style={styles.logisticsQuestion}>Will your work produce waste? <strong>{logistics.waste?.enabled ? 'YES' : 'NO'}</strong></p>
                    {logistics.waste?.enabled && <pre style={styles.pre}>{logistics.waste?.details}</pre>}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>9.0 COSHH</h2>
                    <p style={styles.logisticsQuestion}>Will you be bringing any materials or substances that are hazardous to health or the environment? <strong>{logistics.coshh?.enabled ? 'YES' : 'NO'}</strong></p>
                    <pre style={styles.pre}>{logistics.coshh?.details}</pre>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>10.0 Third-Party Safety</h2>
                    <p style={styles.logisticsQuestion}>What measures will be taken to ensure the safety of third parties (e.g. pedestrians, site visitors) during installation?</p>
                    <pre style={styles.pre}>{logistics.thirdPartySafety?.details}</pre>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>11.0 Emergency Arrangements</h2>
                    <p style={styles.logisticsQuestion}>What is the location of the nearest Accident & Emergency (A&E) department?</p>
                    <pre style={styles.pre}>{logistics.emergencyArrangements?.details}</pre>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>12.0 Approval & Sign-Off</h2>
                    <p style={styles.p}>This Risk Assessment and Method Statement (RAMS) has been reviewed and approved by the undersigned. By signing below, each party confirms that:</p>
                     <ul style={{...styles.ul, paddingLeft: '30px'}}>
                        <li>The contents of this RAMS have been read and understood.</li>
                        <li>All works will be carried out in accordance with the method statement and control measures detailed herein.</li>
                        <li>This document will be reviewed and updated if the scope of work or site conditions change.</li>
                     </ul>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '40px', marginTop: '60px' }}>
                        <div style={{borderBottom: '1px solid #333', paddingBottom: '8px'}}><p>Name:</p></div>
                        <div style={{borderBottom: '1px solid #333', paddingBottom: '8px'}}><p>Signature:</p></div>
                        <div style={{borderBottom: '1px solid #333', paddingBottom: '8px'}}><p>Date:</p></div>
                     </div>
                </div>
            </div>
            
            <div style={styles.pageFooter}>
                <div style={styles.footerLine}></div>
                <div style={styles.footerText}>
                    <span>RAMS for {data.client}</span>
                    <span>Page 1 of 1</span>
                </div>
            </div>
        </div>
    );
};

export default PrintableDocument;