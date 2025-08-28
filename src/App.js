import React, { useState, useEffect, useCallback } from 'react';
import uctelLogo from './assets/uctel-logo.png';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { db } from './firebase'; 
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';

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
const DEFAULT_PERMITS = [
    { id: 1, name: "Working at Height Permit", selected: true },
    { id: 2, name: "Power Tools Permit", selected: true },
    { id: 3, name: "Hand Tools (HAVS) Permit", selected: true },
    { id: 4, name: "Manual Handling Permit", selected: true },
    { id: 5, name: "Dust Exposure (Drilling Activities) Permit", selected: true },
    { id: 6, name: "Noise Exposure (Drilling Activities) Permit", selected: true },
];
const DEFAULT_PPE = [
    { id: 1, name: "High Visibility Jacket or Vest - Conforming to BS EN ISO 20471", selected: true },
    { id: 2, name: "Safety Boots - Conforming to BS EN ISO 20345", selected: true },
    { id: 3, name: "Cut-Resistant Gloves - Level 5, conforming to BS EN 388:2016 + A1:2018", selected: true },
    { id: 4, name: "Safety Goggles/Glasses - Conforming to BS EN 166", selected: true },
    { id: 5, name: "Safety Helmet - Conforming to BS EN 397", selected: true },
    { id: 6, name: "FFP Respiratory Mask with P3 Filters - Conforming to BS EN 149", selected: true },
];
const DEFAULT_TOOLS = [
    { id: 1, name: "Ladders (EN131 certified)", selected: true },
    { id: 2, name: "Hand Tools (general tool kit including spanners, pliers, hammers, etc.)", selected: true },
    { id: 3, name: "Battery Drill / Driver", selected: true },
    { id: 4, name: "Crimping Tools (RF & electrical connectors)", selected: true },
    { id: 5, name: "Cable Joints & Termination Tools", selected: true },
    { id: 6, name: "Network Analyser / RF Spectrum Analyser (e.g., Siretta Spectrum Analyser)", selected: true },
    { id: 7, name: "Power Tools (110V Compliant, site-safe)", selected: true },
    { id: 8, name: "Fall Arrest Equipment (Harnesses, Lanyards, Anchors)", selected: true },
    { id: 9, name: "Label Printer (for cables and equipment labelling)", selected: true },
    { id: 10, name: "Mobile Phones (for test apps)", selected: true },
    { id: 11, name: "Stud Finder (for safe drilling)", selected: true },
    { id: 12, name: "Torque Wrench (for secure antenna mounting fixings)", selected: true },
    { id: 13, name: "Vacuum Cleaner (M-Class rated, dust control)", selected: true },
    { id: 14, name: "Work Lights (low-voltage / Battery LED)", selected: true },
];
const DEFAULT_MATERIALS = [
    { id: 1, name: "CEL-FI Hardware", selected: true },
    { id: 2, name: "Donor Antennas (for signal capture)", selected: true },
    { id: 3, name: "Indoor OMNI Antenna (for distribution of signal)", selected: true },
    { id: 4, name: "LMR400 Coaxial Cable (for DAS connections)", selected: true },
    { id: 5, name: "Mounting Pole and Bracket (External)", selected: true },
    { id: 6, name: "Cable Ties / Clips", selected: true },
    { id: 7, name: "Weatherproof Tape and Coaxial Sealant", selected: true },
];

const buildSelectedTasks = (templateKey, templates, tasks) => {
    if (!templates[templateKey] || !tasks) return [];
    const taskIds = templates[templateKey].taskIds;
    return taskIds.map(id => {
        const taskInfo = tasks[id];
        if (!taskInfo) return null;
        const defaultOptionKey = Object.keys(taskInfo.options)[0];
        const defaultOption = taskInfo.options[defaultOptionKey];
        return {
            id: `${id}-${Date.now()}`,
            taskId: id,
            selectedOption: defaultOptionKey,
            description: defaultOption.description,
            enabled: true,
        };
    }).filter(Boolean);
};

