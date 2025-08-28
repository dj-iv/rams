import React, { useState, useEffect, useCallback } from 'react';
import uctelLogo from './assets/uctel-logo.png';

// NOTE: In a real-world scenario, Firebase would be initialized in a separate config file.
// For this self-contained component, we'll simulate the necessary imports.
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
// import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// ASSETS & STATIC DATA (MODULAR METHOD STATEMENT)
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const STANDARD_TASKS = {
  1: {
    title: "Site Induction",
    options: {
      construction: { name: "Construction Site", description: "All UCtel personnel will complete the site induction prior to commencing any works. This will ensure that staff are fully briefed on site-specific risks, emergency procedures, welfare provisions, and health and safety requirements." },
      office: { name: "Standard Office", description: "All UCtel staff will be briefed on the site's emergency procedures and specific requirements prior to commencing any work." },
    }
  },
  2: {
    title: "Donor Antenna Installation",
    options: {
      standOnRoof: { name: "Stand on roof", description: "A free-standing, non-penetrative pole mount will be installed on the roof to accommodate the donor antenna(s). The location will be selected for optimal line-of-sight with nearby cell towers." },
      poleOnWall: { name: "Pole on wall", description: "A galvanised steel bracket will be securely fixed to the external wall of the building. A mounting pole will be fitted to the bracket to accommodate the donor antenna(s)." },
      existingPole: { name: "Existing pole", description: "The donor antenna(s) will be securely fitted to the existing pole/mast designated by the client." },
      ceilingVoid: { name: "Internal (Ceiling Void)", description: "The donor antenna will be mounted internally within the ceiling void, positioned for the best possible signal reception from outside."}
    }
  },
  3: {
    title: "Network Unit (NU) Installation",
    options: {
      wallMount: { name: "Wall mount", description: "The Network Unit(s) will be securely mounted on a wall within the designated riser or comms room using appropriate wall plugs and screws." },
      rackMount: { name: "Rack mount", description: "The Network Unit(s) will be installed in the designated comms room rack, ensuring adequate ventilation." },
    }
  },
  4: {
    title: "DAS Installation",
    options: {
      default: { name: "Default", description: "A Distributed Antenna System (DAS) will be deployed to provide improved in-building coverage. OMNI server antennas will be connected to the NUs via a structured network of RF splitters and LMR400 coaxial cable. Antennas will be strategically positioned to ensure consistent signal distribution." }
    }
  },
  5: {
    title: "System Commissioning",
    options: {
      default: { name: "Default", description: "Upon completion of the physical installation, UCtel engineers will configure and commission the system using the CEL-FI WAVE app and approved testing tools. System adjustments will be undertaken as required to achieve optimal coverage and performance." }
    }
  },
  6: {
    title: "Client Handover",
    options: {
      default: { name: "Default", description: "Following successful commissioning, UCtel will provide the client with a formal 'As-Built' document. This will include photographic records of the installation, post-installation signal readings, and confirmation of system performance." }
    }
  },
  7: {
    title: "Hub Installation",
    options: {
        default: { name: "Default", description: "The QUATRA Hub unit will be installed in the main comms room. It will be connected to the Network Units via CAT 6 cabling and powered from a dedicated power source." }
    }
  },
  8: {
    title: "CAT 6 Cabling",
    options: {
        default: { name: "Default", description: "Certified CAT 6a cabling will be routed from the Hub to each Network Unit location. Cables will be run within existing containment where possible, tested, and clearly labelled at both ends." }
    }
  },
  9: {
    title: "Post Installation Survey",
    options: {
      default: { name: "Default", description: "A comprehensive post-installation survey will be conducted to measure and document the signal strength (RSRP) and quality (SINR) across all covered areas, ensuring the system meets the agreed performance criteria." }
    }
  },
};

const JOB_TEMPLATES = {
  "G41": {
    name: "CEL-FI G41 Installation",
    description: "Mobile Signal Booster Installation - CEL-FI G41.",
    taskIds: [1, 2, 3, 4, 5, 6, 9]
  },
  "G43": {
    name: "CEL-FI G43 Installation",
    description: "Mobile Signal Booster Installation - CEL-FI GO G43.",
    taskIds: [1, 2, 3, 4, 5, 6, 9]
  },
  "QUATRA": {
    name: "CEL-FI QUATRA Installation",
    description: "Enterprise In-Building Cellular Coverage - CEL-FI QUATRA.",
    taskIds: [1, 2, 3, 7, 8, 4, 5, 6, 9]
  },
  "NetworkCabling": {
    name: "Structured Network Cabling",
    description: "Structured network cabling installation.",
    taskIds: [1, 8, 6] // Example tasks
  }
};


