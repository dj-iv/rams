import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import uctelLogo from './assets/uctel-logo.png';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { db } from './firebase'; 
import { collection, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'; 
import { DEFAULT_PERMITS, DEFAULT_PPE, DEFAULT_TOOLS, DEFAULT_MATERIALS } from './constants';
import Step1 from './components/steps/Step1';
import Step2 from './components/steps/Step2';
import Step4 from './components/steps/Step4';
import Step5 from './components/steps/Step5';
import Step6 from './components/steps/Step6';
import Step7 from './components/steps/Step7';
import PreviewModal from './components/PreviewModal'; // Ensure this import is present

const buildInitialTasks = (allTasks, template, templates) => {
  if (!template || !templates[template]) {
    // If no template, return all tasks, sorted by order, and disabled.
    return Object.entries(allTasks)
      .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
      .map(([taskId, taskInfo]) => ({
        id: `${taskId}-${Date.now()}`,
        taskId: taskId,
        selectedOption: Object.keys(taskInfo.options)[0],
        description: taskInfo.defaultDescription || Object.values(taskInfo.options)[0].description,
        enabled: false,
        images: [], // Add images array to store uploaded images
      }));
  }
  const templateTaskIds = templates[template].taskIds || [];
  // Return all tasks, sorted by order. Enable the ones that are in the template.
  return Object.entries(allTasks)
    .sort(([, a], [, b]) => (a.order || 0) - (b.order || 0))
    .map(([taskId, taskInfo]) => ({
      id: `${taskId}-${Date.now()}`,
      taskId: taskId,
      selectedOption: Object.keys(taskInfo.options)[0],
      description: taskInfo.defaultDescription || Object.values(taskInfo.options)[0].description,
      enabled: templateTaskIds.includes(taskId), // Enable if task ID is in the template
      images: [], // Add images array to store uploaded images
    }));
};

const buildSelectedTasks = (template, templates, allTasks) => {
    return buildInitialTasks(allTasks, template, templates);
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
                <div className="space-y-3">
                  <div className="space-y-2">
                    <textarea 
                      value={task.description}
                      onChange={(e) => handlers.handleTaskDescriptionChange(task.id, e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-md text-sm bg-slate-50"
                      rows={3}
                    />
                    
                    {/* Update Default Button */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handlers.handleUpdateTaskDefault(task.taskId, task.id)}
                        className="px-3 py-1 text-xs bg-[var(--uctel-teal)] text-white rounded-md hover:bg-teal-600 transition-colors duration-200 flex items-center gap-1"
                        title="Save this description as the default for all new tasks of this type"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Update Default
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Upload Section */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Task Images (optional)
                    </label>
                    
                    {/* Image Upload Input */}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handlers.handleTaskImageUpload(task.id, e.target.files)}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--uctel-blue)] file:text-white hover:file:bg-blue-700"
                    />
                    
                    {/* Image Previews */}
                    {task.images && task.images.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {task.images.map((image, imgIndex) => (
                          <div key={imgIndex} className="relative group">
                            <img
                              src={image.dataUrl}
                              alt={`Task image ${imgIndex + 1}`}
                              className="w-full h-20 object-cover rounded border"
                            />
                            <button
                              onClick={() => handlers.handleTaskImageRemove(task.id, imgIndex)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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

// Main App component (renamed to AppContent to avoid conflicts)
const AppContent = () => {
  const [formData, setFormData] = useState(null);
  const [dbPpe, setDbPpe] = useState([]);
  const [dbTools, setDbTools] = useState([]);
  const [dbMaterials, setDbMaterials] = useState([]);
  const [dbPermits, setDbPermits] = useState([]);
  const [dbTeamMembers, setDbTeamMembers] = useState([]);
  const [allTasks, setAllTasks] = useState({});
  const [allTemplates, setAllTemplates] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [allRisks, setAllRisks] = useState({});
  const [showNewTaskForm, setShowNewTaskForm] = useState(false);
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [step, setStep] = useState(1);
  const [addingHazardTo, setAddingHazardTo] = useState(null); // State to track which risk category is getting a new hazard
  const [showNewRiskCategoryForm, setShowNewRiskCategoryForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false); // Add state for modal visibility

useEffect(() => {
     // This effect now runs once the initial data fetch is complete, even if some collections are empty.
     // This prevents the app from getting stuck on the loading screen.
     if (!isLoading && !formData) {
      const initialTemplateKey = 'G43';
      const initialFormState = {
          client: 'iQ Student Accommodation',
          siteAddress: '120 Longwood Close, Coventry',
          projectDescription: allTemplates[initialTemplateKey]?.description || '',
          commencementDate: '2025-09-01',
          estimatedCompletionDate: '2025-09-05',
          hoursOfWork: {
            startTime: '08:00',
            endTime: '17:00'
          },
          preparedBy: 'James Smith',
          preparedByEmail: 'james.smith@uctel.co.uk',
          preparedByPhone: '+44 7730 890403',
          documentCreationDate: new Date().toISOString().slice(0, 10),
          revisionNumber: '1',
          projectTeam: [ { id: '1', name: 'James Smith', role: 'Project Coordinator', phone: '+44 7730 890403', competencies: 'First Aid, Working at Height'} ],
          jobTemplate: initialTemplateKey,
          selectedTasks: buildInitialTasks(allTasks, initialTemplateKey, allTemplates),
          risks: JSON.parse(JSON.stringify(allRisks)), // Use fetched risks
          ppe: JSON.parse(JSON.stringify(dbPpe.length > 0 ? dbPpe : DEFAULT_PPE)),
          tools: JSON.parse(JSON.stringify(dbTools.length > 0 ? dbTools : DEFAULT_TOOLS)),
          materials: JSON.parse(JSON.stringify(dbMaterials.length > 0 ? dbMaterials : DEFAULT_MATERIALS)),
          safetyLogistics: [
            { id: 'permits', title: 'Permits Required', type: 'selectableList', items: JSON.parse(JSON.stringify(dbPermits.length > 0 ? dbPermits : DEFAULT_PERMITS)), details: '' },
            { id: 'waste', title: 'Waste Management', type: 'booleanWithText', question: 'Will your work produce waste?', enabled: true, details: 'Where possible, all waste materials generated during UCtel works will be disposed of using the bins provided by the client on-site.' },
            { id: 'coshh', title: 'COSHH (Control of Substances Hazardous to Health)', type: 'booleanWithText', question: 'Will you use hazardous substances?', enabled: false, details: 'UCtel does not anticipate the use of any hazardous materials or substances during the works.' },
            { id: 'thirdPartySafety', title: 'Third-Party Safety Measures', type: 'textArea', details: 'UCtel will utilise clear warning signage ("Work in Progress", "Keep Clear") to notify of active work areas.\n• Tools, cabling and equipment will be kept tidy and secured to prevent obstruction of pedestrian routes or fire exits.\n• Work areas will be cordoned off where appropriate to minimise the risk of unauthorised access.' },
            { id: 'emergencyArrangements', title: 'Emergency Arrangements', type: 'textArea', details: 'The nearest A&E is located at University Hospital Coventry and Warwickshire (UHCW) - Clifford Bridge Road, Coventry, CV2 2DX.' }
          ],
          permitsDetails: '',
          ppeDetails: '',
          toolsDetails: '',
          materialsDetails: '',
        };
      setFormData(initialFormState);
    }
}, [isLoading, formData, allTasks, allTemplates, allRisks, dbPpe, dbTools, dbMaterials, dbPermits, dbTeamMembers]);

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

           const listCollections = {
            permits: setDbPermits,
            ppe: setDbPpe,
            tools: setDbTools,
            materials: setDbMaterials,
        };

        for (const [name, setter] of Object.entries(listCollections)) {
            const snapshot = await getDocs(collection(db, name));
            const data = snapshot.docs.map(d => ({ ...d.data(), id: d.id }));
            // Assuming items have a numeric `id` property from the original constants for sorting
            const sortedData = data.sort((a, b) => a.id - b.id);
            setter(sortedData);
        }

        const risksCollection = collection(db, 'riskAssessments');
        const risksSnapshot = await getDocs(risksCollection);
        const risksData = {};
        risksSnapshot.forEach(doc => {
          risksData[doc.id] = doc.data();
        });
        setAllRisks(risksData);

        const teamMembersCollection = collection(db, 'teamMembers');
        const teamMembersSnapshot = await getDocs(teamMembersCollection);
        const teamMembersData = teamMembersSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        setDbTeamMembers(teamMembersData);

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching data from Firebase:", error);
      }
    };
    fetchData();
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  }, []);
   const handleTaskToggle = useCallback((uniqueId) => {
      setFormData(prev => ({
          ...prev,
          selectedTasks: prev.selectedTasks.map(task => 
              task.id === uniqueId ? { ...task, enabled: !task.enabled } : task
          )
      }));
  }, []);
  const handleSafetyLogisticsChange = useCallback((categoryId, field, value) => {
    setFormData(prev => ({
        ...prev,
        safetyLogistics: prev.safetyLogistics.map(category => 
            category.id === categoryId 
                ? { ...category, [field]: value }
                : category
        )
    }));
  }, []);

  const handleSafetyListItemToggle = useCallback(async (categoryId, itemId) => {
    if (categoryId === 'permits') {
        const itemToUpdate = formData.safetyLogistics.find(c => c.id === 'permits')?.items.find(item => item.id === itemId);
        if (itemToUpdate) {
            const newSelectedState = !itemToUpdate.selected;
            try {
                await setDoc(doc(db, 'permits', itemId), { selected: newSelectedState }, { merge: true });
            } catch (error) {
                console.error(`Error toggling item in permits:`, error);
            }
        }
    }

    setFormData(prev => ({
        ...prev,
        safetyLogistics: prev.safetyLogistics.map(category => {
            if (category.id === categoryId && category.type === 'selectableList') {
                return {
                    ...category,
                    items: category.items.map(item => 
                        item.id === itemId ? { ...item, selected: !item.selected } : item
                    )
                };
            }
            return category;
        })
    }));
  }, [formData]);

  const handleAddCustomSafetyItem = useCallback(async (categoryId, itemName) => {
    const newItem = {
        id: `custom-${Date.now()}`,
        name: itemName,
        selected: true,
    };

    if (categoryId === 'permits') {
        try {
            await setDoc(doc(db, 'permits', newItem.id), newItem);
        } catch (error) {
            console.error(`Error adding custom item to permits:`, error);
        }
    }

    setFormData(prev => ({
        ...prev,
        safetyLogistics: prev.safetyLogistics.map(category => {
            if (category.id === categoryId && category.type === 'selectableList') {
                return { ...category, items: [...category.items, newItem] };
            }
            return category;
        })
    }));
  }, []);

  const handleAddNewSafetyCategory = useCallback(({ title, type }) => {
    const newCategoryId = title.toLowerCase().replace(/[^a-z0-9]/g, '');
    const newCategory = {
        id: newCategoryId,
        title,
        type,
        items: type === 'selectableList' ? [] : undefined,
        details: type === 'textArea' ? '' : undefined,
        question: type === 'booleanWithText' ? '...' : undefined,
        enabled: type === 'booleanWithText' ? true : undefined,
    };
    setFormData(prev => ({ ...prev, safetyLogistics: [...prev.safetyLogistics, newCategory] }));
  }, []);
  const handleCreateAndAddTask = async ({ title, description }) => {
    // --- START: New logic to calculate the order number ---
    // Get all current order numbers, defaulting to 0 if one doesn't exist.
    const existingOrders = Object.values(allTasks).map(task => task.order || 0);
    // Find the highest number, or start from 0 if no tasks exist.
    const maxOrder = Math.max(0, ...existingOrders);
    // The new order will be the next number in the sequence.
    const newOrder = maxOrder + 1;
    // --- END: New logic ---

    const newTaskId = `task_${Date.now()}`;
    const newTaskData = {
      title: title,
      order: newOrder, // Add the new order number to the data object
      options: {
        default: {
          name: "Default",
          description: description
        }
      }
    };
    
    try {
      await setDoc(doc(db, "standardTasks", newTaskId), newTaskData);
      
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
  
  const handleTaskOptionChange = useCallback((uniqueId, newOptionKey) => {
    setFormData(prev => {
        const newTasks = prev.selectedTasks.map(task => {
            if (task.id === uniqueId) {
                const taskInfo = allTasks[task.taskId];
                const newDescription = taskInfo.defaultDescription || taskInfo.options[newOptionKey]?.description || '';
                return { ...task, selectedOption: newOptionKey, description: newDescription };
            }
            return task;
        });
        return { ...prev, selectedTasks: newTasks };
    });
  }, [allTasks]);
  
  const handleTaskDescriptionChange = useCallback((uniqueId, newDescription) => {
    setFormData(prev => ({
        ...prev,
        selectedTasks: prev.selectedTasks.map(task => 
            task.id === uniqueId ? { ...task, description: newDescription } : task
        )
    }));
  }, []);

  // Handle updating the default description for a task type
  const handleUpdateTaskDefault = useCallback((taskId, uniqueId) => {
    // Find the current task's description
    const currentTask = formData?.selectedTasks?.find(task => task.id === uniqueId);
    if (!currentTask || !formData) {
      console.error('Cannot update default: task or formData not found');
      return;
    }

    // Update the default description in allTasks
    setAllTasks(prev => ({
      ...prev,
      [taskId]: {
        ...prev[taskId],
        defaultDescription: currentTask.description
      }
    }));

    // Show confirmation
    alert(`Default description updated for "${allTasks[taskId]?.title || 'this task'}".\nNew tasks of this type will use this description.`);
  }, [formData, allTasks]);

  // Handle image upload for tasks
  // Handle image upload with optimization for PDF generation
  const handleTaskImageUpload = useCallback((uniqueId, files) => {
    const fileArray = Array.from(files);
    const maxFileSize = 2 * 1024 * 1024; // Reduced to 2MB for PDF compatibility
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    // Validate files
    for (const file of fileArray) {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not a supported image format. Please use JPG, PNG, GIF, or WebP.`);
        return;
      }
      if (file.size > maxFileSize) {
        alert(`File "${file.name}" is too large. Please use images under 2MB for PDF compatibility.`);
        return;
      }
    }

    // Function to compress and resize image
    const compressImage = (file) => {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
          // Calculate new dimensions (max 800px width, maintain aspect ratio)
          const maxWidth = 800;
          const maxHeight = 600;
          let { width, height } = img;
          
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
          
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
          
          canvas.width = width;
          canvas.height = height;
          
          // Draw and compress
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to compressed JPEG with 0.8 quality for PDF compatibility
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: file.name,
            dataUrl: compressedDataUrl,
            size: Math.round(compressedDataUrl.length * 0.75), // Approximate size
            type: 'image/jpeg' // Standardize to JPEG for PDF
          });
        };
        
        // Create object URL for the image
        img.src = URL.createObjectURL(file);
      });
    };

    // Convert and compress all files
    const promises = fileArray.map(compressImage);

    Promise.all(promises).then(images => {
      setFormData(prev => ({
        ...prev,
        selectedTasks: prev.selectedTasks.map(task => 
          task.id === uniqueId 
            ? { ...task, images: [...(task.images || []), ...images] }
            : task
        )
      }));
    });
  }, []);

  // Handle image removal
  const handleTaskImageRemove = useCallback((uniqueId, imageId) => {
    setFormData(prev => ({
      ...prev,
      selectedTasks: prev.selectedTasks.map(task => 
        task.id === uniqueId 
          ? { ...task, images: (task.images || []).filter(img => img.id !== imageId) }
          : task
      )
    }));
  }, []);
  
  const handleOnDragEnd = useCallback((result) => {
      if (!result.destination) return;
      setFormData(prev => {
        const items = Array.from(prev.selectedTasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        return {...prev, selectedTasks: items};
      });
  }, []);
  
  const handleAddNewOption = (taskId, newOption) => {
      const newKey = `custom_${Date.now()}`;
      setAllTasks(prev => {
          const updatedTasks = { ...prev };
          updatedTasks[taskId].options[newKey] = newOption;
          return updatedTasks;
      });
      setFormData(prev => {
        const newSelectedTasks = prev.selectedTasks.map(task => 
            task.taskId === taskId ? { ...task, selectedOption: newKey, description: newOption.description } : task
        );
        return { ...prev, selectedTasks: newSelectedTasks };
    });
  };

  const handleSelectTeamMember = (memberId) => {
    const selectedMember = dbTeamMembers.find(m => m.id === memberId);
    if (selectedMember) {
      setFormData(prev => ({
        ...prev,
        projectTeam: [...prev.projectTeam, { ...selectedMember }]
      }));
    }
  };

  const handleProjectTeamChange = useCallback(async (index, field, value) => {
    const updatedMember = { ...formData.projectTeam[index], [field]: value };
    setFormData(prev => {
      const updatedTeam = [...prev.projectTeam];
      updatedTeam[index] = updatedMember;
      return { ...prev, projectTeam: updatedTeam };
    });
    if (updatedMember.id) {
      try {
        await setDoc(doc(db, 'teamMembers', updatedMember.id), updatedMember, { merge: true });
        setDbTeamMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
      } catch (error) {
        console.error("Error updating team member:", error);
      }
    }
  }, [formData]);

  const addTeamMember = async () => {
    const newId = Date.now().toString();
    const newMember = { id: newId, name: '', role: '', phone: '', competencies: '' };
    try {
      await setDoc(doc(db, 'teamMembers', newId), newMember);
      setDbTeamMembers(prev => [...prev, newMember]);
      setFormData(prev => ({
        ...prev,
        projectTeam: [...prev.projectTeam, newMember]
      }));
    } catch (error) {
      console.error("Error adding team member:", error);
    }
  };

  const removeTeamMember = useCallback(async (index) => {
    const member = formData.projectTeam[index];
    if (member.id) {
      try {
        await deleteDoc(doc(db, 'teamMembers', member.id));
        setDbTeamMembers(prev => prev.filter(m => m.id !== member.id));
      } catch (error) {
        console.error("Error removing team member:", error);
      }
    }
    setFormData(prev => {
      const updatedTeam = prev.projectTeam.filter((_, i) => i !== index);
      return { ...prev, projectTeam: updatedTeam };
    });
  }, [formData]);

  const handleAddNewRiskCategory = async ({ title }) => {
    if (!title.trim()) {
        alert("Category title cannot be empty.");
        return;
    }

    // Create a camelCase key from the title
    const newKey = title.trim()
        .toLowerCase()
        .replace(/\s+(.)/g, (match, chr) => chr.toUpperCase())
        .replace(/\s/g, '')
        .replace(/[^a-zA-Z0-9]/g, '');

    if (formData.risks[newKey] || allRisks[newKey]) {
        alert("A risk category with this name already exists. Please choose a different title.");
        return;
    }

    const newRiskCategory = {
        title: title.trim(),
        hazards: []
    };

    try {
        // Update Firestore
        await setDoc(doc(db, "riskAssessments", newKey), newRiskCategory);

        // Update local state
        setFormData(prev => ({ ...prev, risks: { ...prev.risks, [newKey]: newRiskCategory } }));
        setAllRisks(prev => ({ ...prev, [newKey]: newRiskCategory }));

        setShowNewRiskCategoryForm(false);
    } catch (error) {
        console.error("Error adding new risk category:", error);
        alert("Failed to add new risk category. Please check the console for details.");
    }
  };

  const handleAddNewHazard = async (riskKey, newHazardData) => {
    const riskCategory = formData.risks[riskKey];
    if (!riskCategory) {
        console.error("Risk category not found:", riskKey);
        alert("Risk category not found.");
        return;
    }

    const newHazard = {
        ...newHazardData,
        id: Date.now(), // Using timestamp for a simple unique ID
        selected: true, // New hazards are selected by default
    };

    const updatedHazards = [...riskCategory.hazards, newHazard];

    const updatedRiskCategory = { ...riskCategory, hazards: updatedHazards };

    try {
        const docRef = doc(db, "riskAssessments", riskKey);
        await setDoc(docRef, updatedRiskCategory, { merge: true });

        setAllRisks(prev => ({ ...prev, [riskKey]: updatedRiskCategory }));
        setFormData(prev => ({ ...prev, risks: { ...prev.risks, [riskKey]: updatedRiskCategory } }));

        setAddingHazardTo(null); // Close the form
    } catch (error) {
        console.error("Error adding new hazard:", error);
        alert("Failed to add new hazard. Please check the console for details.");
    }
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

  const handleSelectableListToggle = useCallback(async (listName, itemId) => {
    const itemToUpdate = formData[listName].find(item => item.id === itemId);
    if (!itemToUpdate) return;
    const newSelectedState = !itemToUpdate.selected;
    try {
      await setDoc(doc(db, listName, itemId), { selected: newSelectedState }, { merge: true });
      setFormData(prev => ({
        ...prev,
        [listName]: prev[listName].map(item =>
          item.id === itemId ? { ...item, selected: newSelectedState } : item
        )
      }));
    } catch (error) {
      console.error(`Error toggling item in ${listName}:`, error);
    }
  }, [formData]);

  const handleCustomItemChange = useCallback(async (listName, index, value) => {
    const itemToUpdate = formData[listName][index];
    const updatedItem = { ...itemToUpdate, name: value };
    try {
      await setDoc(doc(db, listName, itemToUpdate.id), updatedItem, { merge: true });
      setFormData(prev => {
          const newList = [...prev[listName]];
          newList[index] = updatedItem;
          return { ...prev, [listName]: newList };
      });
    } catch (error) {
      console.error(`Error updating custom item in ${listName}:`, error);
    }
  }, [formData]);

  const addCustomItem = useCallback(async (listName, name) => {
    const newItem = { id: `custom-${Date.now()}`, name: name || '', selected: true, isCustom: true };
       try {
      await setDoc(doc(db, listName, newItem.id), newItem);
      setFormData(prev => ({
          ...prev,
          [listName]: [...prev[listName], newItem]
      }));
    } catch (error) {
      console.error(`Error adding custom item to ${listName}:`, error);
    }
  }, []);

  const removeCustomItem = useCallback(async (listName, id) => {
    try {
      await deleteDoc(doc(db, listName, id));
      setFormData(prev => ({ ...prev, [listName]: prev[listName].filter(item => item.id !== id) }));
    } catch (error) {
      console.error(`Error removing custom item from ${listName}:`, error);
    }
  }, []);

  const TOTAL_STEPS = 7;
  const nextStep = () => setStep(s => Math.min(s + 1, TOTAL_STEPS));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  if (isLoading || !formData) {
      return <div className="text-center p-12">Loading RAMS Generator...</div>
  }

  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={formData} handler={handleInputChange} />;
      case 2: return <Step2 data={formData} onChange={handleProjectTeamChange} onAdd={addTeamMember} onRemove={removeTeamMember} dbTeamMembers={dbTeamMembers} onSelectMember={handleSelectTeamMember} />;
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
            setShowNewTaskForm,     // Add this
            handleTaskImageUpload,
            handleTaskImageRemove,
            handleUpdateTaskDefault
          }}
          showNewTemplateForm={showNewTemplateForm}
          showNewTaskForm={showNewTaskForm} // And pass this state
        />;
      case 4: return <Step4 
          data={formData} 
          handlers={{
              handleRiskToggle,
              setAddingHazardTo,
              handleAddNewHazard,
              setShowNewRiskCategoryForm,
              handleAddNewRiskCategory
          }} 
          addingHazardTo={addingHazardTo}
          showNewRiskCategoryForm={showNewRiskCategoryForm}
        />;
      case 5: return <Step5 
          data={formData} 
          handlers={{
            handleSafetyLogisticsChange,
            handleSafetyListItemToggle,
            handleAddCustomSafetyItem,
            handleAddNewSafetyCategory,
            handleInputChange
          }} 
        />;
      case 6: return <Step6 data={formData} handlers={{ handleSelectableListToggle, handleAddCustomSafetyItem: addCustomItem, handleCustomItemChange, removeCustomItem, handleInputChange }} />;
     
      case 7: return <Step7 previewHandler={handlePreview} />;
      default: return <Step1 data={formData} handler={handleInputChange} />;
    }
  };

  const progressLabels = ["Project", "Team", "Method", "Risks", "Safety", "Equipment", "Generate"];

  const handlePreview = () => {
    setShowPreview(true); // Open the modal
  };

  return (
    <>
      <div className="main-content bg-slate-100 font-sans text-slate-800 min-h-screen" style={{'--uctel-orange': '#d88e43', '--uctel-teal': '#008080', '--uctel-blue': '#2c4f6b'}}>
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
                <button onClick={handlePreview} className="bg-[var(--uctel-teal)] text-white font-semibold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors">Preview Document</button>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Render the modal outside the main layout */}
      <PreviewModal 
        isOpen={showPreview} 
        onClose={() => setShowPreview(false)} 
        data={formData} 
        allTasks={allTasks} 
      />
    </>
  );
};

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<AppContent />} />
      {/* The /preview route is no longer needed */}
      {/* <Route path="/preview" element={<PreviewPage />} /> */}
    </Routes>
  </Router>
);

export default App;
