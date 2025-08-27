import React, { useState, useEffect } from 'react';

// NOTE: In a real-world scenario, Firebase would be initialized in a separate config file.
// For this self-contained component, we'll simulate the necessary imports.
// import { initializeApp } from 'firebase/app';
// import { getFirestore, collection, onSnapshot, query } from 'firebase/firestore';
// import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// ASSETS & STATIC DATA
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

// The logo is embedded directly into the code as a Base64 string to avoid path issues.
const uctelLogoBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAoAAAAFeCAYAAAD4erP5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAyNC0wNS0yMFQwODo1OTo0OCswMDowMLAL2ZYAAByiSURBVGEF7Z15vFTV+cf/s1/YQ0GgQGgRtb0g1tprpY1YjD62P2rU6qP1sfVRo7FmY4xJjD62xhhj9LGx1lhjL9Za6120FQRBEGkBRbYse+935syZc+bMmT17D/a+7/M5HjNn9t699549e/Z+17O+9j2rWCwW27ZtI5VKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZ-IZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZ-iVBORw0KG-iVBORw0KGgoAAAANSUhEUgAAAoAAAAFeCAYAAAD4erP5AAAAAXNSR0Iars4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAyNC0wNS0yMFQwODo1OTo0OCswMDowMLAL2ZYAAByiSURBVGEF7Z15vFTV+cf/s1/YQ0GgQGgRtb0g1tprpY1YjD62P2rU6qP1sfVRo7FmY4xJjD62xhhj9LGx1lhjL9Za6120FQRBEGkBRbYse+935syZc+bMmT17D/a+7/M5HjNn9t699549e/Z+17O+9j2rWCwW27ZtI5VKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZ-iVBORw0-iVBORw0KGgoAAAANSUhEUgAAAoAAAAFeCAYAAAD4erP5AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAhdEVYdENyZWF0aW9uIFRpbWUAMjAyNC0wNS0yMFQwODo1OTo0OCswMDowMLAL2ZYAAByiSURBVGEF7Z15vFTV+cf/s1/YQ0GgQGgRtb0g1tprpY1YjD62P2rU6qP1sfVRo7FmY4xJjD62xhhj9LGx1lhjL9Za6120FQRBEGkBRbYse+935syZc+bMmT17D/a+7/M5HjNn9t699549e/Z+17O+9j2rWCwW27ZtI5VKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZ-IZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZ-KIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVKIZVK-";