const RISK_ASSESSMENTS = {
  workAtHeight: {
    title: "Work at Height",
    hazards: [
      { id: 1, hazard: "Falling from height", who: "Workers can suffer serious injury or death.", controls: "Use of fall protection equipment (harnesses, lanyards). Ladders inspected before use. Adherence to site safety procedures for roof access. Supervision and trained personnel only.", initialLikelihood: 4, initialSeverity: 5, residualLikelihood: 1, residualSeverity: 5, selected: true },
      { id: 2, hazard: "Falling objects", who: "Workers or passersby could be injured.", controls: "Use of tool lanyards, controlled access areas below work zone, securing of materials and tools.", initialLikelihood: 3, initialSeverity: 4, residualLikelihood: 2, residualSeverity: 3, selected: true },
      { id: 3, hazard: "Slipping or tripping at height", who: "Workers can slip or trip due to uneven surfaces, wet floors, or improper footwear, leading to falls.", controls: "Ensure all surfaces are clear and dry. Regular inspections of work areas. Appropriate footwear worn.", initialLikelihood: 3, initialSeverity: 5, residualLikelihood: 2, residualSeverity: 4, selected: false },
      { id: 4, hazard: "Equipment failure", who: "Ladders or safety harnesses may fail, leading to falls or serious injuries.", controls: "Regular inspection and maintenance of all equipment. Use of certified equipment only (e.g., EN131 ladders).", initialLikelihood: 2, initialSeverity: 5, residualLikelihood: 1, residualSeverity: 5, selected: false },
    ]
  },
  manualHandling: {
    title: "Manual Handling",
    hazards: [
      { id: 1, hazard: "Incorrect Lifting", who: "All Staff - Risk of back/musculoskeletal injuries.", controls: "Manual Handling Procedures and Training provided. Use of mechanical aids where possible.", initialLikelihood: 4, initialSeverity: 4, residualLikelihood: 2, residualSeverity: 3, selected: true },
      { id: 2, hazard: "Heavy/Awkward Loads", who: "Employees risk back injuries, muscle strains when handling equipment like antennas and cable drums.", controls: "Training on proper lifting techniques, two-person lifts for heavy items, use of lifting aids like trolleys.", initialLikelihood: 4, initialSeverity: 4, residualLikelihood: 2, residualSeverity: 4, selected: true },
      { id: 3, hazard: "Trips and Slips", who: "All Staff - Risk of injury due to trips and slips from trailing cables or packaging materials.", controls: "Aisles and Gangways Kept Clear For Good Housekeeping. Tidy work area maintained at all times.", initialLikelihood: 3, initialSeverity: 3, residualLikelihood: 2, residualSeverity: 2, selected: false },
    ]
  },
  toolsAndEquipment: {
      title: "Use of Tools & Equipment",
      hazards: [
          { id: 1, hazard: "Hand Tools (HAVS)", who: "Operatives using hand tools (drills, crimpers). Risk of Hand-Arm Vibration Syndrome.", controls: "Use of well-maintained, low-vibration tools. Job rotation and regular breaks. Correct training provided.", initialLikelihood: 3, initialSeverity: 3, residualLikelihood: 1, residualSeverity: 3, selected: true},
          { id: 2, hazard: "Power Tools (110V)", who: "Operatives using drills. Risk of electric shock, injury from moving parts.", controls: "All tools are 110V and PAT tested. RCD protection used. Visual inspection before use. Only trained operatives to use tools.", initialLikelihood: 3, initialSeverity: 4, residualLikelihood: 1, residualSeverity: 4, selected: true},
          { id: 3, hazard: "Dust Exposure (Drilling)", who: "Operatives and others nearby. Risk of respiratory irritation.", controls: "Use of M-Class vacuum for dust extraction during drilling. FFP3 masks to be worn by operatives.", initialLikelihood: 3, initialSeverity: 2, residualLikelihood: 1, residualSeverity: 2, selected: false},
          { id: 4, hazard: "Noise Exposure (Drilling)", who: "Operatives and others nearby. Risk of hearing damage.", controls: "Hearing protection (ear defenders/plugs) to be worn. Work carried out during agreed hours.", initialLikelihood: 2, initialSeverity: 3, residualLikelihood: 1, residualSeverity: 2, selected: false},
      ]
  }
};

const DEFAULT_PPE = [
    { id: 1, name: "High Visibility Jacket or Vest - Conforming to BS EN ISO 20471", selected: true },
    { id: 2, name: "Safety Boots - Conforming to BS EN ISO 20345", selected: true },
    { id: 3, name: "Cut-Resistant Gloves - Level 5, conforming to BS EN 388:2016 + A1:2018", selected: true },
    { id: 4, name: "Safety Goggles/Glasses - Conforming to BS EN 166", selected: true },
    { id: 5, name: "Safety Helmet - Conforming to BS EN 397", selected: false },
    { id: 6, name: "FFP Respiratory Mask with P3 Filters - Conforming to BS EN 149", selected: false },
];

