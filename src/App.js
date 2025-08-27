import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, setDoc, onSnapshot, query } from 'firebase/firestore';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// PRE-POPULATED DATA & TEMPLATES
// In a real application, you would move this data to your Firebase Firestore
// database to manage it without changing the code.
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const JOB_TEMPLATES = {
  "CEL-FI": {
    description: "CEL-FI Mobile Signal Booster Installation.",
    methodStatement: `1-Sequence / Scope of Works:
Installation of a CEL-FI GO G41 distributed antenna system (DAS) to improve in-building mobile coverage. The works include:
1.1 Donor antenna mounted within the ceiling void.
1.2 Network Unit (NU) installation in the ceiling void.
1.3 LMR 400 coaxial cable routing and termination.
1.4 OMNI Antennas mounted in the ceiling void.
1.5 Testing, commissioning and handover.

2-Key Project Stages:
2.1 Pre Start: Site induction, access arrangements, permit-to-work approvals.
2.2 Donor Antenna Installation: Safe access, donor antenna mounting.
2.3 Internal Installation: NU mounting, cable routing, OMNI Antenna mounting, termination, labelling.
2.4 Electrical Connection: Powering of NU from designated socket.
2.5 System Commissioning: System tuning for optimal performance.
2.6 Handover: As Built document (including details of the installation and signal readings) shared with the client.

3-Method Statement (Pre-Start):
3.1 Conduct site-specific induction.
3.2 Review RAMS and sign acknowledgement.
3.3 Confirm access routes and access hours (as per survey assumptions).
3.4 Liaise with building management.

4-Method Statement - Donor Antenna Installation:
4.1 Access via approved route with permit-to-work.
4.2 Mark and fix mounting bracket to designated location.
4.3 Secure donor antenna with appropriate fixings.

5-Method Statement - Network Unit (NU) Installation:
5.1 Mount NU in ceiling void as per survey recommendation.
5.2 Terminate and connect donor antenna cables.
5.3 Provide power from designated socket.

6-Method Statement - OMNI Antenna Installation:
6.1 Fix antennas using manufacturer-supplied bracket to existing containment.
6.2 Terminate and connect coaxial cable to antennas.

7-Method Statement - Testing and Commissioning:
7.1 Power up NU.
7.2 Optimise donor signal gain.
7.3 Test the floor for adequate coverage using analysis tools.
7.4 Record final signal levels.

8-Method Statement - Handover:
8.1 Remove tools and place waste in bins on-site (if agreed).
8.2 Restore any disturbed finishes.
8.3 As Built document shared with the client.`
  },
  "NetworkCabling": {
    description: "Structured network cabling installation.",
    methodStatement: "1-Sequence / Scope of Works:\nInstallation of Cat6/Cat6a network cabling...\n..."
  }
};

const RISK_ASSESSMENTS = {
  workAtHeight: {
    title: "Work at Height",
    hazards: [
      { id: 1, hazard: "Falling from height", who: "Workers can suffer serious injury or death by falling from ladders or rooftops", controls: "Safety harnesses for workers. Ladders inspected before use. Proper signage and supervision. Work at height training given to engineers.", selected: true },
      { id: 2, hazard: "Falling objects", who: "Workers or passersby could be injured by tools or materials falling from height", controls: "Use of tool lanyards. Controlled access areas below work zones. Use of physical barriers and exclusion zones.", selected: true },
      { id: 3, hazard: "Slipping or tripping at height", who: "Workers can slip or trip due to uneven surfaces, wet floors, or improper footwear, leading to falls", controls: "Ensure all surfaces are clear and dry. Regular inspections of work areas. Areas cleared consistently of materials or rubbish.", selected: false },
      { id: 4, hazard: "Equipment failure", who: "Ladders or safety harnesses may fail, leading to falls or serious injuries", controls: "Regular inspection and maintenance of all equipment and use of recorded inspection logs. Use of certified equipment only. Proper storage and handling of equipment.", selected: true },
    ]
  },
  manualHandling: {
    title: "Manual Handling",
    hazards: [
      { id: 1, hazard: "Incorrect Lifting Techniques", who: "All Staff - Risk of back/musculoskeletal injuries", controls: "Manual Handling Procedures In Place - Manual Handling Training Given To Engineers", selected: true },
      { id: 2, hazard: "Heavy Load", who: "Employees/Back injuries, muscle strains", controls: "Training on proper lifting techniques", selected: true },
      { id: 3, hazard: "Bulky Load", who: "Employees/Strains, sprains, and risk of dropping the load", controls: "Use of team lifting", selected: false },
      { id: 4, hazard: "Sharp/Pointed Load", who: "Employees/Cuts, punctures, abrasions", controls: "Use of protective gloves, covering sharp edges", selected: true },
    ]
  }
};

