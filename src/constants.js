export const RISK_ASSESSMENTS = {
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
  export const DEFAULT_PERMITS = [
      { id: 1, name: "Working at Height Permit", selected: true },
      { id: 2, name: "Power Tools Permit", selected: true },
      { id: 3, name: "Hand Tools (HAVS) Permit", selected: true },
      { id: 4, name: "Manual Handling Permit", selected: true },
      { id: 5, name: "Dust Exposure (Drilling Activities) Permit", selected: true },
      { id: 6, name: "Noise Exposure (Drilling Activities) Permit", selected: true },
  ];
  export const DEFAULT_PPE = [
      { id: 1, name: "High Visibility Jacket or Vest - Conforming to BS EN ISO 20471", selected: true },
      { id: 2, name: "Safety Boots - Conforming to BS EN ISO 20345", selected: true },
      { id: 3, name: "Cut-Resistant Gloves - Level 5, conforming to BS EN 388:2016 + A1:2018", selected: true },
      { id: 4, name: "Safety Goggles/Glasses - Conforming to BS EN 166", selected: true },
      { id: 5, name: "Safety Helmet - Conforming to BS EN 397", selected: true },
      { id: 6, name: "FFP Respiratory Mask with P3 Filters - Conforming to BS EN 149", selected: true },
  ];
  export const DEFAULT_TOOLS = [
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
  export const DEFAULT_MATERIALS = [
      { id: 1, name: "CEL-FI Hardware", selected: true },
      { id: 2, name: "Donor Antennas (for signal capture)", selected: true },
      { id: 3, name: "Indoor OMNI Antenna (for distribution of signal)", selected: true },
      { id: 4, name: "LMR400 Coaxial Cable (for DAS connections)", selected: true },
      { id: 5, name: "Mounting Pole and Bracket (External)", selected: true },
      { id: 6, name: "Cable Ties / Clips", selected: true },
      { id: 7, name: "Weatherproof Tape and Coaxial Sealant", selected: true },
  ];