const DEFAULT_TOOLS = [
    { id: 1, name: "Ladders (EN131 certified)", selected: true },
    { id: 2, name: "Hand Tools (general tool kit including spanners, pliers, hammers, etc.)", selected: true },
    { id: 3, name: "Battery Drill / Driver", selected: true },
    { id: 4, name: "Crimping Tools (RF & electrical connectors)", selected: true },
    { id: 5, name: "Cable Joints & Termination Tools", selected: true },
    { id: 6, name: "Network Analyser / RF Spectrum Analyser (e.g., Siretta Spectrum Analyser)", selected: false },
    { id: 7, name: "Power Tools (110V Compliant, site-safe)", selected: false },
    { id: 8, name: "Fall Arrest Equipment (Harnesses, Lanyards, Anchors)", selected: false },
    { id: 9, name: "Label Printer (for cables and equipment labelling)", selected: false },
    { id: 10, name: "Mobile Phones (for test apps)", selected: true },
    { id: 11, name: "Stud Finder (for safe drilling)", selected: false },
    { id: 12, name: "Torque Wrench (for secure antenna mounting fixings)", selected: false },
    { id: 13, name: "Vacuum Cleaner (M-Class rated, dust control)", selected: false },
    { id: 14, name: "Work Lights (low-voltage / Battery LED)", selected: true },
];

const DEFAULT_MATERIALS = [
    { id: 1, name: "CEL-FI Hardware", selected: true },
    { id: 2, name: "Donor Antennas (for signal capture)", selected: true },
    { id: 3, name: "Indoor OMNI Antenna (for distribution of signal)", selected: true },
    { id: 4, name: "LMR400 Coaxial Cable (for DAS connections)", selected: true },
    { id: 5, name: "Mounting Pole and Bracket (External)", selected: true },
    { id: 6, name: "Cable Ties / Clips (for securing and managing coaxial and power cabling)", selected: true },
    { id: 7, name: "Weatherproof Tape and Coaxial Sealant (for sealing external connectors)", selected: true },
];

const DEFAULT_PERMITS = [
    { id: 1, name: "Working at Height Permit", selected: true },
    { id: 2, name: "Power Tools Permit", selected: true },
    { id: 3, name: "Hand Tools (HAVS) Permit", selected: false },
    { id: 4, name: "Manual Handling Permit", selected: false },
    { id: 5, name: "Dust Exposure (Drilling Activities) Permit", selected: false },
    { id: 6, name: "Noise Exposure (Drilling Activities) Permit", selected: false },
];

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Helper Functions
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
const compileMethodStatement = (selectedTasks) => {
    let statement = "";
    let step = 1;
    selectedTasks.forEach(task => {
        if (task.enabled) {
            const taskInfo = STANDARD_TASKS[task.taskId];
            const optionInfo = taskInfo.options[task.selectedOption];
            statement += `3.${step} ${taskInfo.title}: ${optionInfo.description}\n\n`;
            step++;
        }
    });
    return statement.trim();
};