// UPDATED: This is now a simple inline form, not a modal.
const NewTaskForm = ({ onSave, onCancel }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (!title || !description) {
            alert('Please provide a title and a description for the new task.');
            return;
        }
        onSave({ title, description });
    };

    return (
        <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-md space-y-2">
            <h3 className="font-bold text-sm text-slate-700">Create New Standard Task</h3>
            <input
                type="text"
                placeholder="Task Title (e.g., 'Final Site Cleanup')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
            <textarea
                placeholder="Default task description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
                rows={3}
            />
            <div className="flex gap-2">
                <button onClick={handleSave} className="bg-[var(--uctel-teal)] text-white font-semibold py-1 px-3 rounded-md text-sm">Save Task</button>
                <button onClick={onCancel} className="bg-slate-200 text-slate-700 py-1 px-3 rounded-md text-sm">Cancel</button>
            </div>
        </div>
    );
};

// UPDATED: This is now a simple inline form, not a modal.
const NewTemplateForm = ({ onSave, onCancel, allTemplates }) => {
    const [id, setId] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState(''); // State for the description

    const handleSave = () => {
        // Validation now includes the description
        if (!id || !name || !description) {
            alert('Please provide a Template ID, Name, and Description.');
            return;
        }
        if (allTemplates[id.toUpperCase()]) {
            alert('This Template ID already exists. Please choose a unique ID.');
            return;
        }
        // Pass the description in the onSave call
        onSave({ id: id.toUpperCase(), name, description });
    };
    
    return (
        <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-md space-y-2">
            <h3 className="font-bold text-sm text-slate-700">Create New Template</h3>
            <input
                type="text"
                placeholder="Template ID (e.g., 'G51')"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
            <input
                type="text"
                placeholder="Template Name (e.g., 'CEL-FI G51 Installation')"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
            />
            {/* New Textarea for the description */}
            <textarea
                placeholder="Template Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded-md text-sm"
                rows={3}
            />
            <div className="flex gap-2">
                <button onClick={handleSave} className="bg-[var(--uctel-teal)] text-white font-semibold py-1 px-3 rounded-md text-sm">Save</button>
                <button onClick={onCancel} className="bg-slate-200 text-slate-700 py-1 px-3 rounded-md text-sm">Cancel</button>
            </div>
        </div>
    );
};
export default function App() {
  
  const [allTasks, setAllTasks] = useState({});
  const [allTemplates, setAllTemplates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [step, setStep] = useState(1);
  const [showPreview, setShowPreview] = useState(false);
  const [formData, setFormData] = useState(null);

  useEffect(() => {
     if (!isLoading && !formData && Object.keys(allTasks).length > 0) {
      const initialTemplateKey = 'G43';
      const initialFormState = {
          client: 'iQ Student Accommodation',
          siteAddress: '120 Longwood Close, Coventry',
          projectDescription: allTemplates[initialTemplateKey]?.description || '',
          commencementDate: '2025-09-01',
          estimatedCompletionDate: '2025-09-05',
          preparedBy: 'James Smith',
          preparedByEmail: 'james.smith@uctel.co.uk',
          preparedByPhone: '+44 7730 890403',
          projectTeam: [ { id: 1, name: 'James Smith', role: 'Project Coordinator', phone: '+44 7730 890403'}, { id: 2, name: '', role: '', phone: ''} ],
          jobTemplate: initialTemplateKey,
          selectedTasks: buildSelectedTasks(initialTemplateKey, allTemplates, allTasks),
          risks: JSON.parse(JSON.stringify(RISK_ASSESSMENTS)),
          permits: JSON.parse(JSON.stringify(DEFAULT_PERMITS)),
          ppe: JSON.parse(JSON.stringify(DEFAULT_PPE)),
          tools: JSON.parse(JSON.stringify(DEFAULT_TOOLS)),
          materials: JSON.parse(JSON.stringify(DEFAULT_MATERIALS)),
          producesWaste: true,
          wasteDisposalPlan: 'Where possible, all waste materials generated during UCtel works will be disposed of using the bins provided by the client on-site.',
          hasHazardousSubstances: false,
          coshhDetails: 'UCtel does not anticipate the use of any hazardous materials or substances during the works.',
          thirdPartySafety: `UCtel will utilise clear warning signage ("Work in Progress", "Keep Clear") to notify of active work areas.
• Tools, cabling and equipment will be kept tidy and secured to prevent obstruction of pedestrian routes or fire exits.
• Work areas will be cordoned off where appropriate to minimise the risk of unauthorised access.`,
          emergencyArrangements: `The nearest A&E is located at University Hospital Coventry and Warwickshire (UHCW) - Clifford Bridge Road, Coventry, CV2 2DX.`,
      };
      setFormData(initialFormState);
    }
}, [isLoading, formData, allTasks, allTemplates]);

    useEffect(() => {
    const fetchData = async () => {
      try {
        const tasksCollection = collection(db, 'standardTasks');
        const tasksSnapshot = await getDocs(tasksCollection);
        const tasksData = {};
        tasksSnapshot.forEach(doc => {
          tasksData[doc.id] = doc.data();
        });
        setAllTasks(tasksData);

        const templatesCollection = collection(db, 'jobTemplates');
        const templatesSnapshot = await getDocs(templatesCollection);
        const templatesData = {};
        templatesSnapshot.forEach(doc => {
          templatesData[doc.id] = doc.data();
        });
        setAllTemplates(templatesData);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };
   const handleTaskToggle = (uniqueId) => {
      setFormData(prev => ({
          ...prev,
          selectedTasks: prev.selectedTasks.map(task => 
              task.id === uniqueId ? { ...task, enabled: !task.enabled } : task
          )
      }));
  };
  const handleCreateAndAddTask = async ({ title, description }) => {
    const newTaskId = `task_${Date.now()}`;
    const newTaskData = {
      title: title,
      options: {
        default: {
          name: "Default",
          description: description
        }
      }
    };
    try {
      // This line saves the new task to the database
      await setDoc(doc(db, "standardTasks", newTaskId), newTaskData);
      
      // These lines update the app's state so you see the new task immediately
      setAllTasks(prev => ({ ...prev, [newTaskId]: newTaskData }));
      const newTaskForSequence = {
        id: `${newTaskId}-${Date.now()}`,
        taskId: newTaskId,
        selectedOption: 'default',
        description: description,
        enabled: true,
      };
      setFormData(prev => ({
        ...prev,
        selectedTasks: [...prev.selectedTasks, newTaskForSequence]
      }));
      
      // This hides the form
      setShowNewTaskForm(false);

    } catch (error) {
      console.error("Error creating new task:", error);
      alert("Failed to create new task. Please check the console for details.");
    }
  };

  const handleCreateTemplate = async ({ id, name, description }) => { // Accepts description now
    const currentTaskIds = formData.selectedTasks.map(task => task.taskId);
    const newTemplateData = {
      name: name,
      description: description, // Uses the new description from the form
      taskIds: currentTaskIds
    };

    try {
        await setDoc(doc(db, "jobTemplates", id), newTemplateData);
        setAllTemplates(prev => ({ ...prev, [id]: newTemplateData }));
        
        // Also update the main project description to match the new template's description
        setFormData(prev => ({ 
            ...prev, 
            jobTemplate: id,
            projectDescription: description 
        }));
        
        setShowNewTemplateForm(false);
    } catch (error) {
        console.error("Error creating new template:", error);
        alert("Failed to create new template. Please check the console for details.");
    }
  };

  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const templateKey = e.target.value;
    
    if (templateKey === '--add-new--') {
        setShowNewTemplateForm(true); // Show the inline form
        return;
    }

    // If a different template is chosen, hide the form.
    setShowNewTemplateForm(false); 

    if (allTemplates[templateKey]) {
      setFormData(prev => ({
        ...prev,
        jobTemplate: templateKey,
        projectDescription: allTemplates[templateKey].description,
        selectedTasks: buildSelectedTasks(templateKey, allTemplates, allTasks),
      }));
    }
  };
  
  const handleTaskOptionChange = (uniqueId, newOptionKey) => {
      setFormData(prev => ({
          ...prev,
          selectedTasks: prev.selectedTasks.map(task => {
              if (task.id === uniqueId) {
                  const newDescription = allTasks[task.taskId].options[newOptionKey]?.description || '';
                  return { ...task, selectedOption: newOptionKey, description: newDescription };
              }
              return task;
          })
      }));
  };
  
  const handleTaskDescriptionChange = (uniqueId, newDescription) => {
      setFormData(prev => ({
          ...prev,
          selectedTasks: prev.selectedTasks.map(task => 
              task.id === uniqueId ? { ...task, description: newDescription } : task
          )
      }));
  };
  
  const handleOnDragEnd = (result) => {
      if (!result.destination) return;
      const items = Array.from(formData.selectedTasks);
      const [reorderedItem] = items.splice(result.source.index, 1);
      items.splice(result.destination.index, 0, reorderedItem);
      setFormData(prev => ({...prev, selectedTasks: items}));
  };
  
  const handleAddNewOption = (taskId, newOption) => {
      const newKey = `custom_${Date.now()}`;
      setAllTasks(prev => {
          const updatedTasks = { ...prev };
          updatedTasks[taskId].options[newKey] = newOption;
          return updatedTasks;
      });
      setFormData(prev => ({
        ...prev,
        selectedTasks: prev.selectedTasks.map(task => 
            task.taskId === taskId ? { ...task, selectedOption: newKey, description: newOption.description } : task
        )
    }));
  };

  const handleProjectTeamChange = (index, field, value) => {
    const updatedTeam = [...formData.projectTeam];
    updatedTeam[index][field] = value;
    setFormData(prev => ({ ...prev, projectTeam: updatedTeam }));
  };

  const addTeamMember = () => {
    setFormData(prev => ({
      ...prev,
      projectTeam: [...prev.projectTeam, { id: Date.now(), name: '', role: '', phone: '' }]
    }));
  };

  const removeTeamMember = (index) => {
    const updatedTeam = formData.projectTeam.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, projectTeam: updatedTeam }));
  };

  const handleRiskToggle = (riskKey, hazardId) => {
    setFormData(prev => {
      const newRisks = JSON.parse(JSON.stringify(prev.risks));
      const hazard = newRisks[riskKey].hazards.find(h => h.id === hazardId);
      if (hazard) {
        hazard.selected = !hazard.selected;
      }
      return { ...prev, risks: newRisks };
    });
  };

  const handleSelectableListToggle = (listName, itemId) => {
    setFormData(prev => ({
      ...prev,
      [listName]: prev[listName].map(item =>
        item.id === itemId ? { ...item, selected: !item.selected } : item
      )
    }));
  };


  const TOTAL_STEPS = 7;
  const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isLoading || !formData) {
      return <div className="text-center p-12">Loading RAMS Generator...</div>
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={formData} handler={handleInputChange} />;
      case 2: return <Step2 data={formData} onChange={handleProjectTeamChange} onAdd={addTeamMember} onRemove={removeTeamMember} />;
     case 3: return <Step3 
          data={formData} 
          allTasks={allTasks} 
          allTemplates={allTemplates} 
          handlers={{
            handleTemplateChange, 
            handleTaskToggle, 
            handleTaskOptionChange, 
            handleTaskDescriptionChange, 
            handleOnDragEnd, 
            handleAddNewOption, 
            handleCreateTemplate,
            handleCreateAndAddTask, // Add this
            setShowNewTemplateForm,
            setShowNewTaskForm      // Add this
          }}
          showNewTemplateForm={showNewTemplateForm}
          showNewTaskForm={showNewTaskForm} // And pass this state
        />;
      case 4: return <Step4 data={formData} handler={handleRiskToggle} />;
      case 5: return <Step5 data={formData} onToggle={handleSelectableListToggle} onInputChange={handleInputChange} onTextAreaChange={handleTextAreaChange} />;
      case 6: return <Step6 data={formData} onToggle={handleSelectableListToggle} />;
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
            <div className="mb-8">
                <div className="flex justify-between mb-2 text-xs sm:text-sm">
                    {progressLabels.map((label, index) => (
                       <span 
                           key={label} 
                           className={`font-bold cursor-pointer transition-colors hover:text-[var(--uctel-teal)] ${step >= index + 1 ? 'text-[var(--uctel-blue)]' : 'text-slate-400'}`}
                           onClick={() => setStep(index + 1)}
                       >
                           {label}
                       </span>
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
                  <PrintableDocument data={formData} allTasks={allTasks}/>
              </div>
          </div>
      )}
     
     
    </>
  );
}