const DEFAULT_PPE = ["Hi-Vis Jacket (BS EN ISO 20471)", "Safety Boots (BS EN ISO 20345)", "Level 5 Cut Resistant Gloves (BS EN 388:2016+A1:2018)", "Safety Goggles/Glasses (BS EN 166)"];
const DEFAULT_TOOLS = ["BS EN 131 Ladders", "Hand Tools (screwdrivers, spanners, cable cutters, crimping tools)", "Cable Pulling Aids (rods, reels)", "Battery Drill"];
const DEFAULT_MATERIALS = ["LMR 400 Coaxial Cable", "Jumper Cables", "Splitters", "Connectors", "Cable Ties / Clips", "Donor Antenna", "OMNI Antennas"];

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Main Application Component
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
export default function App() {
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Firebase Setup State
  // This section initializes and manages the connection to your Firebase project.
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [savedRAMS, setSavedRAMS] = useState([]);
  
  // This effect runs once on component mount to set up Firebase
  useEffect(() => {
    // These global variables are provided by the deployment environment and attached to the window.
    // We check if they exist. If not, we're running locally.
    const isDeployed = typeof window.__firebase_config !== 'undefined';
    let firebaseConfig;

    if (isDeployed) {
        try {
            firebaseConfig = JSON.parse(window.__firebase_config);
        } catch (error) {
            console.error("Error parsing Firebase config:", error);
            return; // Stop if config is invalid
        }
    } else {
        // --- LOCAL DEVELOPMENT ONLY ---
        console.warn("Firebase config not found. Running in local mode. Firestore saving is disabled.");
    }
    
    if (firebaseConfig) {
        const app = initializeApp(firebaseConfig);
        const firestore = getFirestore(app);
        const authInstance = getAuth(app);
        setDb(firestore);
        setAuth(authInstance);

        onAuthStateChanged(authInstance, async (user) => {
            if (user) {
                setUserId(user.uid);
            } else {
                try {
                    const token = typeof window.__initial_auth_token !== 'undefined' ? window.__initial_auth_token : null;
                    if (token) {
                        await signInWithCustomToken(authInstance, token);
                    } else {
                        await signInAnonymously(authInstance);
                    }
                } catch (error) {
                    console.error("Error signing in:", error);
                }
            }
            setIsAuthReady(true);
        });
    } else {
        // If no config, we are in local mode without saving capabilities.
        setIsAuthReady(true); // Set to true to render the UI correctly in local mode
    }
  }, []);

  // This effect listens for changes in the saved RAMS documents in Firestore
  useEffect(() => {
    // Only run this if we are connected to Firebase
    if (isAuthReady && db && userId) {
      const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
      const privateCollectionPath = `artifacts/${appId}/users/${userId}/rams`;
      
      const q = query(collection(db, privateCollectionPath));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const ramsList = [];
        querySnapshot.forEach((doc) => {
          ramsList.push({ id: doc.id, ...doc.data() });
        });
        setSavedRAMS(ramsList);
      }, (error) => {
        console.error("Error fetching RAMS documents: ", error);
      });

      return () => unsubscribe(); // Cleanup listener on component unmount
    }
  }, [isAuthReady, db, userId]);


  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Application State
  // Manages the current step in the wizard and all the data for the RAMS document.
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const [step, setStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1
    client: 'The AA',
    siteAddress: 'Bluefin, 110 Southwark Street, SE1 OSU',
    siteContactName: 'Sabir Tahiri',
    siteContactEmail: 'sabir.tahiri@theaa.com',
    preparedBy: 'James Smith',
    preparedByEmail: 'james.smith@uctel.co.uk',
    // Step 2
    jobType: 'CEL-FI',
    projectDescription: JOB_TEMPLATES['CEL-FI'].description,
    methodStatement: JOB_TEMPLATES['CEL-FI'].methodStatement,
    // Step 3
    risks: {
      workAtHeight: JSON.parse(JSON.stringify(RISK_ASSESSMENTS.workAtHeight)),
      manualHandling: JSON.parse(JSON.stringify(RISK_ASSESSMENTS.manualHandling)),
    },
    // Step 4
    ppe: [...DEFAULT_PPE],
    tools: [...DEFAULT_TOOLS],
    materials: [...DEFAULT_MATERIALS],
    // Step 5
    wasteStatement: 'Packaging, cable offcuts, and debris will be collected and disposed of responsibly. Segregation of recyclable and general waste will be observed where facilities exist.',
    thirdPartySafety: 'Work areas will be barriered or cordoned off where possible. Warning signage will be displayed. Tools, leads, and cables will be managed to avoid creating trip hazards.',
    emergencyAandE: 'St Thomas\' Hospital, Westminster Bridge Road, London, SE1 7EH',
  });

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Handler Functions
  // These functions update the state when the user interacts with the form.
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleJobTypeChange = (e) => {
    const jobType = e.target.value;
    const template = JOB_TEMPLATES[jobType];
    setFormData(prev => ({
      ...prev,
      jobType,
      projectDescription: template.description,
      methodStatement: template.methodStatement,
    }));
  };

  const handleRiskToggle = (riskKey, hazardId) => {
    setFormData(prev => {
      const newRisks = { ...prev.risks };
      const hazard = newRisks[riskKey].hazards.find(h => h.id === hazardId);
      if (hazard) {
        hazard.selected = !hazard.selected;
      }
      return { ...prev, risks: newRisks };
    });
  };

  const handleListChange = (listName, index, value) => {
    setFormData(prev => {
      const newList = [...prev[listName]];
      newList[index] = value;
      return { ...prev, [listName]: newList };
    });
  };

  const addListItem = (listName) => {
    setFormData(prev => ({ ...prev, [listName]: [...prev[listName], ''] }));
  };

  const removeListItem = (listName, index) => {
    setFormData(prev => ({ ...prev, [listName]: prev[listName].filter((_, i) => i !== index) }));
  };

  const nextStep = () => setStep(s => s + 1);
  const prevStep = () => setStep(s => s - 1);
  const startOver = () => {
    setStep(1);
    // Reset to initial state if needed
  };

  const saveToFirebase = async () => {
    if (!db || !userId) {
      console.error("Firestore is not initialized or user is not authenticated.");
      // Using a custom message box instead of alert
      // In a real app, you'd have a modal component for this.
      const messageBox = document.createElement('div');
      messageBox.textContent = 'Cannot save: Not connected to the database. This feature is only available in the deployed version.';
      messageBox.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); background:red; color:white; padding:15px; border-radius:8px; z-index:1000;';
      document.body.appendChild(messageBox);
      setTimeout(() => document.body.removeChild(messageBox), 3000);
      return;
    }
    setIsSaving(true);
    try {
      const appId = typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';
      // Use a private collection path per user
      const privateCollectionPath = `artifacts/${appId}/users/${userId}/rams`;
      
      const docRef = await addDoc(collection(db, privateCollectionPath), {
        ...formData,
        createdAt: new Date().toISOString(),
      });
      console.log("Document written with ID: ", docRef.id);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setIsSaving(false);
  };
  
  const loadRAMS = (data) => {
    // A simple way to load data. A more robust solution would handle data structure changes.
    setFormData(prev => ({...prev, ...data}));
    setStep(1); // Go back to the first step to review the loaded data
  }

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Render Logic
  // This section determines which part of the wizard to display based on the current step.
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={formData} handler={handleInputChange} />;
      case 2: return <Step2 data={formData} handler={handleInputChange} jobTypeHandler={handleJobTypeChange} />;
      case 3: return <Step3 data={formData} handler={handleRiskToggle} />;
      case 4: return <Step4 data={formData} listHandler={handleListChange} addHandler={addListItem} removeHandler={removeListItem} />;
      case 5: return <Step5 data={formData} handler={handleInputChange} />;
      case 6: return <Step6 data={formData} />;
      default: return <Step1 data={formData} handler={handleInputChange} />;
    }
  };

  return (
    <div className="bg-slate-50 font-sans text-slate-800 min-h-screen">
      <div className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900">RAMS Generator</h1>
          <p className="text-slate-600 mt-2">A step-by-step wizard to create your Risk Assessment and Method Statements.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-lg">
            {renderStep()}
            
            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
              <div>
                {step > 1 && step < 6 && <button onClick={prevStep} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">Back</button>}
              </div>
              <div>
                {step < 5 && <button onClick={nextStep} className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">Next Step &rarr;</button>}
                {step === 5 && <button onClick={nextStep} className="bg-green-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-green-700 transition-colors">Review Document</button>}
                {step === 6 && (
                  <div className="flex gap-4">
                    <button onClick={startOver} className="bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">Start Over</button>
                    <button onClick={saveToFirebase} disabled={isSaving || !db} className="bg-indigo-600 text-white font-semibold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-indigo-300 disabled:cursor-not-allowed flex items-center">
                      {isSaving ? 'Saving...' : 'Save to Firebase'}
                    </button>
                  </div>
                )}
              </div>
            </div>
             {showSuccess && <div className="mt-4 text-center bg-green-100 text-green-800 p-3 rounded-lg">Successfully saved to Firebase!</div>}
          </div>

          <aside className="lg:col-span-1">
             <div className="bg-white p-6 rounded-2xl shadow-lg">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Saved RAMS</h3>
                { !db ? (
                    <p className="text-slate-500">Running in local mode. Connect to Firebase to see saved documents.</p>
                ) : !isAuthReady ? (
                    <p className="text-slate-500">Connecting to Firebase...</p>
                ) : savedRAMS.length === 0 ? (
                    <p className="text-slate-500">No saved documents found.</p>
                ) : (
                    <ul className="space-y-2">
                        {savedRAMS.map(rams => (
                            <li key={rams.id}>
                                <button onClick={() => loadRAMS(rams)} className="w-full text-left p-3 bg-slate-100 hover:bg-blue-100 rounded-lg transition-colors">
                                    <p className="font-semibold">{rams.client} - {rams.siteAddress}</p>
                                    <p className="text-sm text-slate-600">{new Date(rams.createdAt).toLocaleDateString()}</p>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
             </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Wizard Step Components
// Each component represents one step in the form.
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const FormSection = ({ title, children }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2 mb-6">{title}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
    <input type="text" id={name} name={name} value={value} onChange={onChange} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" />
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 4 }) => (
    <div className="flex flex-col md:col-span-2">
        <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"></textarea>
    </div>
);

const Step1 = ({ data, handler }) => (
  <div>
    <FormSection title="Step 1: Project & Site Details">
      <Input label="Client Name" name="client" value={data.client} onChange={handler} />
      <Input label="Site Address" name="siteAddress" value={data.siteAddress} onChange={handler} />
      <Input label="Site Contact Name" name="siteContactName" value={data.siteContactName} onChange={handler} />
      <Input label="Site Contact Email" name="siteContactEmail" value={data.siteContactEmail} onChange={handler} />
    </FormSection>
    <FormSection title="Document Control">
       <Input label="Prepared By" name="preparedBy" value={data.preparedBy} onChange={handler} />
       <Input label="Prepared By Email" name="preparedByEmail" value={data.preparedByEmail} onChange={handler} />
    </FormSection>
  </div>
);

const Step2 = ({ data, handler, jobTypeHandler }) => (
  <div>
    <FormSection title="Step 2: Job Details & Method Statement">
      <div className="flex flex-col md:col-span-2">
        <label htmlFor="jobType" className="mb-2 font-semibold text-slate-700">Select Job Template</label>
        <select id="jobType" name="jobType" value={data.jobType} onChange={jobTypeHandler} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition bg-white">
          {Object.keys(JOB_TEMPLATES).map(key => (
            <option key={key} value={key}>{JOB_TEMPLATES[key].description}</option>
          ))}
        </select>
      </div>
      <TextArea label="Project Description" name="projectDescription" value={data.projectDescription} onChange={handler} />
      <TextArea label="Method Statement / Sequence of Works" name="methodStatement" value={data.methodStatement} onChange={handler} rows={15} />
    </FormSection>
  </div>
);

const Step3 = ({ data, handler }) => (
  <div>
    <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2 mb-6">Step 3: Identify & Assess Risks</h2>
    <p className="mb-6 text-slate-600">Select the hazards that are relevant to this project. The standard controls are provided.</p>
    {Object.keys(data.risks).map(riskKey => {
      const risk = data.risks[riskKey];
      return (
        <div key={riskKey} className="mb-8 bg-slate-50 p-6 rounded-lg">
          <h3 className="text-xl font-bold mb-4">{risk.title}</h3>
          <div className="space-y-4">
            {risk.hazards.map(hazard => (
              <div key={hazard.id} className="flex items-start gap-4 p-4 border rounded-md">
                <input type="checkbox" checked={hazard.selected} onChange={() => handler(riskKey, hazard.id)} className="mt-1 h-5 w-5 text-blue-600 border-slate-300 rounded focus:ring-blue-500" />
                <div className="flex-1">
                  <p className="font-semibold">{hazard.hazard}</p>
                  <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Who/How:</span> {hazard.who}</p>
                  <p className="text-sm text-slate-600 mt-1"><span className="font-semibold">Controls:</span> {hazard.controls}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

const ListEditor = ({ title, listName, list, listHandler, addHandler, removeHandler }) => (
    <div className="mb-8 md:col-span-2">
        <h3 className="text-xl font-bold mb-4">{title}</h3>
        <div className="space-y-3">
            {list.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input type="text" value={item} onChange={(e) => listHandler(listName, index, e.target.value)} className="flex-grow p-2 border border-slate-300 rounded-lg" />
                    <button onClick={() => removeHandler(listName, index)} className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 transition-colors flex items-center justify-center font-bold">&times;</button>
                </div>
            ))}
        </div>
        <button onClick={() => addHandler(listName)} className="mt-4 bg-blue-100 text-blue-800 font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm">+ Add Item</button>
    </div>
);


const Step4 = ({ data, listHandler, addHandler, removeHandler }) => (
    <div>
        <h2 className="text-2xl font-bold text-slate-800 border-b-2 border-blue-500 pb-2 mb-6">Step 4: Equipment & Materials</h2>
        <p className="mb-6 text-slate-600">Confirm the Personal Protective Equipment (PPE), tools, and materials for this job. Default items are pre-loaded.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ListEditor title="Personal Protective Equipment (PPE)" listName="ppe" list={data.ppe} listHandler={listHandler} addHandler={addHandler} removeHandler={removeHandler} />
            <ListEditor title="Plant / Equipment / Tools" listName="tools" list={data.tools} listHandler={listHandler} addHandler={addHandler} removeHandler={removeHandler} />
            <ListEditor title="Materials" listName="materials" list={data.materials} listHandler={listHandler} addHandler={addHandler} removeHandler={removeHandler} />
        </div>
    </div>
);

const Step5 = ({ data, handler }) => (
  <div>
    <FormSection title="Step 5: Final Safety Details">
      <TextArea label="Waste Management" name="wasteStatement" value={data.wasteStatement} onChange={handler} />
      <TextArea label="Third-Party Safety" name="thirdPartySafety" value={data.thirdPartySafety} onChange={handler} />
      <TextArea label="Emergency Arrangements (Nearest A&E)" name="emergencyAandE" value={data.emergencyAandE} onChange={handler} />
    </FormSection>
  </div>
);

// The final review step. It displays all the collected data in a document format.
const Step6 = ({ data }) => (
  <div>
    <h2 className="text-3xl font-bold text-center mb-8">RAMS Document Preview</h2>
    <div className="space-y-8 bg-slate-50 p-6 rounded-lg border">
      
      <div className="p-4 border-b">
        <h3 className="text-xl font-bold">Site Details</h3>
        <p><strong>Client:</strong> {data.client}</p>
        <p><strong>Work Location:</strong> {data.siteAddress}</p>
        <p><strong>Site Contact:</strong> {data.siteContactName} ({data.siteContactEmail})</p>
      </div>

      <div className="p-4 border-b">
        <h3 className="text-xl font-bold">Project Description</h3>
        <p className="whitespace-pre-wrap">{data.projectDescription}</p>
      </div>

      <div className="p-4 border-b">
        <h3 className="text-xl font-bold">Method Statement / Sequence of Works</h3>
        <p className="whitespace-pre-wrap">{data.methodStatement}</p>
      </div>

      <div className="p-4 border-b">
        <h3 className="text-xl font-bold">Risk Assessments</h3>
        {Object.values(data.risks).filter(r => r.hazards.some(h => h.selected)).map(risk => (
          <div key={risk.title} className="mt-4">
            <h4 className="text-lg font-semibold underline">{risk.title}</h4>
            <table className="w-full mt-2 border-collapse border">
              <thead>
                <tr className="bg-slate-200">
                  <th className="border p-2 text-left">Hazard</th>
                  <th className="border p-2 text-left">Controls in Place</th>
                </tr>
              </thead>
              <tbody>
                {risk.hazards.filter(h => h.selected).map(hazard => (
                  <tr key={hazard.id}>
                    <td className="border p-2">{hazard.hazard}</td>
                    <td className="border p-2">{hazard.controls}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-b grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <h3 className="text-xl font-bold">PPE</h3>
          <ul className="list-disc list-inside">{data.ppe.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div>
          <h3 className="text-xl font-bold">Tools</h3>
          <ul className="list-disc list-inside">{data.tools.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
        <div>
          <h3 className="text-xl font-bold">Materials</h3>
          <ul className="list-disc list-inside">{data.materials.map((item, i) => <li key={i}>{item}</li>)}</ul>
        </div>
      </div>
      
       <div className="p-4">
        <h3 className="text-xl font-bold">Final Safety Details</h3>
        <p><strong>Waste:</strong> {data.wasteStatement}</p>
        <p><strong>Third-Party Safety:</strong> {data.thirdPartySafety}</p>
        <p><strong>Emergency A&E:</strong> {data.emergencyAandE}</p>
      </div>

    </div>
  </div>
);