const initializeSelectedTasks = (templateKey) => {
    const taskIds = JOB_TEMPLATES[templateKey].taskIds;
    return taskIds.map(id => ({
        taskId: id,
        selectedOption: Object.keys(STANDARD_TASKS[id].options)[0], // Default to first option
        enabled: true,
    }));
};

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Main Application Component
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
export default function App() {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Firebase Setup State (Simulated for this environment)
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const [db, setDb] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [savedRAMS, setSavedRAMS] = useState([]);
  
  useEffect(() => {
    // This effect simulates Firebase initialization.
    console.log("Simulating Firebase setup...");
    const mockAuth = {
        onAuthStateChanged: (callback) => {
            const mockUser = { uid: 'test-user-123' };
            callback(mockUser);
            setUserId(mockUser.uid);
            setIsAuthReady(true);
            console.log("Firebase Auth state ready.");
        }
    };
    mockAuth.onAuthStateChanged(() => {});
  }, []);

  useEffect(() => {
    // This effect simulates fetching data from Firestore.
    if (isAuthReady && userId) {
      console.log(`Fetching RAMS documents for user: ${userId}`);
    }
  }, [isAuthReady, userId]);

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Application State
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(() => {
    const initialTemplate = 'G43';
    const initialTasks = initializeSelectedTasks(initialTemplate);
    return {
        // Step 1: Project Details
        client: 'iQ Student Accommodation',
        siteAddress: '120 Longwood Close, Coventry',
        projectDescription: JOB_TEMPLATES[initialTemplate].description,
        commencementDate: '2025-09-01',
        estimatedCompletionDate: '2025-09-05',
        preparedBy: 'James Smith',
        preparedByEmail: 'james.smith@uctel.co.uk',
        preparedByPhone: '+44 7730 890403',
        
        // Step 2: Project Team
        projectTeam: [
            { id: 1, name: 'James Smith', role: 'Project Coordinator', phone: '+44 7730 890403'},
            { id: 2, name: '', role: '', phone: ''},
        ],

        // Step 3: Job & Method
        jobTemplate: initialTemplate,
        selectedTasks: initialTasks,
        methodStatement: compileMethodStatement(initialTasks),
        
        // Step 4: Risks
        risks: JSON.parse(JSON.stringify(RISK_ASSESSMENTS)), // Deep copy

        // Step 5: Safety & Logistics
        permits: JSON.parse(JSON.stringify(DEFAULT_PERMITS)),
        ppe: JSON.parse(JSON.stringify(DEFAULT_PPE)),
        producesWaste: true,
        wasteDisposalPlan: 'Where possible, all waste materials generated during UCtel works will be disposed of using the bins provided by the client on-site. UCtel will segregate waste where practicable and ensure disposal is in accordance with site procedures and relevant environmental legislation.',
        hasHazardousSubstances: false,
        coshhDetails: 'UCtel does not anticipate the use of any hazardous materials or substances during the works. All cabling materials and consumables utilised on-site are classified as non-hazardous. Should hazardous substances be introduced in future scope variations, appropriate COSHH assessments will be undertaken and communicated to all personnel prior to use.',
        thirdPartySafety: `UCtel will utilise clear warning signage ("Work in Progress", "Keep Clear") to notify of active work areas.\nAll UCtel operatives will wear high-visibility PPE to ensure they are easily identifiable at all times.\nTools, cabling and equipment will be kept tidy and secured to prevent obstruction of pedestrian routes or fire exits.\nWork areas will be cordoned off where appropriate to minimise the risk of unauthorised access.`,
        emergencyArrangements: `The nearest A&E is located at University Hospital Coventry and Warwickshire (UHCW) - Clifford Bridge Road, Coventry, CV2 2DX.\nAll UCtel staff will familiarise themselves with the site's emergency evacuation procedures during induction.\nFirst Aid provision will be in line with site arrangements, with UCtel supervisors ensuring operatives are aware of first aid points and trained first aiders.`,
        
        // Step 6: Equipment & Materials
        tools: JSON.parse(JSON.stringify(DEFAULT_TOOLS)),
        materials: JSON.parse(JSON.stringify(DEFAULT_MATERIALS)),
    };
  });

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Handler Functions
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  
  const updateFormData = useCallback((newPartialData) => {
    setFormData(prev => ({ ...prev, ...newPartialData }));
  }, []);
  
  const updateAndCompileTasks = useCallback((newTasks) => {
      setFormData(prev => ({
          ...prev,
          selectedTasks: newTasks,
          methodStatement: compileMethodStatement(newTasks)
      }));
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateFormData({ [name]: type === 'checkbox' ? checked : value });
  };
  
  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  const handleTemplateChange = (e) => {
    const templateKey = e.target.value;
    if (JOB_TEMPLATES[templateKey]) {
      const newTasks = initializeSelectedTasks(templateKey);
      setFormData(prev => ({
          ...prev,
          jobTemplate: templateKey,
          projectDescription: JOB_TEMPLATES[templateKey].description,
          selectedTasks: newTasks,
          methodStatement: compileMethodStatement(newTasks)
      }));
    }
  };
  
  const handleTaskToggle = (taskId) => {
      const newTasks = formData.selectedTasks.map(task => 
          task.taskId === taskId ? { ...task, enabled: !task.enabled } : task
      );
      updateAndCompileTasks(newTasks);
  };
  
  const handleTaskOptionChange = (taskId, newOption) => {
      const newTasks = formData.selectedTasks.map(task => 
          task.taskId === taskId ? { ...task, selectedOption: newOption } : task
      );
      updateAndCompileTasks(newTasks);
  };

  const handleRiskToggle = (riskKey, hazardId) => {
    setFormData(prev => {
      const newRisks = { ...prev.risks };
      const hazard = newRisks[riskKey].hazards.find(h => h.id === hazardId);
      if (hazard) { hazard.selected = !hazard.selected; }
      return { ...prev, risks: newRisks };
    });
  };

  const handleSelectableListToggle = (listName, itemId) => {
      setFormData(prev => {
          const newList = prev[listName].map(item => 
              item.id === itemId ? { ...item, selected: !item.selected } : item
          );
          return { ...prev, [listName]: newList };
      });
  };

  const handleCustomItemChange = (listName, index, value) => {
    setFormData(prev => {
        const newList = [...prev[listName]];
        newList[index] = {...newList[index], name: value};
        return {...prev, [listName]: newList};
    });
  };

  const addCustomItem = (listName) => {
      setFormData(prev => {
          const newList = [...prev[listName]];
          const newId = 'custom-' + Date.now();
          newList.push({id: newId, name: "", selected: true, isCustom: true });
          return { ...prev, [listName]: newList };
      });
  };

  const removeCustomItem = (listName, id) => {
      setFormData(prev => ({
          ...prev,
          [listName]: prev[listName].filter(item => item.id !== id)
      }));
  };
  
  const handleProjectTeamChange = (index, field, value) => {
      setFormData(prev => {
          const newTeam = [...prev.projectTeam];
          newTeam[index][field] = value;
          return {...prev, projectTeam: newTeam};
      });
  };

  const addTeamMember = () => {
      setFormData(prev => ({
          ...prev,
          projectTeam: [...prev.projectTeam, { id: Date.now(), name: '', role: '', phone: '' }]
      }));
  };

  const removeTeamMember = (index) => {
      setFormData(prev => ({
          ...prev,
          projectTeam: prev.projectTeam.filter((_, i) => i !== index)
      }));
  };

  const TOTAL_STEPS = 7;
  const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Render Logic
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={formData} handler={handleInputChange} />;
      case 2: return <Step2 data={formData} onChange={handleProjectTeamChange} onAdd={addTeamMember} onRemove={removeTeamMember} />;
      case 3: return <Step3 data={formData} handlers={{handleTemplateChange, handleTaskToggle, handleTaskOptionChange, handleTextAreaChange}} />;
      case 4: return <Step4 data={formData} handler={handleRiskToggle} />;
      case 5: return <Step5 data={formData} onToggle={handleSelectableListToggle} onInputChange={handleInputChange} onTextAreaChange={handleTextAreaChange} />;
      case 6: return <Step6 data={formData} onToggle={handleSelectableListToggle} onCustomChange={handleCustomItemChange} onAddCustom={addCustomItem} onRemoveCustom={removeCustomItem} />;
      case 7: return <Step7 previewHandler={() => setShowPreview(true)} />;
      default: return <Step1 data={formData} handler={handleInputChange} />;
    }
  };

  const progressLabels = ["Project", "Team", "Method", "Risks", "Safety", "Equipment", "Generate"];

  return (
    <>
      <div className="bg-slate-100 font-sans text-slate-800 min-h-screen" style={{'--uctel-orange': '#d88e43', '--uctel-teal': '#008080', '--uctel-blue': '#2c4f6b'}}>
        <div className="container mx-auto p-4 md:p-8">
          <header className="text-center mb-8 flex flex-col items-center">
             <img src={uctelLogo} alt="UCtel Logo" className="h-12 mb-4" />
            <h1 className="text-4xl font-bold text-[var(--uctel-blue)]">RAMS Generator</h1>
            <p className="text-slate-600 mt-2">A step-by-step wizard to create your Risk Assessment and Method Statements.</p>
          </header>
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2 text-xs sm:text-sm">
                    {progressLabels.map((label, index) => (
                       <span key={label} className={`font-bold ${step >= index + 1 ? 'text-[var(--uctel-blue)]' : 'text-slate-400'}`}>{label}</span>
                    ))}
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-[var(--uctel-teal)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}></div>
                </div>
            </div>

            {renderStep()}
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
              <button onClick={prevStep} disabled={step === 1} className="bg-slate-200 text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
              {step < TOTAL_STEPS ? (
                <button onClick={nextStep} className="bg-[var(--uctel-blue)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Next Step &rarr;</button>
              ) : (
                <button onClick={() => setShowPreview(true)} className="bg-[var(--uctel-teal)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Preview Document</button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {showPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-start p-4 md:p-8 overflow-y-auto z-50" onClick={() => setShowPreview(false)}>
              <div className="relative" onClick={(e) => e.stopPropagation()}>
                   <button onClick={() => setShowPreview(false)} className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-lg hover:bg-slate-200 z-10">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                   </button>
                  <PrintableDocument data={formData} />
              </div>
          </div>
      )}
    </>
  );
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// UI Components (Shared)
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const FormSection = ({ title, children, gridCols = 2 }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">{title}</h2>
    <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange, type = 'text', gridSpan = 1 }) => (
  <div className={`flex flex-col md:col-span-${gridSpan}`}>
    <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={onChange} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition" />
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 8, gridSpan = 2 }) => (
    <div className={`flex flex-col md:col-span-${gridSpan}`}>
        <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition w-full"></textarea>
    </div>
);