const JOB_TEMPLATES = {
  "CEL-FI": {
    name: "CEL-FI Mobile Signal Booster Installation",
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
2.6 Handover: As Built document (including details of the installation and signal readings) shared with the client.`
  },
  "NetworkCabling": {
    name: "Structured Network Cabling",
    description: "Structured network cabling installation.",
    methodStatement: `1-Sequence / Scope of Works:
Installation of Cat6/Cat6a network cabling infrastructure.
1.1 Cable containment installation (trunking, tray).
1.2 First fix cable pulling to designated locations.
1.3 Termination of network outlets and patch panels.
1.4 Full testing and certification of all links.
1.5 Labelling and documentation.

2-Key Project Stages:
2.1 Pre Start: Agree cable routes, confirm outlet locations, site induction.
2.2 Containment: Install all necessary trunking, tray work, and conduits.
2.3 Cable Pulling: Route cables from the comms room to each outlet location.
2.4 Termination: Terminate all cables at both ends.
2.5 Testing: Use a Fluke network tester to certify each link to standard.
2.6 Handover: Provide full test results and as-built drawings.`
  }
};

const RISK_ASSESSMENTS = {
  workAtHeight: {
    title: "Work at Height",
    hazards: [
      { id: 1, hazard: "Falling from height", who: "Workers can suffer serious injury or death.", controls: "Safety harnesses, ladders inspected, supervision, training provided.", initialLikelihood: 4, initialSeverity: 5, residualLikelihood: 1, residualSeverity: 5, selected: true },
      { id: 2, hazard: "Falling objects", who: "Workers or passersby could be injured.", controls: "Use of tool lanyards, controlled access areas, exclusion zones.", initialLikelihood: 3, initialSeverity: 4, residualLikelihood: 2, residualSeverity: 3, selected: true },
      { id: 3, hazard: "Slipping or tripping at height", who: "Workers can slip or trip due to uneven surfaces, wet floors, or improper footwear, leading to falls.", controls: "Ensure all surfaces are clear and dry. Regular inspections of work areas.", initialLikelihood: 3, initialSeverity: 5, residualLikelihood: 2, residualSeverity: 4, selected: false },
      { id: 4, hazard: "Equipment failure", who: "Ladders or safety harnesses may fail, leading to falls or serious injuries.", controls: "Regular inspection and maintenance of all equipment. Use of certified equipment only.", initialLikelihood: 2, initialSeverity: 5, residualLikelihood: 1, residualSeverity: 5, selected: false },
    ]
  },
  manualHandling: {
    title: "Manual Handling",
    hazards: [
      { id: 1, hazard: "Incorrect Lifting", who: "All Staff - Risk of back/musculoskeletal injuries.", controls: "Manual Handling Procedures and Training provided.", initialLikelihood: 4, initialSeverity: 4, residualLikelihood: 2, residualSeverity: 3, selected: true },
      { id: 2, hazard: "Heavy Load", who: "Employees risk back injuries, muscle strains.", controls: "Training on proper lifting techniques, use of lifting aids.", initialLikelihood: 4, initialSeverity: 4, residualLikelihood: 2, residualSeverity: 4, selected: true },
      { id: 3, hazard: "Load with Unstable Centre of Gravity", who: "Load shifting during handling, causing falls or injuries.", controls: "Stabilising the load, use of trolleys or other supports.", initialLikelihood: 4, initialSeverity: 5, residualLikelihood: 2, residualSeverity: 4, selected: true },
      { id: 4, hazard: "Trips and Slips", who: "All Staff - Risk of injury due to trips and slips.", controls: "Aisles and Gangways Kept Clear For Good Housekeeping.", initialLikelihood: 3, initialSeverity: 3, residualLikelihood: 2, residualSeverity: 2, selected: false },
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
  const [formData, setFormData] = useState({
    client: 'iQ Student Accommodation',
    siteAddress: '120 Longwood Close, Coventry',
    projectDescription: JOB_TEMPLATES['CEL-FI'].description,
    commencementDate: '2025-09-01',
    preparedBy: 'James Smith',
    risks: JSON.parse(JSON.stringify(RISK_ASSESSMENTS)), // Deep copy
    ppe: [...DEFAULT_PPE],
    tools: [...DEFAULT_TOOLS],
    materials: [...DEFAULT_MATERIALS],
    methodStatement: JOB_TEMPLATES['CEL-FI'].methodStatement,
    jobTemplate: 'CEL-FI',
  });

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Handler Functions
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTemplateChange = (e) => {
    const templateKey = e.target.value;
    if (JOB_TEMPLATES[templateKey]) {
      setFormData(prev => ({
        ...prev,
        jobTemplate: templateKey,
        projectDescription: JOB_TEMPLATES[templateKey].description,
        methodStatement: JOB_TEMPLATES[templateKey].methodStatement,
      }));
    }
  };

  const handleRiskToggle = (riskKey, hazardId) => {
    setFormData(prev => {
      const newRisks = { ...prev.risks };
      const hazard = newRisks[riskKey].hazards.find(h => h.id === hazardId);
      if (hazard) { hazard.selected = !hazard.selected; }
      return { ...prev, risks: newRisks };
    });
  };

  const handleListChange = (listName, index, value) => {
    setFormData(prev => {
        const newList = [...prev[listName]];
        newList[index] = value;
        return {...prev, [listName]: newList};
    });
  };

  const handleAddItem = (listName) => {
    setFormData(prev => ({
        ...prev,
        [listName]: [...prev[listName], ""]
    }));
  };

  const handleRemoveItem = (listName, index) => {
    setFormData(prev => ({
        ...prev,
        [listName]: prev[listName].filter((_, i) => i !== index)
    }));
  };
  
  const nextStep = () => setStep(s => Math.min(s + 1, 5));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  // Render Logic
  // --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
  const renderStep = () => {
    switch (step) {
      case 1: return <Step1 data={formData} handler={handleInputChange} />;
      case 2: return <Step2 data={formData} handleInputChange={handleInputChange} handleTemplateChange={handleTemplateChange} handleTextAreaChange={handleTextAreaChange} />;
      case 3: return <Step3 data={formData} handler={handleRiskToggle} />;
      case 4: return <Step4 data={formData} onListChange={handleListChange} onAddItem={handleAddItem} onRemoveItem={handleRemoveItem} />;
      case 5: return <Step5 previewHandler={() => setShowPreview(true)} />;
      default: return <Step1 data={formData} handler={handleInputChange} />;
    }
  };

  return (
    <>
      <div className="bg-slate-100 font-sans text-slate-800 min-h-screen" style={{'--uctel-orange': '#d88e43', '--uctel-teal': '#008080', '--uctel-blue': '#2c4f6b'}}>
        <div className="container mx-auto p-4 md:p-8">
          <header className="text-center mb-8 flex flex-col items-center">
             <img src={uctelLogoBase64} alt="UCtel Logo" className="h-12 mb-4" />
            <h1 className="text-4xl font-bold text-[var(--uctel-blue)]">RAMS Generator</h1>
            <p className="text-slate-600 mt-2">A step-by-step wizard to create your Risk Assessment and Method Statements.</p>
          </header>
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
                <div className="flex justify-between mb-2 text-xs sm:text-sm">
                    <span className={`font-bold ${step >= 1 ? 'text-[var(--uctel-blue)]' : 'text-slate-400'}`}>Project</span>
                    <span className={`font-bold ${step >= 2 ? 'text-[var(--uctel-blue)]' : 'text-slate-400'}`}>Method</span>
                    <span className={`font-bold ${step >= 3 ? 'text-[var(--uctel-blue)]' : 'text-slate-400'}`}>Risks</span>
                    <span className={`font-bold ${step >= 4 ? 'text-[var(--uctel-blue)]' : 'text-slate-400'}`}>Equipment</span>
                    <span className={`font-bold ${step >= 5 ? 'text-[var(--uctel-blue)]' : 'text-slate-400'}`}>Generate</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5">
                    <div className="bg-[var(--uctel-teal)] h-2.5 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 4) * 100}%` }}></div>
                </div>
            </div>

            {renderStep()}
            
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
              <button onClick={prevStep} disabled={step === 1} className="bg-slate-200 text-slate-700 font-semibold py-2 px-6 rounded-lg hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Back</button>
              {step < 5 ? (
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
// Wizard Step Components
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const FormSection = ({ title, children, gridCols = 2 }) => (
  <div className="mb-8">
    <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">{title}</h2>
    <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-6`}>{children}</div>
  </div>
);

const Input = ({ label, name, value, onChange, type = 'text' }) => (
  <div className="flex flex-col">
    <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
    <input type={type} id={name} name={name} value={value} onChange={onChange} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition" />
  </div>
);

const TextArea = ({ label, name, value, onChange, rows = 8 }) => (
    <div className="flex flex-col md:col-span-2">
        <label htmlFor={name} className="mb-2 font-semibold text-slate-700">{label}</label>
        <textarea id={name} name={name} value={value} onChange={onChange} rows={rows} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition w-full"></textarea>
    </div>
);

const Step1 = ({ data, handler }) => (
  <div>
    <FormSection title="Step 1: Project Details">
      <Input label="Client Name" name="client" value={data.client} onChange={handler} />
      <Input label="Site Address" name="siteAddress" value={data.siteAddress} onChange={handler} />
      <Input label="Commencement Date" name="commencementDate" value={data.commencementDate} onChange={handler} type="date"/>
      <Input label="Prepared By" name="preparedBy" value={data.preparedBy} onChange={handler} />
    </FormSection>
  </div>
);

const Step2 = ({ data, handleTemplateChange, handleTextAreaChange }) => (
    <div>
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 2: Job Details & Method Statement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col md:col-span-2">
                <label htmlFor="jobTemplate" className="mb-2 font-semibold text-slate-700">Select Job Template</label>
                <select id="jobTemplate" name="jobTemplate" value={data.jobTemplate} onChange={handleTemplateChange} className="p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[var(--uctel-blue)] focus:border-[var(--uctel-blue)] transition">
                    {Object.keys(JOB_TEMPLATES).map(key => (
                        <option key={key} value={key}>{JOB_TEMPLATES[key].name}</option>
                    ))}
                </select>
            </div>
            <TextArea label="Project Description" name="projectDescription" value={data.projectDescription} onChange={handleTextAreaChange} rows={3} />
            <TextArea label="Method Statement / Sequence of Works" name="methodStatement" value={data.methodStatement} onChange={handleTextAreaChange} rows={12} />
        </div>
    </div>
);

const Step3 = ({ data, handler }) => (
  <div>
    <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 3: Identify Risks</h2>
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

const EditableList = ({ title, items, listName, onListChange, onAddItem, onRemoveItem }) => (
    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
        <h3 className="text-xl font-bold mb-4 text-slate-800">{title}</h3>
        <div className="space-y-2">
            {items.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                    <input 
                        type="text" 
                        value={item} 
                        onChange={(e) => onListChange(listName, index, e.target.value)}
                        className="flex-grow p-2 border border-slate-300 rounded-md"
                    />
                    <button onClick={() => onRemoveItem(listName, index)} className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>
                    </button>
                </div>
            ))}
        </div>
        <button onClick={() => onAddItem(listName)} className="mt-4 bg-blue-100 text-[var(--uctel-blue)] font-semibold py-2 px-4 rounded-lg hover:bg-blue-200 transition-colors text-sm">
            + Add Item
        </button>
    </div>
);

const Step4 = ({ data, onListChange, onAddItem, onRemoveItem }) => (
    <div>
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 4: Equipment & Materials</h2>
        <p className="mb-6 text-slate-600">Confirm the Personal Protective Equipment (PPE), tools, and materials for this job. Default items are pre-loaded.</p>
        <div className="space-y-6">
            <EditableList title="Personal Protective Equipment (PPE)" listName="ppe" items={data.ppe} onListChange={onListChange} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />
            <EditableList title="Plant / Equipment / Tools" listName="tools" items={data.tools} onListChange={onListChange} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />
            <EditableList title="Materials" listName="materials" items={data.materials} onListChange={onListChange} onAddItem={onAddItem} onRemoveItem={onRemoveItem} />
        </div>
    </div>
);


const Step5 = ({ previewHandler }) => (
    <div>
        <h2 className="text-2xl font-bold text-[var(--uctel-blue)] border-b-2 border-[var(--uctel-orange)] pb-2 mb-6">Step 5: Review & Generate</h2>
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
    
    const cellStyle = { border: '1px solid #ccc', width: '25px', height: '25px', textAlign: 'center', verticalAlign: 'middle', position: 'relative', fontSize: '10pt' };
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
                                    <td key={lik} style={{ ...cellStyle, backgroundColor: getCellColor(lik * sev), color: 'white' }}>
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
        h2: { fontSize: '14pt', fontWeight: 'bold', color: '#2c4f6b', marginTop: '25px', marginBottom: '15px', borderBottom: '2px solid #d88e43', paddingBottom: '8px' },
        section: { marginBottom: '20px', pageBreakInside: 'avoid' },
        p: { marginBottom: '8px', lineHeight: '1.4' },
        pre: { marginBottom: '10px', lineHeight: '1.4', whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '9pt' },
        ul: { paddingLeft: '20px', listStyle: 'disc' },
        li: { marginBottom: '5px' },
        riskTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px', fontSize: '9pt' },
        riskTableTh: { border: '1px solid #e2e8f0', padding: '8px', textAlign: 'left', backgroundColor: '#f1f5f9', fontWeight: 'bold', width: '120px' },
        riskTableTd: { border: '1px solid #e2e8f0', padding: '8px', textAlign: 'left', verticalAlign: 'top' },
        riskAssessmentContainer: { display: 'flex', gap: '20px', marginTop: '15px', pageBreakInside: 'avoid', padding: '16px', border: '1px solid #e2e8f0', borderRadius: '8px' },
        riskDetails: { flexGrow: 1 },
        riskMatrixGroup: { display: 'flex', flexDirection: 'column', gap: '15px', alignItems: 'center' },
        pageHeader: { position: 'absolute', top: '0', left: '0', right: '0', padding: '15mm 25mm 0 25mm' },
        pageFooter: { position: 'absolute', bottom: '0', left: '0', right: '0', padding: '0 25mm 15mm 25mm' },
        headerLine: { borderTop: '3px solid #008080', marginTop: '12px' },
        footerLine: { borderTop: '3px solid #008080', marginBottom: '8px' },
        footerText: { fontSize: '8pt', color: '#666', display: 'flex', justifyContent: 'space-between' },
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString + 'T00:00:00').toLocaleDateString('en-GB', options);
    };

    return (
        <div style={styles.page}>
            <div style={styles.pageHeader}>
                <img src={uctelLogoBase64} alt="UCtel Logo" style={{ height: '12mm', width: 'auto' }} />
                <div style={styles.headerLine}></div>
            </div>
            
            <div style={{ paddingTop: '25mm', paddingBottom: '25mm' }}>
                <h1 style={styles.h1}>Risk Assessment & Method Statement</h1>

                <div style={styles.section}>
                    <h2 style={styles.h2}>1.0 Document Control</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '10pt' }}>
                        <div>
                            <p><strong>Client:</strong> {data.client}</p>
                            <p><strong>Work Location:</strong> {data.siteAddress}</p>
                            <p><strong>Project:</strong> {data.projectDescription}</p>
                        </div>
                        <div>
                            <p><strong>Prepared By:</strong> {data.preparedBy}</p>
                            <p><strong>Date:</strong> {formatDate(data.commencementDate)}</p>
                        </div>
                    </div>
                </div>

                <div style={styles.section}>
                    <h2 style={styles.h2}>2.0 Method Statement</h2>
                    <pre style={styles.pre}>{data.methodStatement}</pre>
                </div>
                
                <div style={styles.section}>
                    <h2 style={styles.h2}>3.0 Risk Assessments</h2>
                    {Object.values(data.risks).map(risk => (
                        risk.hazards.filter(h => h.selected).map(hazard => (
                            <div key={hazard.id} style={{...styles.riskAssessmentContainer, marginBottom: '16px'}}>
                                <div style={styles.riskDetails}>
                                    <table style={styles.riskTable}>
                                        <tbody>
                                            <tr>
                                                <th style={styles.riskTableTh}>Hazard</th>
                                                <td style={styles.riskTableTd}><strong>{hazard.hazard}</strong> ({risk.title})</td>
                                            </tr>
                                            <tr>
                                                <th style={styles.riskTableTh}>Who/How Harmed</th>
                                                <td style={styles.riskTableTd}>{hazard.who}</td>
                                            </tr>
                                            <tr>
                                                <th style={styles.riskTableTh}>Controls</th>
                                                <td style={styles.riskTableTd}>{hazard.controls}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style={styles.riskMatrixGroup}>
                                    <RiskMatrix title="Initial" likelihood={hazard.initialLikelihood} severity={hazard.initialSeverity} />
                                    <RiskMatrix title="Residual" likelihood={hazard.residualLikelihood} severity={hazard.residualSeverity} />
                                </div>
                            </div>
                        ))
                    ))}
                </div>
                 <div style={{...styles.section, pageBreakBefore: 'always'}}>
                    <h2 style={styles.h2}>4.0 Required PPE, Tools & Materials</h2>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '30px', fontSize: '9pt' }}>
                        <div>
                            <h3 style={{fontWeight: 'bold', marginBottom: '8px'}}>Personal Protective Equipment (PPE)</h3>
                            <ul style={styles.ul}>
                                {data.ppe.filter(item => item.trim() !== '').map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                        <div>
                            <h3 style={{fontWeight: 'bold', marginBottom: '8px'}}>Tools & Equipment</h3>
                            <ul style={styles.ul}>
                                {data.tools.filter(item => item.trim() !== '').map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                         <div>
                            <h3 style={{fontWeight: 'bold', marginBottom: '8px'}}>Materials</h3>
                            <ul style={styles.ul}>
                                {data.materials.filter(item => item.trim() !== '').map(item => <li key={item}>{item}</li>)}
                            </ul>
                        </div>
                     </div>
                </div>

                 <div style={styles.section}>
                    <h2 style={styles.h2}>5.0 Approval & Sign-Off</h2>
                     <p style={{fontSize: '9pt', color: '#555', marginBottom: '40px'}}>This Risk Assessment and Method Statement (RAMS) has been reviewed and approved by the undersigned. By signing below, each party confirms that the contents of this RAMS have been read and understood, and all works will be carried out in accordance with the method statement and control measures detailed herein.</p>
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