const AddNewOptionForm = ({ taskId, onSave, onCancel }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (name && description) {
            onSave(taskId, { name, description });
            onCancel();
        } else {
            alert('Please provide a name and description for the new option.');
        }
    };
    
    return (
        <div className="mt-3 p-3 bg-teal-50 border border-teal-200 rounded-md space-y-2">
            <input type="text" placeholder="New Option Name" value={name} onChange={e => setName(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm" />
            <textarea placeholder="New Option Description" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 border border-slate-300 rounded-md text-sm" rows={3}></textarea>
            <div className="flex gap-2">
                <button onClick={handleSave} className="bg-[var(--uctel-teal)] text-white font-semibold py-1 px-3 rounded-md text-sm">Save</button>
                <button onClick={onCancel} className="bg-slate-200 text-slate-700 py-1 px-3 rounded-md text-sm">Cancel</button>
            </div>
        </div>
    );
};

const TaskItem = ({ task, index, allTasks, handlers }) => {
    const [showNewOptionForm, setShowNewOptionForm] = useState(false);
    if (!allTasks[task.taskId]) {
        return null; // or a loading/error state
    }
    const taskInfo = allTasks[task.taskId];
    const optionKeys = Object.keys(taskInfo.options);

    const handleOptionSelect = (e) => {
        if (e.target.value === '--add-new--') {
            setShowNewOptionForm(true);
        } else {
            setShowNewOptionForm(false);
            handlers.handleTaskOptionChange(task.id, e.target.value);
        }
    };

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided, snapshot) => (
                <div 
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`p-4 bg-white rounded-lg border space-y-3 ${snapshot.isDragging ? 'shadow-lg border-[var(--uctel-blue)]' : 'border-slate-200'}`}
                >
                    <div className="flex items-center gap-3">
                        <div {...provided.dragHandleProps} className="cursor-grab text-slate-400 hover:text-[var(--uctel-blue)]">
                           <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </div>
                        <label className="flex-grow flex items-center gap-3 font-semibold cursor-pointer">
                            <input type="checkbox" checked={task.enabled} onChange={() => handlers.handleTaskToggle(task.id)} className="h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" />
                            <span>{`${taskInfo.title}`}</span>
                        </label>
                        {task.enabled && (
                            <select value={task.selectedOption} onChange={handleOptionSelect} className="p-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-[var(--uctel-blue)] transition w-full sm:w-auto text-sm max-w-[200px]">
                                {optionKeys.map(key => (
                                    <option key={key} value={key}>{taskInfo.options[key].name}</option>
                                ))}
                                <option value="--add-new--" className="font-bold text-[var(--uctel-blue)]"> + Add New Option...</option>
                            </select>
                        )}
                    </div>
                    {task.enabled && (
                        <div className="pl-12">
                             {showNewOptionForm ? (
                                <AddNewOptionForm taskId={task.taskId} onSave={handlers.handleAddNewOption} onCancel={() => setShowNewOptionForm(false)} />
                            ) : (
                                <textarea 
                                    value={task.description}
                                    onChange={(e) => handlers.handleTaskDescriptionChange(task.id, e.target.value)}
                                    className="w-full p-2 border border-slate-200 rounded-md text-sm bg-slate-50"
                                    rows={3}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
        </Draggable>
    );
};

const Step3 = ({ data, allTasks, allTemplates, handlers, showNewTemplateForm, showNewTaskForm }) => {    
    return (
        <div>
            <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 3: Build Method Statement</h2>
            <div className="space-y-6">
                <div>
                    <label htmlFor="jobTemplate" className="mb-2 font-semibold text-slate-700 block">1. Select Job Template</label>
                    <div className="flex gap-2">
                        <select id="jobTemplate" name="jobTemplate" value={data.jobTemplate} onChange={handlers.handleTemplateChange} className="flex-grow p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition">
                            {Object.keys(allTemplates).map(key => (
                                <option key={key} value={key}>{allTemplates[key].name}</option>
                            ))}
                            <option value="--add-new--" className="font-bold text-[var(--uctel-blue)]"> + Add New Template...</option>
                        </select>
                    </div>
                    {showNewTemplateForm && (
                        <NewTemplateForm 
                            onSave={handlers.handleCreateTemplate}
                            onCancel={() => handlers.setShowNewTemplateForm(false)}
                            allTemplates={allTemplates}
                        />
                    )}
                </div>
                <div>
                    <label className="mb-2 font-semibold text-slate-700 block">2. Configure &amp; Order Sequence of Works</label>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <DragDropContext onDragEnd={handlers.handleOnDragEnd}>
                            <Droppable droppableId="tasks">
                                {(provided) => (
                                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                                        {data.selectedTasks.map((task, index) => (
                                            <TaskItem key={task.id} task={task} index={index} allTasks={allTasks} handlers={handlers} />
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                        <div className="mt-4 pt-4 border-t border-slate-200">
                            {!showNewTaskForm ? (
                                <button 
                                    onClick={() => handlers.setShowNewTaskForm(true)} 
                                    className="w-full bg-blue-100 text-[var(--uctel-blue)] font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                                >
                                    + Create & Add New Standard Task
                                </button>
                            ) : (
                                <NewTaskForm
                                    onSave={handlers.handleCreateAndAddTask}
                                    onCancel={() => handlers.setShowNewTaskForm(false)}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormSection = ({ title, children, gridCols = 2 }) => ( <div className="mb-8"> <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">{title}</h2> <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>{children}</div> </div> );
const Input = ({ label, name, value, onChange, type = 'text', gridSpan = 1 }) => ( <div className={`flex flex-col md:col-span-${gridSpan}`}> <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label> <input type={type} id={name} name={name} value={value} onChange={onChange} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition" /> </div> );
const TextArea = ({ label, name, value, onChange, rows = 8, gridSpan = 2 }) => ( <div className={`flex flex-col md:col-span-${gridSpan}`}> <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label> <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition w-full"></textarea> </div> );
const Step1 = ({ data, handler }) => ( <div> <FormSection title="Step 1: Project Details" gridCols={2}> <Input label="Client Name" name="client" value={data.client} onChange={handler} gridSpan={2} /> <Input label="Site Address" name="siteAddress" value={data.siteAddress} onChange={handler} gridSpan={2} /> <Input label="Commencement Date" name="commencementDate" value={data.commencementDate} onChange={handler} type="date"/> <Input label="Estimated Completion Date" name="estimatedCompletionDate" value={data.estimatedCompletionDate} onChange={handler} type="date"/> <Input label="Prepared By" name="preparedBy" value={data.preparedBy} onChange={handler} /> <Input label="Email" name="preparedByEmail" value={data.preparedByEmail} onChange={handler} type="email"/> <Input label="Telephone" name="preparedByPhone" value={data.preparedByPhone} onChange={handler} type="tel"/> </FormSection> </div> );
const Step2 = ({ data, onChange, onAdd, onRemove }) => ( <div> <FormSection title="Step 2: Project Team" gridCols={1}> <p className="text-slate-600 md:col-span-1 -mt-4 mb-2">List the key personnel involved in this project.</p> <div className="space-y-4"> {data.projectTeam.map((member, index) => ( <div key={member.id} className="grid grid-cols-1 md:grid-cols-8 gap-4 p-4 border rounded-lg bg-slate-50 relative"> <div className="md:col-span-3"> <label className="text-sm font-semibold text-slate-600">Name</label> <input type="text" value={member.name} onChange={(e) => onChange(index, 'name', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" /> </div> <div className="md:col-span-2"> <label className="text-sm font-semibold text-slate-600">Role</label> <input type="text" value={member.role} onChange={(e) => onChange(index, 'role', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" /> </div> <div className="md:col-span-3"> <label className="text-sm font-semibold text-slate-600">Telephone</label> <input type="text" value={member.phone} onChange={(e) => onChange(index, 'phone', e.target.value)} className="w-full mt-1 p-2 border border-slate-300 rounded-md" /> </div> {data.projectTeam.length > 1 && ( <button onClick={() => onRemove(index)} className="absolute -top-2 -right-2 bg-red-500 text-white h-6 w-6 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors">&times;</button> )} </div> ))} </div> <button onClick={onAdd} className="mt-4 bg-blue-100 text-[var(--uctel-blue)] font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm"> + Add Team Member </button> </FormSection> </div> );
const Step4 = ({ data, handler }) => ( <div> <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 4: Identify Risks</h2> <p className="mb-6 text-slate-600">Select the hazards that are relevant to this project. This will include them in the final document.</p> {Object.keys(data.risks).map(riskKey => { const risk = data.risks[riskKey]; return ( <div key={riskKey} className="mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200"> <h3 className="text-xl font-bold mb-4 text-slate-800">{risk.title}</h3> <div className="space-y-3"> {risk.hazards.map(hazard => ( <label key={hazard.id} className="flex items-start gap-4 p-4 border rounded-md bg-white cursor-pointer hover:border-[var(--uctel-blue)] has-[:checked]:bg-teal-50 has-[:checked]:border-[var(--uctel-teal)] transition-colors"> <input type="checkbox" checked={hazard.selected} onChange={() => handler(riskKey, hazard.id)} className="mt-1 h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" /> <div className="flex-1"> <p className="font-semibold">{hazard.hazard}</p> <p className="text-sm text-slate-600 mt-1"><strong className="font-semibold text-slate-700">Who/How:</strong> {hazard.who}</p> <p className="text-sm text-slate-600 mt-1"><strong className="font-semibold text-slate-700">Controls:</strong> {hazard.controls}</p> </div> </label> ))} </div> </div> ); })} </div> );
const SelectableList = ({ title, items, listName, onToggle }) => ( <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2"> <h3 className="text-xl font-bold mb-4 text-slate-800">{title}</h3> <div className="space-y-3"> {items.map(item => ( <label key={item.id} className="flex items-center gap-3 p-3 border rounded-md bg-white cursor-pointer hover:border-[var(--uctel-blue)] has-[:checked]:bg-teal-50 has-[:checked]:border-[var(--uctel-teal)] transition-colors"> <input type="checkbox" checked={item.selected} onChange={() => onToggle(listName, item.id)} className="h-5 w-5 text-[var(--uctel-teal)] border-slate-300 rounded focus:ring-[var(--uctel-teal)]" /> <span className="flex-1 text-sm">{item.name}</span> </label> ))} </div> </div> );
const Step5 = ({ data, onToggle, onInputChange, onTextAreaChange }) => ( <div> <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 5: Safety & Logistics</h2> <div className="space-y-8"> <SelectableList title="Permits Required" items={data.permits} listName="permits" onToggle={onToggle} /> <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2"> <h3 className="text-xl font-bold mb-4 text-slate-800">Waste Management</h3> <div className="flex items-center gap-6 mb-4"> <p>Will your work produce waste?</p> <label className="flex items-center gap-2"><input type="radio" name="producesWaste" value={true} checked={data.producesWaste} onChange={() => onInputChange({ target: { name: 'producesWaste', value: true }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> Yes</label> <label className="flex items-center gap-2"><input type="radio" name="producesWaste" value={false} checked={!data.producesWaste} onChange={() => onInputChange({ target: { name: 'producesWaste', value: false }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> No</label> </div> {data.producesWaste && <TextArea label="Waste Disposal Plan" name="wasteDisposalPlan" value={data.wasteDisposalPlan} onChange={onTextAreaChange} rows={3} />} </div> <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 md:col-span-2"> <h3 className="text-xl font-bold mb-4 text-slate-800">COSHH (Control of Substances Hazardous to Health)</h3> <div className="flex items-center gap-6 mb-4"> <p>Will you use hazardous substances?</p> <label className="flex items-center gap-2"><input type="radio" name="hasHazardousSubstances" value={true} checked={data.hasHazardousSubstances} onChange={() => onInputChange({ target: { name: 'hasHazardousSubstances', value: true }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> Yes</label> <label className="flex items-center gap-2"><input type="radio" name="hasHazardousSubstances" value={false} checked={!data.hasHazardousSubstances} onChange={() => onInputChange({ target: { name: 'hasHazardousSubstances', value: false }})} className="h-4 w-4 text-[var(--uctel-teal)]"/> No</label> </div> <TextArea label="Details" name="coshhDetails" value={data.coshhDetails} onChange={onTextAreaChange} rows={4} /> </div> <div className="grid grid-cols-1 gap-6"> <TextArea label="Third-Party Safety Measures" name="thirdPartySafety" value={data.thirdPartySafety} onChange={onTextAreaChange} rows={4} /> <TextArea label="Emergency Arrangements" name="emergencyArrangements" value={data.emergencyArrangements} onChange={onTextAreaChange} rows={4} /> </div> </div> </div> );
const Step6 = ({ data, onToggle }) => ( <div> <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 6: Equipment & Materials</h2> <p className="mb-6 text-slate-600">Select the Personal Protective Equipment (PPE), tools, and materials for this job. You can also add custom items.</p> <div className="space-y-6"> <SelectableList title="Personal Protective Equipment (PPE)" listName="ppe" items={data.ppe} onToggle={onToggle} /> <SelectableList title="Plant / Equipment / Tools" listName="tools" items={data.tools} onToggle={onToggle} /> <SelectableList title="Materials" listName="materials" items={data.materials} onToggle={onToggle} /> </div> </div> );
const Step7 = ({ previewHandler }) => ( <div> <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 7: Review & Generate</h2> <div className="p-6 bg-slate-50 rounded-lg text-center"> <h3 className="text-xl font-semibold mb-4 text-slate-800">You are ready to preview your document.</h3> <p className="text-slate-600 mb-6">Click the button below to see a full-page preview of your RAMS document. You can make changes by going back to previous steps.</p> <button onClick={previewHandler} className="bg-[var(--uctel-teal)] text-white font-bold py-3 px-8 rounded-lg hover:bg-opacity-90 transition-transform transform hover:scale-105"> Preview Document </button> </div> </div> );
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

    const selectedRisks = Object.values(data.risks).flatMap(r => r.hazards.filter(h => h.selected).map(h => ({...h, category: r.title})));
    const selectedPermits = data.permits.filter(p => p.selected && p.name.trim() !== '');
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
                    <p style={styles.logisticsQuestion}>Will your work produce waste? <strong>{data.producesWaste ? 'YES' : 'NO'}</strong></p>
                    {data.producesWaste && <pre style={styles.pre}>{data.wasteDisposalPlan}</pre>}
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>9.0 COSHH</h2>
                    <p style={styles.logisticsQuestion}>Will you be bringing any materials or substances that are hazardous to health or the environment? <strong>{data.hasHazardousSubstances ? 'YES' : 'NO'}</strong></p>
                    <pre style={styles.pre}>{data.coshhDetails}</pre>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>10.0 Third-Party Safety</h2>
                    <p style={styles.logisticsQuestion}>What measures will be taken to ensure the safety of third parties (e.g. pedestrians, site visitors) during installation?</p>
                    <pre style={styles.pre}>{data.thirdPartySafety}</pre>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>11.0 Emergency Arrangements</h2>
                    <p style={styles.logisticsQuestion}>What is the location of the nearest Accident & Emergency (A&E) department?</p>
                    <pre style={styles.pre}>{data.emergencyArrangements}</pre>
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