const SelectableList = ({ title, items, listName, onToggle, onCustomChange, onAddCustom, onRemoveCustom }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
        <h3 className="text-xl font-bold mb-4 text-slate-800">{title}</h3>
        <div className="space-y-3">
            {items.filter(item => !item.isCustom).map(item => (
                <label key={item.id} className="flex items-center gap-3 p-3 border rounded-md bg-white cursor-pointer hover:border-[var(--uctel-blue)] has-[:checked]:bg-teal-50 has-[:checked]:border-[var(--uctel-teal)] transition-colors">
                    <input type="checkbox" checked={item.selected} onChange={() => onToggle(listName, item.id)} className="h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" />
                    <span className="flex-1 text-sm">{item.name}</span>
                </label>
            ))}
            {items.filter(item => item.isCustom).map((item, index) => (
                <div key={item.id} className="flex items-center gap-2 p-3 border rounded-md bg-white border-[var(--uctel-teal)]">
                    <input type="checkbox" checked={item.selected} onChange={() => onToggle(listName, item.id)} className="h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" />
                    <input 
                        type="text" 
                        value={item.name} 
                        onChange={(e) => onCustomChange(listName, items.findIndex(i => i.id === item.id), e.target.value)}
                        className="flex-grow p-2 border border-slate-300 rounded-md"
                        placeholder="Enter custom item..."
                    />
                    <button onClick={() => onRemoveCustom(listName, item.id)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            ))}
        </div>
        <button onClick={() => onAddCustom(listName)} className="mt-4 bg-blue-100 text-[var(--uctel-blue)] font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm">
            + Add Custom Item
        </button>
    </div>
);


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Wizard Step Components
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

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
    </FormSection>
  </div>
);

const Step2 = ({ data, onChange, onAdd, onRemove }) => (
    <div>
        <FormSection title="Step 2: Project Team" gridCols={1}>
            <p className="text-slate-600 md:col-span-1 -mt-4 mb-2">List the key personnel involved in this project.</p>
            <div className="space-y-4">
                {data.projectTeam.map((member, index) => (
                    <div key={member.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border rounded-lg bg-slate-50 relative">
                        <div className="md:col-span-3">
                            <label className="text-sm font-semibold text-slate-600">Name</label>
                            <input type="text" value={member.name} onChange={(e) => onChange(index, 'name', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-slate-600">Role</label>
                            <input type="text" value={member.role} onChange={(e) => onChange(index, 'role', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                        </div>
                        <div className="md:col-span-3">
                            <label className="text-sm font-semibold text-slate-600">Telephone</label>
                            <input type="text" value={member.phone} onChange={(e) => onChange(index, 'phone', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" />
                        </div>
                        {data.projectTeam.length > 1 && (
                            <button onClick={() => onRemove(index)} className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">&times;</button>
                        )}
                    </div>
                ))}
            </div>
             <button onClick={onAdd} className="mt-4 bg-blue-100 text-[var(--uctel-blue)] font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm">
                + Add Team Member
            </button>
        </FormSection>
    </div>
);


const Step3 = ({ data, handlers }) => {
    const { handleTemplateChange, handleTaskToggle, handleTaskOptionChange, handleTextAreaChange } = handlers;
    
    return (
        <div>
            <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 3: Build Method Statement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col md:col-span-2">
                    <label htmlFor="jobTemplate" className="mb-2 font-semibold text-slate-700">1. Select Job Template</label>
                    <select id="jobTemplate" name="jobTemplate" value={data.jobTemplate} onChange={handleTemplateChange} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition">
                        {Object.keys(JOB_TEMPLATES).map(key => (
                            <option key={key} value={key}>{JOB_TEMPLATES[key].name}</option>
                        ))}
                    </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="mb-2 font-semibold text-slate-700 block">2. Configure Standard Tasks</label>
                  <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      {data.selectedTasks.map((task, index) => {
                          const taskInfo = STANDARD_TASKS[task.taskId];
                          const optionKeys = Object.keys(taskInfo.options);
                          return (
                              <div key={task.taskId} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3 bg-white rounded-md border">
                                  <label className="flex items-center gap-3 font-semibold flex-shrink-0 cursor-pointer">
                                      <input type="checkbox" checked={task.enabled} onChange={() => handleTaskToggle(task.taskId)} className="h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" />
                                      <span>{`Step ${index + 1}: ${taskInfo.title}`}</span>
                                  </label>
                                  {task.enabled && optionKeys.length > 1 && (
                                      <select value={task.selectedOption} onChange={(e) => handleTaskOptionChange(task.taskId, e.target.value)} className="p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--uctel-blue)] transition w-full sm:w-auto text-sm">
                                          {optionKeys.map(key => (
                                              <option key={key} value={key}>{taskInfo.options[key].name}</option>
                                          ))}
                                      </select>
                                  )}
                              </div>
                          );
                      })}
                  </div>
                </div>

                <div className="flex flex-col md:col-span-2">
                   <TextArea label="3. Review and Edit Compiled Method Statement" name="methodStatement" value={data.methodStatement} onChange={handleTextAreaChange} rows={15} />
                </div>
            </div>
        </div>
    );
};

const Step4 = ({ data, handler }) => (
  <div>
    <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 4: Identify Risks</h2>
    <p className="mb-6 text-slate-600">Select the hazards that are relevant to this project. This will include them in the final document.</p>
    {Object.keys(data.risks).map(riskKey => {
      const risk = data.risks[riskKey];
      return (
        <div key={riskKey} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
          <h3 className="text-xl font-bold mb-4 text-slate-800">{risk.title}</h3>
          <div className="space-y-3">
            {risk.hazards.map(hazard => (
              <label key={hazard.id} className="flex items-start gap-4 p-4 border rounded-md bg-white cursor-pointer hover:border-[var(--uctel-blue)] has-[:checked]:bg-teal-50 has-[:checked]:border-[var(--uctel-teal)] transition-colors">
                <input type="checkbox" checked={hazard.selected} onChange={() => handler(riskKey, hazard.id)} className="mt-1 h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" />
                <div className="flex-1">
                  <p className="font-semibold">{hazard.hazard}</p>
                  <p className="text-sm text-slate-600 mt-1"><strong className="font-semibold text-slate-700">Who/How:</strong> {hazard.who}</p>
                  <p className="text-sm text-slate-600 mt-1"><strong className="font-semibold text-slate-700">Controls:</strong> {hazard.controls}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const Step5 = ({ data, onToggle, onInputChange, onTextAreaChange }) => (
    <div>
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 5: Safety & Logistics</h2>
        <div className="space-y-8">
            <SelectableList title="Permits Required" items={data.permits} listName="permits" onToggle={onToggle} />

            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
                <h3 className="text-xl font-bold mb-4 text-slate-800">Waste Management</h3>
                <div className="flex items-center gap-6 mb-4">
                    <p>Will your work produce waste?</p>
                    <label className="flex items-center gap-2"><input type="radio" name="producesWaste" value={true} checked={data.producesWaste} onChange={() => onInputChange({ target: { name: 'producesWaste', value: true }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> Yes</label>
                    <label className="flex items-center gap-2"><input type="radio" name="producesWaste" value={false} checked={!data.producesWaste} onChange={() => onInputChange({ target: { name: 'producesWaste', value: false }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> No</label>
                </div>
                {data.producesWaste && <TextArea label="Waste Disposal Plan" name="wasteDisposalPlan" value={data.wasteDisposalPlan} onChange={onTextAreaChange} rows={3} />}
            </div>
            
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2">
                <h3 className="text-xl font-bold mb-4 text-slate-800">COSHH (Control of Substances Hazardous to Health)</h3>
                <div className="flex items-center gap-6 mb-4">
                    <p>Will you use hazardous substances?</p>
                    <label className="flex items-center gap-2"><input type="radio" name="hasHazardousSubstances" value={true} checked={data.hasHazardousSubstances} onChange={() => onInputChange({ target: { name: 'hasHazardousSubstances', value: true }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> Yes</label>
                    <label className="flex items-center gap-2"><input type="radio" name="hasHazardousSubstances" value={false} checked={!data.hasHazardousSubstances} onChange={() => onInputChange({ target: { name: 'hasHazardousSubstances', value: false }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> No</label>
                </div>
                <TextArea label="Details" name="coshhDetails" value={data.coshhDetails} onChange={onTextAreaChange} rows={4} />
            </div>
            
            <div className="grid grid-cols-1 gap-6">
               <TextArea label="Third-Party Safety Measures" name="thirdPartySafety" value={data.thirdPartySafety} onChange={onTextAreaChange} rows={4} />
               <TextArea label="Emergency Arrangements" name="emergencyArrangements" value={data.emergencyArrangements} onChange={onTextAreaChange} rows={4} />
            </div>
        </div>
    </div>
);


const Step6 = ({ data, onToggle, onCustomChange, onAddCustom, onRemoveCustom }) => (
    <div>
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 6: Equipment & Materials</h2>
        <p className="mb-6 text-slate-600">Select the Personal Protective Equipment (PPE), tools, and materials for this job. You can also add custom items.</p>
        <div className="space-y-6">
            <SelectableList title="Personal Protective Equipment (PPE)" listName="ppe" items={data.ppe} onToggle={onToggle} onCustomChange={onCustomChange} onAddCustom={onAddCustom} onRemoveCustom={onRemoveCustom} />
            <SelectableList title="Plant / Equipment / Tools" listName="tools" items={data.tools} onToggle={onToggle} onCustomChange={onCustomChange} onAddCustom={onAddCustom} onRemoveCustom={onRemoveCustom} />
            <SelectableList title="Materials" listName="materials" items={data.materials} onToggle={onToggle} onCustomChange={onCustomChange} onAddCustom={onAddCustom} onRemoveCustom={onRemoveCustom} />
        </div>
    </div>
);


const Step7 = ({ previewHandler }) => (
    <div>
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 7: Review & Generate</h2>
        <div className="p-6 bg-slate-50 rounded-lg text-center">
            <h3 className="text-xl font-semibold mb-4 text-slate-800">You are ready to preview your document.</h3>
            <p className="text-slate-600 mb-6">Click the button below to see a full-page preview of your RAMS document. You can make changes by going back to previous steps.</p>
            <button onClick={previewHandler} className="bg-[var(--uctel-teal)] text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105">
                Preview Document
            </button>
        </div>
    </div>
);

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Risk Matrix Component (for Printable Document)
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
const RiskMatrix = ({ title, likelihood, severity }) => {
    const likelihoodLabels = ["", "Very Unlikely", "Unlikely", "Possible", "Likely", "Very Likely"];
    const severityLabels = ["", "Insignificant", "Minor", "Moderate", "Major", "Catastrophic"];

    const getCellColor = (risk) => {
        if (risk >= 15) return '#ef4444'; // Red
        if (risk >= 8) return '#f97316'; // Orange
        if (risk >= 4) return '#eab308'; // Yellow
        return '#22c55e'; // Green
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


// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Printable Document Component
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
const PrintableDocument = ({ data }) => {
    // These styles will be applied directly, removing the need for an external CSS file.
    const styles = {
        page: { background: 'white', width: '210mm', minHeight: '297mm', margin: '0 auto', padding: '25mm', boxShadow: '0 0 10px rgba(0,0,0,0.1)', fontFamily: "'Inter', 'Helvetica', sans-serif", fontSize: '10pt', color: '#333', boxSizing: 'border-box', position: 'relative' },
        h1: { fontSize: '22pt', fontWeight: 'bold', color: '#2c4f6b', marginBottom: '20px' },
        h2: { fontSize: '14pt', fontWeight: 'bold', color: '#2c4f6b', marginTop: '25px', marginBottom: '15px', borderBottom: '2px solid #d88e43', paddingBottom: '8px', pageBreakAfter: 'avoid' },
        h3: { fontSize: '11pt', fontWeight: 'bold', color: '#008080', marginTop: '15px', marginBottom: '8px' },
        section: { marginBottom: '20px', pageBreakInside: 'avoid' },
        p: { marginBottom: '8px', lineHeight: '1.4' },
        pre: { marginBottom: '10px', lineHeight: '1.5', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '9pt', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' },
        ul: { paddingLeft: '20px', listStyle: 'disc', fontSize: '9pt' },
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
        grid3: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px' },
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', options);
    };

    const selectedRisks = Object.values(data.risks).flatMap(r => r.hazards.filter(h => h.selected).map(h => ({...h, category: r.title})));
    const selectedPermits = data.permits.filter(p => p.selected);
    const selectedPPE = data.ppe.filter(p => p.selected && p.name.trim() !== '');
    const selectedTools = data.tools.filter(t => t.selected && t.name.trim() !== '');
    const selectedMaterials = data.materials.filter(m => m.selected && m.name.trim() !== '');

    return (
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <img src={uctelLogo} alt="UCtel Logo" style={{ height: '12mm', width: 'auto' }} />
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
                    <pre style={{...styles.pre, padding: '0', backgroundColor: 'transparent', border: 'none'}}>{data.methodStatement}</pre>
                </div>
                
                <div style={{...styles.section, pageBreakBefore: 'always'}}>
                    <h2 style={styles.h2}>4.0 Risk Assessments</h2>
                    {selectedRisks.map(hazard => (
                        <div key={hazard.id} style={{...styles.riskAssessmentContainer, marginBottom: '16px'}}>
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

                <div style={{...styles.section, pageBreakBefore: 'always'}}>
                    <h2 style={styles.h2}>5.0 Safety & Logistics</h2>
                    <div style={styles.grid2}>
                        <div>
                            <h3 style={styles.h3}>5.1 Permits Required</h3>
                            <ul style={styles.ul}>
                                {selectedPermits.length > 0 ? selectedPermits.map(p => <li key={p.id}>{p.name}</li>) : <li>None specified.</li>}
                            </ul>
                        </div>
                         <div>
                            <h3 style={styles.h3}>5.2 Waste Management</h3>
                            <p style={{fontSize: '9pt'}}><strong>Produces Waste:</strong> {data.producesWaste ? 'Yes' : 'No'}</p>
                            {data.producesWaste && <p style={{fontSize: '9pt'}}>{data.wasteDisposalPlan}</p>}
                        </div>
                    </div>
                     <div style={{marginTop: '20px'}}>
                         <h3 style={styles.h3}>5.3 COSHH</h3>
                         <p style={{fontSize: '9pt'}}><strong>Hazardous Substances:</strong> {data.hasHazardousSubstances ? 'Yes' : 'No'}</p>
                         <p style={{fontSize: '9pt'}}>{data.coshhDetails}</p>
                     </div>
                     <div style={{marginTop: '20px'}}>
                         <h3 style={styles.h3}>5.4 Third-Party Safety</h3>
                         <pre style={{...styles.pre, padding: 0, backgroundColor: 'transparent'}}>{data.thirdPartySafety}</pre>
                     </div>
                      <div style={{marginTop: '20px'}}>
                         <h3 style={styles.h3}>5.5 Emergency Arrangements</h3>
                         <pre style={{...styles.pre, padding: 0, backgroundColor: 'transparent'}}>{data.emergencyArrangements}</pre>
                     </div>
                </div>

                 <div style={{...styles.section, pageBreakBefore: 'always'}}>
                    <h2 style={styles.h2}>6.0 Required PPE, Tools & Materials</h2>
                     <div style={styles.grid3}>
                        <div>
                            <h3 style={styles.h3}>6.1 Personal Protective Equipment (PPE)</h3>
                            <ul style={styles.ul}>
                                {selectedPPE.map(item => <li key={item.id}>{item.name}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 style={styles.h3}>6.2 Tools & Equipment</h3>
                            <ul style={styles.ul}>
                                {selectedTools.map(item => <li key={item.id}>{item.name}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 style={styles.h3}>6.3 Materials</h3>
                            <ul style={styles.ul}>
                                {selectedMaterials.map(item => <li key={item.id}>{item.name}</li>)}
                            </ul>
                        </div>
                     </div>
                </div>

                 <div style={styles.section}>
                    <h2 style={styles.h2}>7.0 Approval & Sign-Off</h2>
                     <p style={{fontSize: '9pt', color: '#555', marginBottom: '20px'}}>This Risk Assessment and Method Statement (RAMS) has been reviewed and approved by the undersigned. By signing below, each party confirms that:</p>
                     <ul style={{...styles.ul, fontSize: '9pt', color: '#555', marginBottom: '40px'}}>
                        <li>The contents of this RAMS have been read and understood.</li>
                        <li>All works will be carried out in accordance with the method statement and control measures detailed herein.</li>
                        <li>This document will be reviewed and updated if the scope of work or site conditions change.</li>
                     </ul>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', marginTop: '60px' }}>
                        <div style={{borderTop: '1px solid #333', paddingTop: '8px'}}>
                            <p style={{fontWeight: 'bold'}}>UCtel Representative</p>
                            <p style={{fontSize: '9pt', color: '#666'}}>Name, Signature, Date</p>
                        </div>
                        <div style={{borderTop: '1px solid #333', paddingTop: '8px'}}>
                            <p style={{fontWeight: 'bold'}}>Client Representative</p>
                            <p style={{fontSize: '9pt', color: '#666'}}>Name, Signature, Date</p>
                        </div>
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