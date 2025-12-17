
import React, { useState, useEffect } from 'react';
import { GlobalSettings, StudentData, ParentDetailedInfo, SystemConfig } from '../types';
import { ALL_CLASSES_FLAT } from '../constants';

interface PupilManagementProps {
  students: StudentData[];
  setStudents: React.Dispatch<React.SetStateAction<StudentData[]>>;
  settings: GlobalSettings;
  onSettingChange: (key: keyof GlobalSettings, value: any) => void;
  onSave: () => void;
  systemConfig?: SystemConfig;
  onSystemConfigChange?: (config: SystemConfig) => void;
  isAdmin?: boolean;
}

type SubPortal = 
  | 'Registration Form'
  | 'Assessment Scheduling'
  | 'Result Entry & Placement'
  | 'Head Teacher Admission'
  | 'Class Enrolment List'
  | 'Question Bank Management';

const PupilManagement: React.FC<PupilManagementProps> = ({ students, setStudents, settings, onSettingChange, onSave, systemConfig, onSystemConfigChange, isAdmin = false }) => {
  
  // Define available portals based on role
  const availablePortals: SubPortal[] = isAdmin 
    ? [
        'Registration Form', 
        'Assessment Scheduling', 
        'Result Entry & Placement', 
        'Head Teacher Admission', 
        'Question Bank Management', 
        'Class Enrolment List'
      ]
    : [
        'Result Entry & Placement', 
        'Question Bank Management', 
        'Class Enrolment List'
      ];

  const [activePortal, setActivePortal] = useState<SubPortal>(availablePortals[0]);
  const [selectedClassTab, setSelectedClassTab] = useState<string>(ALL_CLASSES_FLAT[0]); // Default to first class
  
  // Ensure activePortal is valid when role changes
  useEffect(() => {
      if (!availablePortals.includes(activePortal)) {
          setActivePortal(availablePortals[0]);
      }
  }, [isAdmin]);

  // -- Bulk Upload State --
  const [pasteData, setPasteData] = useState("");
  
  // -- Registration State --
  const [newApplicant, setNewApplicant] = useState<Partial<StudentData>>({
      name: '',
      gender: 'Male',
      dob: '',
      specialNeeds: '',
      address: '', // Top level address
      admissionInfo: {
          receiptNumber: '',
          dateOfAdmission: new Date().toISOString().split('T')[0],
          othersName: '',
          homeTown: '',
          nationality: 'Ghanaian',
          region: '',
          religion: '',
          presentClass: '',
          classApplyingFor: selectedClassTab,
          lastSchool: '',
          father: { name: '', address: '', education: '', occupation: '', phone: '', religion: '', wivesCount: '' },
          mother: { name: '', address: '', education: '', occupation: '', phone: '', religion: '' },
          guardianDetailed: { name: '', address: '', education: '', occupation: '', phone: '', religion: '', relationship: '', dateGuardianBegan: '' },
          declaration: { parentName: '', wardName: '', signed: false, date: new Date().toISOString().split('T')[0] },
          livingWith: 'Both Parents'
      }
  });

  // Update registration class when tab changes
  useEffect(() => {
      setNewApplicant(prev => ({
          ...prev,
          admissionInfo: { ...prev.admissionInfo!, classApplyingFor: selectedClassTab }
      }));
  }, [selectedClassTab]);

  const isDaycareOrNursery = selectedClassTab.includes("Daycare") || selectedClassTab.includes("Nursery") || selectedClassTab.includes("Creche") || selectedClassTab.includes("D1") || selectedClassTab.includes("N1") || selectedClassTab.includes("N2");

  // -- Assessment State --
  const [selectedApplicantId, setSelectedApplicantId] = useState<number | null>(null);
  const [isTestViewOpen, setIsTestViewOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionBankPrintData, setQuestionBankPrintData] = useState<{group: string, set: string, content: string} | null>(null);
  
  // -- Helpers --
  // Filter applicants based on SELECTED CLASS TAB
  const applicants = students.filter(s => !s.admissionInfo?.generatedId && s.admissionInfo?.classApplyingFor === selectedClassTab); 
  
  // Enrolled for specific class
  const classEnrolled = students.filter(s => s.admissionInfo?.generatedId && s.admissionInfo?.classApplyingFor === selectedClassTab);

  // -- Auto Serial Generation --
  const generateAutoSerial = (targetClass: string) => {
      const year = new Date().getFullYear().toString().substring(2); // e.g. 25
      const classCode = targetClass.split(' ').map(w => w[0]).join('') + (targetClass.match(/\d+/) || [''])[0]; // e.g. Basic 1 -> B1
      
      const existingSerials = students.filter(s => 
          s.admissionInfo?.classApplyingFor === targetClass && 
          s.admissionInfo.testData?.serialNumber
      ).length;
      
      const sequence = (existingSerials + 1).toString().padStart(3, '0');
      return `${classCode}-${year}-${sequence}`;
  };

  // -- Stale Record Cleanup --
  const handleCleanupStale = () => {
      const today = new Date();
      const monthAgo = new Date(today);
      monthAgo.setMonth(today.getMonth() - 1);

      const staleIds = students.filter(s => !s.admissionInfo?.generatedId).filter(a => {
          const admitDate = new Date(a.admissionInfo?.dateOfAdmission || today);
          return admitDate < monthAgo;
      }).map(s => s.id);

      if (staleIds.length > 0) {
          if (confirm(`Found ${staleIds.length} stale applications older than 1 month. Delete them?`)) {
              setStudents(prev => prev.filter(s => !staleIds.includes(s.id)));
              alert("Stale records deleted.");
          }
      } else {
          alert("No stale records found.");
      }
  };

  const handleRegister = () => {
      if (!newApplicant.name || !newApplicant.admissionInfo?.classApplyingFor) {
          alert("First Name, Surname and Applying Class are required.");
          return;
      }
      
      if (!newApplicant.admissionInfo?.declaration?.signed) {
          alert("Parent declaration must be signed (checked) to proceed.");
          return;
      }

      const newId = Date.now(); // Temp ID
      const fullChildName = `${newApplicant.name} ${newApplicant.admissionInfo.othersName || ''}`.trim();

      const studentRecord: StudentData = {
          ...newApplicant as StudentData,
          id: newId,
          name: fullChildName,
          scores: {},
          scoreDetails: {},
          // Sync basic fields
          guardian: newApplicant.admissionInfo?.guardianDetailed?.name || newApplicant.admissionInfo?.father?.name,
          contact: newApplicant.admissionInfo?.father?.phone || newApplicant.admissionInfo?.mother?.phone,
          // Ensure address uses father's address as fallback if top level is empty
          address: newApplicant.address || newApplicant.admissionInfo?.father?.address
      };
      
      // Init test data
      if (studentRecord.admissionInfo) {
          studentRecord.admissionInfo.testData = {
              isScheduled: false,
              testDate: '',
              testTime: '',
              venue: '',
              invigilatorId: '',
              invigilatorName: '',
              status: 'Pending',
              scores: { handwriting: 0, spelling: 0, scriptScore: 0, total: 0 }
          };
      }

      setStudents([...students, studentRecord]);
      
      // Reset form core fields, keep class
      const defaultInfo = {
          receiptNumber: '',
          dateOfAdmission: new Date().toISOString().split('T')[0],
          othersName: '',
          homeTown: '',
          nationality: 'Ghanaian',
          region: '',
          religion: '',
          presentClass: '',
          classApplyingFor: selectedClassTab,
          lastSchool: '',
          father: { name: '', address: '', education: '', occupation: '', phone: '', religion: '', wivesCount: '' },
          mother: { name: '', address: '', education: '', occupation: '', phone: '', religion: '' },
          guardianDetailed: { name: '', address: '', education: '', occupation: '', phone: '', religion: '', relationship: '', dateGuardianBegan: '' },
          declaration: { parentName: '', wardName: '', signed: false, date: new Date().toISOString().split('T')[0] },
          livingWith: 'Both Parents' as any
      };

      setNewApplicant({
        name: '',
        gender: 'Male',
        dob: '',
        specialNeeds: '',
        address: '',
        admissionInfo: defaultInfo
      });

      alert("Application Registered Successfully.");
      setActivePortal('Assessment Scheduling');
  };

  const generateAutoMessage = (student: StudentData, updates: Partial<import('../types').AdmissionTestInfo>) => {
      const info = student.admissionInfo;
      const test = { ...info?.testData, ...updates };
      
      const parentName = info?.father?.name || info?.mother?.name || info?.guardianDetailed?.name || "Parent/Guardian";
      const pupilName = student.name;
      const serial = test.serialNumber || "[Serial]";
      const set = test.questionSet || "[Set]";
      const date = test.testDate || "[Date]";
      const venue = test.venue || "[Venue]";
      const duration = test.duration || "45 mins";

      return `Dear ${parentName}, your ward ${pupilName} (${serial}) is scheduled to write assessment test Set ${set} on ${date} at ${venue} for ${duration}.`;
  };

  const updateTestData = (id: number, updates: Partial<import('../types').AdmissionTestInfo>) => {
      setStudents(prev => prev.map(s => {
          if (s.id === id && s.admissionInfo) {
              const updatedTestData = { ...s.admissionInfo.testData, ...updates } as any;
              // Auto update message if relevant fields change
              if ((updates.testDate || updates.venue || updates.duration || updates.questionSet || updates.serialNumber) && !isDaycareOrNursery) {
                  updatedTestData.message = generateAutoMessage(s, updatedTestData);
              }

              return {
                  ...s,
                  admissionInfo: {
                      ...s.admissionInfo,
                      testData: updatedTestData
                  }
              };
          }
          return s;
      }));
  };

  const updateResultScore = (id: number, type: 'handwriting' | 'spelling' | 'scriptScore', val: string) => {
      const num = parseFloat(val) || 0;
      setStudents(prev => prev.map(s => {
          if (s.id === id && s.admissionInfo?.testData?.scores) {
              const currentScores = s.admissionInfo.testData.scores;
              const newScores = { ...currentScores, [type]: num };
              const total = newScores.handwriting + newScores.spelling + newScores.scriptScore;
              
              // Auto-decision logic
              let decision: any = 'Pending';
              if (total >= 70) decision = 'Skip to Higher';
              else if (total >= 50) decision = 'Retain';
              else decision = 'Repeat Lower';

              return {
                  ...s,
                  admissionInfo: {
                      ...s.admissionInfo,
                      testData: {
                          ...s.admissionInfo.testData,
                          scores: { ...newScores, total },
                          decision
                      } as any
                  }
              };
          }
          return s;
      }));
  };

  const submitResults = (id: number, serial: string) => {
      const student = students.find(s => s.id === id);
      if (!student) return;
      
      // Verification
      if (student.admissionInfo?.testData?.serialNumber !== serial) {
          alert("Error: Serial Number mismatch.");
          return;
      }

      updateTestData(id, { status: 'Results Ready' });
      alert("Results submitted successfully.");
  };

  const verifyBirthCert = (id: number, birthRef: string) => {
      if(!birthRef) { alert("Please enter Birth Certificate Ref/ID"); return; }
      
      setStudents(prev => prev.map(s => {
          if (s.id === id) {
              return {
                  ...s,
                  // We assume DOB is already updated in state via the input field
                  admissionInfo: {
                      ...s.admissionInfo!,
                      testData: {
                          ...s.admissionInfo!.testData!,
                          proofOfBirth: birthRef,
                          birthSetVerified: true,
                          status: 'Results Ready', // Ready for Head Teacher
                          decision: 'Pending Placement' // Default for daycare admission
                      }
                  }
              };
          }
          return s;
      }));
      alert("Proof of Birth attached. Moved to Head Teacher Desk.");
  };

  const admitStudent = (student: StudentData) => {
      if (!student.admissionInfo) return;
      const classYear = new Date().getFullYear();
      // Generate ID based on class-specific enrollment or school-wide? Using School-wide to keep unique
      const count = students.filter(s => s.admissionInfo?.generatedId).length + 1;
      const generatedId = `UBA/${classYear}/${count.toString().padStart(3, '0')}`;
      
      setStudents(prev => prev.map(s => {
          if (s.id === student.id && s.admissionInfo) {
              return {
                  ...s,
                  admissionInfo: {
                      ...s.admissionInfo,
                      generatedId,
                      testData: { ...s.admissionInfo.testData, status: 'Admitted' } as any
                  }
              };
          }
          return s;
      }));
      
      const parentPhone = student.contact || student.admissionInfo.father?.phone || "Parent";
      alert(`Pupil Admitted! ID: ${generatedId}.\n\nConfirmation sent to ${parentPhone}.`);
  };

  const handleShareWelcomePack = (student: StudentData) => {
      // Simulate Sharing PDF Pack
      const cls = student.admissionInfo?.classApplyingFor || "General";
      const parent = student.guardian || "Parent";
      const id = student.admissionInfo?.generatedId || "N/A";
      
      const msg = `
      UNITED BAYLOR ACADEMY - WELCOME PACK
      ------------------------------------
      Dear ${parent},
      
      Congratulations on the admission of ${student.name} to ${cls}.
      Pupil ID: ${id}
      
      Attached Documents (Simulated):
      1. [PDF] Pupil Profile & ID Card
      2. [PDF] Class Rules & Regulations (Disciplinary)
      3. [PDF] Textbook & Exercise Booklist (${cls})
      4. [PDF] Learner Materials List
      
      Please ensure all items are procured before reopening.
      
      Regards,
      Administration.
      `;
      
      alert(msg);
      // In a real app, this would trigger actual PDF generation download or API email
  };

  const handlePrintTest = async () => {
      setIsGenerating(true);
      const element = document.getElementById('admission-test-paper');
      if (element) {
          // @ts-ignore
          if (window.html2pdf) {
              // @ts-ignore
              await window.html2pdf().from(element).save('Admission_Test.pdf');
          } else {
              window.print();
          }
      }
      setIsGenerating(false);
      setIsTestViewOpen(false);
  };

  const handleShareMessage = (student: StudentData) => {
      const test = student.admissionInfo?.testData;
      if (!test) return;
      const msg = test.message || generateAutoMessage(student, test);
      alert(`Message copied to clipboard/sent:\n\n"${msg}"`);
  };

  const handlePrintQuestionBank = async () => {
      setIsGenerating(true);
      const element = document.getElementById('question-bank-print-area');
      if (element) {
          // @ts-ignore
          if (window.html2pdf) {
              // @ts-ignore
              await window.html2pdf().from(element).save('Question_Pack.pdf');
          } else {
              window.print();
          }
      }
      setIsGenerating(false);
      setQuestionBankPrintData(null);
  };

  // --- Bulk Upload Handlers ---
  const handleBulkProcess = () => {
      if (!pasteData.trim()) return;
      
      const rows = pasteData.trim().split('\n');
      if (rows.length === 0) return;

      const newStudents: StudentData[] = [];
      const classYear = new Date().getFullYear();
      let currentCount = students.filter(s => s.admissionInfo?.generatedId).length;

      rows.forEach(row => {
          // Attempt to split by tab (Excel paste) or comma (CSV)
          let cols = row.split('\t');
          if (cols.length < 2) cols = row.split(',');
          
          if (cols.length >= 1) {
              const name = cols[0]?.trim();
              if (!name) return; // Skip empty names

              // Basic Mapping (Customize based on column order)
              // Assumption: Name | Gender | DOB | Contact | Special Needs
              const gender = (cols[1]?.trim() || 'Male') as 'Male' | 'Female';
              const dob = cols[2]?.trim() || '';
              const contact = cols[3]?.trim() || '';
              const specialNeeds = cols[4]?.trim() || '';

              currentCount++;
              const generatedId = `UBA/${classYear}/${currentCount.toString().padStart(3, '0')}`;
              
              const newS: StudentData = {
                  id: Date.now() + Math.random(),
                  name: name,
                  gender: gender,
                  dob: dob,
                  contact: contact,
                  specialNeeds: specialNeeds,
                  scores: {},
                  attendance: "0",
                  admissionInfo: {
                      generatedId: generatedId,
                      classApplyingFor: selectedClassTab,
                      presentClass: selectedClassTab,
                      dateOfAdmission: new Date().toISOString().split('T')[0],
                      receiptNumber: 'BULK-IMPORT',
                      // Defaults
                      nationality: 'Ghanaian',
                      livingWith: 'Both Parents',
                      father: { name: '', phone: contact } as any, // Map contact to father
                      testData: { status: 'Admitted' } as any
                  }
              };
              newStudents.push(newS);
          }
      });

      if (newStudents.length > 0) {
          setStudents(prev => [...prev, ...newStudents]);
          alert(`Successfully imported ${newStudents.length} pupils to ${selectedClassTab}.\n\nToggle automatically disabled.`);
          setPasteData("");
          
          // Disable Toggle
          if (systemConfig && onSystemConfigChange) {
              onSystemConfigChange({ ...systemConfig, bulkUploadTargetClass: null });
          }
          if (onSave) onSave(); // Auto save
      } else {
          alert("No valid data found to import.");
      }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          const text = evt.target?.result as string;
          if (text) {
              setPasteData(text);
          }
      };
      reader.readAsText(file);
  };

  // --- Views ---

  const renderClassTabs = () => (
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 border-b border-gray-300">
          {ALL_CLASSES_FLAT.map(cls => (
              <button
                key={cls}
                onClick={() => setSelectedClassTab(cls)}
                className={`px-3 py-1 rounded-t text-xs font-bold whitespace-nowrap border-b-2 transition-colors ${selectedClassTab === cls ? 'border-blue-600 text-blue-900 bg-blue-50' : 'border-transparent text-gray-500 hover:text-blue-600 hover:bg-gray-50'}`}
              >
                  {cls}
              </button>
          ))}
      </div>
  );

  const renderRegistrationForm = () => {
      const info = newApplicant.admissionInfo!;
      const updateInfo = (field: string, val: any) => setNewApplicant({...newApplicant, admissionInfo: {...info, [field]: val}});
      const updateParent = (parent: 'father' | 'mother' | 'guardianDetailed', field: keyof ParentDetailedInfo, val: any) => {
          updateInfo(parent, { ...info[parent], [field]: val });
      };

      return (
          <div className="bg-white p-8 rounded shadow border border-gray-200 max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold text-center mb-6 uppercase text-blue-900 border-b-4 border-double border-blue-900 pb-2">Pupil Registration Form</h2>
              
              <div className="flex justify-between items-center bg-gray-50 p-2 mb-6 border rounded">
                  <div className="font-bold text-sm text-gray-700">Confirmation of Receipt: <input type="text" className="border-b border-gray-400 bg-transparent p-1 w-32" placeholder="Receipt No." value={info.receiptNumber} onChange={e => updateInfo('receiptNumber', e.target.value)} /></div>
                  <div className="font-bold text-sm text-gray-700">Date: {info.dateOfAdmission}</div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-bold text-sm">Class: {selectedClassTab}</span>
              </div>

              {/* CHILD’S INFORMATION */}
              <div className="mb-6 border p-4 relative">
                  <h3 className="absolute -top-3 left-4 bg-white px-2 font-bold text-blue-800">CHILD’S INFORMATION</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mt-2">
                      <div><label className="block text-xs font-bold">First Name</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={newApplicant.name} onChange={e => setNewApplicant({...newApplicant, name: e.target.value})} /></div>
                      <div><label className="block text-xs font-bold">Surname</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" /></div>
                      <div><label className="block text-xs font-bold">Others</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.othersName} onChange={e => updateInfo('othersName', e.target.value)} /></div>
                      
                      <div><label className="block text-xs font-bold">Date of Birth</label><input type="date" className="w-full border-b border-dotted border-gray-400 p-1" value={newApplicant.dob} onChange={e => setNewApplicant({...newApplicant, dob: e.target.value})} /></div>
                      <div><label className="block text-xs font-bold">Sex</label><select className="w-full border-b border-dotted border-gray-400 p-1" value={newApplicant.gender} onChange={e => setNewApplicant({...newApplicant, gender: e.target.value as any})}><option>Male</option><option>Female</option></select></div>
                      <div><label className="block text-xs font-bold">Home Town</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.homeTown} onChange={e => updateInfo('homeTown', e.target.value)} /></div>
                      
                      <div><label className="block text-xs font-bold">Nationality</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.nationality} onChange={e => updateInfo('nationality', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Region</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.region} onChange={e => updateInfo('region', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Religion</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.religion} onChange={e => updateInfo('religion', e.target.value)} /></div>
                      
                      <div><label className="block text-xs font-bold">Present Class</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.presentClass} onChange={e => updateInfo('presentClass', e.target.value)} /></div>
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Last School Attended</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.lastSchool} onChange={e => updateInfo('lastSchool', e.target.value)} /></div>
                      
                      <div className="md:col-span-3 mt-2 border p-2 bg-red-50 rounded">
                          <label className="block text-xs font-bold text-red-700 mb-1">
                              Does the child have Special Needs? <span className="font-normal italic">(Should be confirmed by a qualified physician)</span>
                          </label>
                          <input 
                              type="text" 
                              className="w-full border-b border-gray-400 bg-transparent p-1 text-sm placeholder-red-200" 
                              placeholder="Specify nature of special needs if any..."
                              value={newApplicant.specialNeeds || ''} 
                              onChange={e => setNewApplicant({...newApplicant, specialNeeds: e.target.value})} 
                          />
                      </div>
                  </div>
              </div>

              {/* FATHER */}
              <div className="mb-6 border p-4 relative">
                  <h3 className="absolute -top-3 left-4 bg-white px-2 font-bold text-blue-800">FATHER</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                      <div className="md:col-span-2 flex gap-4">
                          <div className="flex-1"><label className="block text-xs font-bold">Name</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.name} onChange={e => updateParent('father', 'name', e.target.value)} /></div>
                          <div className="w-48"><label className="block text-xs font-bold">Date of Death (if dead)</label><input type="date" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.dateOfDeath} onChange={e => updateParent('father', 'dateOfDeath', e.target.value)} /></div>
                      </div>
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Address</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.address} onChange={e => updateParent('father', 'address', e.target.value)} /></div>
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Educational Background</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.education} onChange={e => updateParent('father', 'education', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Occupation</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.occupation} onChange={e => updateParent('father', 'occupation', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Telephone</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.phone} onChange={e => updateParent('father', 'phone', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Religion</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.religion} onChange={e => updateParent('father', 'religion', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">No. of wives</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.father?.wivesCount} onChange={e => updateParent('father', 'wivesCount', e.target.value)} /></div>
                  </div>
              </div>

              {/* MOTHER */}
              <div className="mb-6 border p-4 relative">
                  <h3 className="absolute -top-3 left-4 bg-white px-2 font-bold text-blue-800">MOTHER</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                      <div className="md:col-span-2 flex gap-4">
                          <div className="flex-1"><label className="block text-xs font-bold">Name</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.mother?.name} onChange={e => updateParent('mother', 'name', e.target.value)} /></div>
                          <div className="w-48"><label className="block text-xs font-bold">Date of Death (if dead)</label><input type="date" className="w-full border-b border-dotted border-gray-400 p-1" value={info.mother?.dateOfDeath} onChange={e => updateParent('mother', 'dateOfDeath', e.target.value)} /></div>
                      </div>
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Address</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.mother?.address} onChange={e => updateParent('mother', 'address', e.target.value)} /></div>
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Educational Background</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.mother?.education} onChange={e => updateParent('mother', 'education', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Occupation</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.mother?.occupation} onChange={e => updateParent('mother', 'occupation', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Telephone</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.mother?.phone} onChange={e => updateParent('mother', 'phone', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Religion</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.mother?.religion} onChange={e => updateParent('mother', 'religion', e.target.value)} /></div>
                  </div>
              </div>

              {/* GUARDIAN */}
              <div className="mb-6 border p-4 relative">
                  <h3 className="absolute -top-3 left-4 bg-white px-2 font-bold text-blue-800">GUARDIAN</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Name</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.guardianDetailed?.name} onChange={e => updateParent('guardianDetailed', 'name', e.target.value)} /></div>
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Address</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.guardianDetailed?.address} onChange={e => updateParent('guardianDetailed', 'address', e.target.value)} /></div>
                      <div className="md:col-span-2"><label className="block text-xs font-bold">Educational Background</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.guardianDetailed?.education} onChange={e => updateParent('guardianDetailed', 'education', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Occupation</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.guardianDetailed?.occupation} onChange={e => updateParent('guardianDetailed', 'occupation', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Telephone</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.guardianDetailed?.phone} onChange={e => updateParent('guardianDetailed', 'phone', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Relationship to pupil</label><input type="text" className="w-full border-b border-dotted border-gray-400 p-1" value={info.guardianDetailed?.relationship} onChange={e => updateParent('guardianDetailed', 'relationship', e.target.value)} /></div>
                      <div><label className="block text-xs font-bold">Date Guardian Began</label><input type="date" className="w-full border-b border-dotted border-gray-400 p-1" value={info.guardianDetailed?.dateGuardianBegan} onChange={e => updateParent('guardianDetailed', 'dateGuardianBegan', e.target.value)} /></div>
                  </div>
              </div>

              <div className="mb-6">
                  <label className="block font-bold text-sm mb-2">Pupil(s) live with (Tick the appropriate answer)</label>
                  <div className="flex gap-4 text-sm">
                      {['Both Parents', 'Mother', 'Father', 'Guardian', 'Alone'].map(opt => (
                          <label key={opt} className="flex items-center gap-1 cursor-pointer">
                              <input type="radio" name="livingWith" value={opt} checked={info.livingWith === opt} onChange={e => updateInfo('livingWith', e.target.value)} />
                              {opt}
                          </label>
                      ))}
                  </div>
              </div>

              {/* DECLARATION */}
              <div className="mb-6 border p-4 bg-gray-50 text-sm">
                  <h3 className="font-bold text-center underline mb-4">PLEASE COMPLETE THE UNDERNEATH (DECLARATION)</h3>
                  <div className="space-y-4">
                      <div>
                          I, Mr. /Mrs. / Miss <input type="text" className="border-b border-black bg-transparent w-64 px-1" value={info.declaration?.parentName} onChange={e => updateInfo('declaration', {...info.declaration, parentName: e.target.value})} />, 
                          The Parent / Guardian of Master / Miss <input type="text" className="border-b border-black bg-transparent w-64 px-1" value={info.declaration?.wardName} onChange={e => updateInfo('declaration', {...info.declaration, wardName: e.target.value})} />
                      </div>
                      <p className="italic">
                          do promise to be responsible for the payment of fees and other materials of my ward and comply with all laid down regulations of the school.
                          In case I wish to withdraw my ward from the school I shall give a term notices in writing or pay full term’s fees in lieu of notices.
                      </p>
                      <div className="flex items-center gap-2 mt-4">
                          <input type="checkbox" checked={info.declaration?.signed} onChange={e => updateInfo('declaration', {...info.declaration, signed: e.target.checked})} className="w-5 h-5 cursor-pointer" />
                          <span className="font-bold text-red-700">I Agree and Sign this declaration.</span>
                          <span className="ml-auto">Date: {info.declaration?.date}</span>
                      </div>
                  </div>
              </div>

              <div className="text-center">
                  <button onClick={handleRegister} className="bg-green-600 text-white font-bold py-3 px-12 rounded shadow hover:bg-green-700 text-lg">
                      Submit & Proceed
                  </button>
              </div>
          </div>
      );
  };

  const renderSchedulingPortal = () => {
      // Different view for Daycare (Verification) vs Basic (Test Scheduling)
      const availableInvigilators = settings.staffList;
      const pendingApplicants = applicants.filter(a => !a.admissionInfo?.testData?.isScheduled || a.admissionInfo.testData.status === 'Pending');

      if (isDaycareOrNursery) {
          return (
              <div className="bg-white p-6 rounded shadow border border-gray-200">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">Daycare Admission - Proof of Birth & DOB Check</h3>
                  <p className="text-sm text-gray-500 mb-4">Verify Date of Birth from Birth Certificate / Weighing Card. Enter ID to attach.</p>
                  
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border">
                          <thead className="bg-purple-50">
                              <tr>
                                  <th className="border p-2">Applicant</th>
                                  <th className="border p-2">DOB (from Cert)</th>
                                  <th className="border p-2">Birth Cert / ID No.</th>
                                  <th className="border p-2">Action</th>
                              </tr>
                          </thead>
                          <tbody>
                              {pendingApplicants.map(app => (
                                  <tr key={app.id} className="hover:bg-gray-50">
                                      <td className="border p-2 font-bold">{app.name}</td>
                                      <td className="border p-2">
                                          <input 
                                            type="date" 
                                            className="border p-1 w-full rounded" 
                                            value={app.dob || ''}
                                            onChange={(e) => {
                                                // Live update DOB in state for this applicant
                                                setStudents(prev => prev.map(s => s.id === app.id ? { ...s, dob: e.target.value } : s));
                                            }}
                                          />
                                      </td>
                                      <td className="border p-2">
                                          <input 
                                            type="text" 
                                            className="border p-1 w-full rounded font-mono" 
                                            placeholder="Enter ID..."
                                            value={app.admissionInfo?.testData?.proofOfBirth || ''}
                                            onChange={(e) => updateTestData(app.id, { proofOfBirth: e.target.value })}
                                          />
                                      </td>
                                      <td className="border p-2 text-center">
                                          <button 
                                            onClick={() => verifyBirthCert(app.id, app.admissionInfo?.testData?.proofOfBirth || '')}
                                            className="bg-purple-600 text-white px-4 py-1 rounded text-xs font-bold shadow hover:bg-purple-700"
                                          >
                                              Attach & Move On
                                          </button>
                                      </td>
                                  </tr>
                              ))}
                              {pendingApplicants.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No pending verification for {selectedClassTab}.</td></tr>}
                          </tbody>
                      </table>
                  </div>
              </div>
          );
      }

      return (
          <div className="bg-white p-6 rounded shadow border border-gray-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Assessment Scheduling ({selectedClassTab})</h3>
              
              <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse border">
                      <thead className="bg-gray-100">
                          <tr>
                              <th className="border p-2">Applicant</th>
                              <th className="border p-2 w-1/3">Test Details</th>
                              <th className="border p-2 w-1/3">Set, Serial & Msg</th>
                              <th className="border p-2">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {pendingApplicants.map(app => {
                              const test = (app.admissionInfo?.testData || { isScheduled: false }) as any;
                              // Auto-generate serial
                              if (!test.serialNumber) {
                                  test.serialNumber = generateAutoSerial(selectedClassTab);
                              }
                              // Initial auto-message
                              if (!test.message) {
                                  test.message = generateAutoMessage(app, test);
                              }

                              return (
                                  <tr key={app.id} className="hover:bg-gray-50 align-top">
                                      <td className="border p-2 font-bold">{app.name}</td>
                                      <td className="border p-2">
                                          <div className="flex flex-col gap-1">
                                              <input type="date" className="border p-1 text-xs" value={test.testDate} onChange={(e) => updateTestData(app.id, { testDate: e.target.value })}/>
                                              <input type="time" className="border p-1 text-xs" value={test.testTime} onChange={(e) => updateTestData(app.id, { testTime: e.target.value })}/>
                                              <div className="flex gap-1">
                                                  <input type="text" placeholder="Duration" className="border p-1 text-xs w-1/2" value={test.duration || "45 mins"} onChange={(e) => updateTestData(app.id, { duration: e.target.value })}/>
                                                  <select className="border p-1 text-xs w-1/2" value={test.venue} onChange={(e) => updateTestData(app.id, { venue: e.target.value })}>
                                                      <option value="">Venue...</option>
                                                      <option value="Classroom A">Classroom A</option>
                                                      <option value="Hall">Assembly Hall</option>
                                                  </select>
                                              </div>
                                              <select className="border p-1 text-xs" value={test.invigilatorId} onChange={(e) => {
                                                  const staff = availableInvigilators.find(s => s.id === e.target.value);
                                                  updateTestData(app.id, { invigilatorId: e.target.value, invigilatorName: staff?.name || 'Supervisor' });
                                              }}>
                                                  <option value="">Invigilator (Select Staff)...</option>
                                                  {availableInvigilators.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}
                                              </select>
                                          </div>
                                      </td>
                                      <td className="border p-2">
                                          <div className="flex flex-col gap-1">
                                              <div className="flex gap-2">
                                                  <select className="border p-1 text-xs font-bold w-20" value={test.questionSet} onChange={(e) => updateTestData(app.id, { questionSet: e.target.value as any })}>
                                                      <option value="">Set...</option>
                                                      <option value="A">Set A</option>
                                                      <option value="B">Set B</option>
                                                      <option value="C">Set C</option>
                                                      <option value="D">Set D</option>
                                                  </select>
                                                  <input type="text" placeholder="Serial Index" className="border p-1 text-xs font-bold flex-1" value={test.serialNumber} onChange={(e) => updateTestData(app.id, { serialNumber: e.target.value })}/>
                                              </div>
                                              <textarea 
                                                placeholder="Message to Applicant..." 
                                                className="border p-1 text-xs w-full h-20 bg-yellow-50"
                                                value={test.message} 
                                                onChange={(e) => updateTestData(app.id, { message: e.target.value })}
                                              />
                                          </div>
                                      </td>
                                      <td className="border p-2 text-center align-middle">
                                          <button 
                                            onClick={() => updateTestData(app.id, { isScheduled: true, status: 'Scheduled', serialNumber: test.serialNumber })} 
                                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-bold block w-full mb-2"
                                          >
                                              Confirm
                                          </button>
                                          {test.isScheduled && (
                                              <div className="flex flex-col gap-1">
                                                  <button 
                                                    onClick={() => { setSelectedApplicantId(app.id); setIsTestViewOpen(true); }}
                                                    className="bg-gray-700 text-white px-3 py-1 rounded text-xs font-bold block w-full"
                                                  >
                                                      Print Slip
                                                  </button>
                                                  <button 
                                                    onClick={() => handleShareMessage(app)}
                                                    className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold block w-full"
                                                  >
                                                      Share Msg
                                                  </button>
                                              </div>
                                          )}
                                      </td>
                                  </tr>
                              )
                          })}
                          {pendingApplicants.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No pending applicants for {selectedClassTab}.</td></tr>}
                      </tbody>
                  </table>
              </div>

              {/* Print Slip Modal */}
              {isTestViewOpen && selectedApplicantId && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-8 w-[210mm] min-h-[500px] shadow-2xl relative">
                          <button onClick={() => setIsTestViewOpen(false)} className="absolute top-4 right-4 text-red-600 font-bold no-print">✕</button>
                          <div id="admission-test-paper">
                              <div className="text-center mb-6 border-b-2 border-black pb-4">
                                  <h1 className="text-3xl font-black uppercase text-blue-900">{settings.schoolName}</h1>
                                  <div className="flex justify-center gap-4 text-xs font-bold text-gray-600 mb-1">
                                      <span>{settings.schoolContact}</span>
                                      <span>|</span>
                                      <span>{settings.schoolEmail}</span>
                                  </div>
                                  <h2 className="text-xl font-bold uppercase mt-2 text-red-700">Admission Assessment Slip</h2>
                                  <div className="text-sm font-bold text-gray-700 mt-1">{settings.termInfo} | {settings.academicYear}</div>
                              </div>

                              <div className="border p-4 mb-4 bg-gray-50 rounded">
                                  <div className="grid grid-cols-2 gap-2 text-sm">
                                      <p><strong>Name:</strong> <span className="uppercase">{students.find(s=>s.id===selectedApplicantId)?.name}</span></p>
                                      <p><strong>Class Applied:</strong> {students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.classApplyingFor}</p>
                                      <p><strong>Serial Index:</strong> <span className="font-mono font-bold text-lg">{students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.testData?.serialNumber}</span></p>
                                      <p><strong>Question Set:</strong> {students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.testData?.questionSet}</p>
                                      <p><strong>Date & Time:</strong> {students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.testData?.testDate} @ {students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.testData?.testTime}</p>
                                      <p><strong>Venue:</strong> {students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.testData?.venue}</p>
                                  </div>
                                  <div className="mt-2 pt-2 border-t text-xs italic">
                                      <strong>Message:</strong> {students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.testData?.message}
                                  </div>
                              </div>
                              
                              <div className="border-t pt-4">
                                  <h3 className="font-bold mb-2 uppercase text-center border-b pb-1">Assessment Questions (Set {students.find(s=>s.id===selectedApplicantId)?.admissionInfo?.testData?.questionSet})</h3>
                                  <div className="p-4 border rounded min-h-[400px] whitespace-pre-wrap text-sm font-serif leading-relaxed">
                                      {(() => {
                                          const s = students.find(s => s.id === selectedApplicantId);
                                          const cls = s?.admissionInfo?.classApplyingFor || "General";
                                          const set = s?.admissionInfo?.testData?.questionSet || "A";
                                          const groupKey = cls.includes("Basic") ? "Basic" : cls.includes("KG") ? "KG" : "General";
                                          return settings.admissionQuestionBank?.[groupKey]?.[set] || "[No questions configured for this set/class group]";
                                      })()}
                                  </div>
                              </div>
                          </div>
                          <div className="text-center mt-4 no-print">
                              <button onClick={handlePrintTest} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Print / Download</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderResultEntryPortal = () => {
      if (isDaycareOrNursery) {
          return (
              <div className="bg-white p-6 rounded shadow border text-center text-gray-500 italic">
                  Results Entry not applicable for Daycare (Verification Only). Proceed to Head Teacher Admission.
              </div>
          )
      }

      // ... (Existing Result Entry Logic for Basic/JHS) ...
      const scheduledApplicants = applicants.filter(a => a.admissionInfo?.testData?.status === 'Scheduled');

      return (
          <div className="bg-white p-6 rounded shadow border border-gray-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Assessment Result Entry ({selectedClassTab})</h3>
              <div className="grid grid-cols-1 gap-6">
                  {scheduledApplicants.map(app => {
                      const test = app.admissionInfo?.testData;
                      return (
                          <div key={app.id} className="border rounded p-4 bg-gray-50 flex flex-col md:flex-row gap-4 items-start">
                              <div className="flex-1">
                                  <h4 className="font-bold text-lg">{app.name}</h4>
                                  <div className="text-xs text-gray-600 grid grid-cols-2 gap-2 mt-1">
                                      <span>Class: {app.admissionInfo?.classApplyingFor}</span>
                                      <span>Set: {test?.questionSet}</span>
                                      <span>Assigned Serial: <span className="font-mono font-bold bg-yellow-100 px-1">{test?.serialNumber}</span></span>
                                  </div>
                              </div>
                              
                              <div className="flex-1 space-y-2">
                                  <div>
                                      <label className="block text-xs font-bold text-red-600">Verify Serial Number</label>
                                      <input 
                                        type="text" 
                                        className="border p-1 w-full rounded" 
                                        placeholder="Enter Serial from Script"
                                        value={test?.verifiedSerialNumber || ''}
                                        onChange={(e) => updateTestData(app.id, { verifiedSerialNumber: e.target.value })}
                                      />
                                  </div>
                                  <div className="grid grid-cols-3 gap-2">
                                      <div>
                                          <label className="text-[10px] font-bold block">Script (50)</label>
                                          <input type="number" className="border p-1 w-full rounded text-center" value={test?.scores?.scriptScore || ''} onChange={(e) => updateResultScore(app.id, 'scriptScore', e.target.value)}/>
                                      </div>
                                      <div>
                                          <label className="text-[10px] font-bold block">H.Writing (20)</label>
                                          <input type="number" className="border p-1 w-full rounded text-center" value={test?.scores?.handwriting || ''} onChange={(e) => updateResultScore(app.id, 'handwriting', e.target.value)}/>
                                      </div>
                                      <div>
                                          <label className="text-[10px] font-bold block">Spelling (30)</label>
                                          <input type="number" className="border p-1 w-full rounded text-center" value={test?.scores?.spelling || ''} onChange={(e) => updateResultScore(app.id, 'spelling', e.target.value)}/>
                                      </div>
                                  </div>
                              </div>

                              <div className="flex flex-col items-center justify-center gap-2">
                                  <div className="text-center">
                                      <div className="text-xs font-bold text-gray-500">Total</div>
                                      <div className="text-xl font-bold text-blue-900">{test?.scores?.total || 0}</div>
                                  </div>
                                  <div className="text-center">
                                      <div className="text-[10px] font-bold text-gray-500">Decision</div>
                                      <div className={`text-xs font-bold px-2 py-1 rounded text-white ${test?.decision === 'Skip to Higher' ? 'bg-green-600' : test?.decision === 'Repeat Lower' ? 'bg-red-500' : 'bg-blue-500'}`}>
                                          {test?.decision || 'Pending'}
                                      </div>
                                  </div>
                                  <button 
                                    onClick={() => submitResults(app.id, test?.verifiedSerialNumber || '')}
                                    className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm shadow hover:bg-green-700"
                                  >
                                      Submit
                                  </button>
                              </div>
                          </div>
                      );
                  })}
                  {scheduledApplicants.length === 0 && <p className="text-gray-500 italic p-4 text-center">No applicants waiting for results in {selectedClassTab}.</p>}
              </div>
          </div>
      );
  };

  const renderHeadTeacherAdmission = () => {
      // ... (Head Teacher Admission unchanged) ...
      const readyApplicants = applicants.filter(a => a.admissionInfo?.testData?.status === 'Results Ready');

      return (
          <div className="bg-white p-6 rounded shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-blue-900">Head Teacher Admission Desk ({selectedClassTab})</h3>
                  <button onClick={handleCleanupStale} className="text-red-600 border border-red-200 bg-red-50 px-3 py-1 rounded text-xs font-bold hover:bg-red-100">
                      Cleanup Stale Records
                  </button>
              </div>
              
              <div className="space-y-4">
                  {readyApplicants.map(app => {
                      const test = app.admissionInfo?.testData;
                      return (
                          <div key={app.id} className="border-l-4 border-green-500 bg-white shadow-sm p-4 flex justify-between items-center">
                              <div>
                                  <h4 className="font-bold text-lg">{app.name}</h4>
                                  <p className="text-sm text-gray-600">Applying: {app.admissionInfo?.classApplyingFor} | Score: <strong>{test?.scores?.total || 'N/A'}/100</strong></p>
                                  {test?.proofOfBirth && <p className="text-xs text-purple-600 font-bold">Birth Cert: {test.proofOfBirth}</p>}
                                  <p className="text-xs text-gray-500 italic">Rec: {test?.decision}</p>
                              </div>
                              <button 
                                onClick={() => admitStudent(app)}
                                className="bg-green-600 text-white px-6 py-2 rounded shadow font-bold hover:bg-green-700"
                              >
                                  Admit Pupil
                              </button>
                          </div>
                      );
                  })}
                  {readyApplicants.length === 0 && <p className="text-gray-500 italic text-center p-8">No results waiting for admission in {selectedClassTab}.</p>}
              </div>
          </div>
      );
  };

  const renderQuestionBank = () => {
      // ... (Kept existing question bank logic) ...
      const groups = ["KG", "Basic", "JHS"];
      const sets = ["A", "B", "C", "D"];
      const currentBank = settings.admissionQuestionBank || {};

      const handleBankUpdate = (group: string, set: string, content: string) => {
          onSettingChange('admissionQuestionBank', {
              ...currentBank,
              [group]: { ...(currentBank[group] || {}), [set]: content }
          });
      };

      const handlePreview = (group: string, set: string) => {
          setQuestionBankPrintData({
              group,
              set,
              content: currentBank[group]?.[set] || ""
          });
      };

      return (
          <div className="bg-white p-6 rounded shadow border border-gray-200">
              <h3 className="text-xl font-bold text-blue-900 mb-4">Question Pack Management</h3>
              <div className="space-y-6">
                  {groups.map(group => (
                      <div key={group} className="border rounded p-4">
                          <h4 className="font-bold text-gray-700 mb-2 border-b pb-1">{group} Level</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {sets.map(set => (
                                  <div key={set}>
                                      <div className="flex justify-between items-end mb-1">
                                          <label className="text-xs font-bold block">Set {set}</label>
                                          <button 
                                            onClick={() => handlePreview(group, set)} 
                                            className="text-[10px] text-blue-600 font-bold hover:underline"
                                          >
                                              Print/Share
                                          </button>
                                      </div>
                                      <textarea 
                                        className="w-full border p-2 text-xs rounded h-24"
                                        placeholder={`Questions for ${group} Set ${set}...`}
                                        value={currentBank[group]?.[set] || ''}
                                        onChange={(e) => handleBankUpdate(group, set, e.target.value)}
                                      />
                                  </div>
                              ))}
                          </div>
                      </div>
                  ))}
              </div>

              {/* Question Pack Print Modal */}
              {questionBankPrintData && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-8 w-[210mm] min-h-[500px] shadow-2xl relative">
                          <button onClick={() => setQuestionBankPrintData(null)} className="absolute top-4 right-4 text-red-600 font-bold no-print">✕</button>
                          <div id="question-bank-print-area">
                              <div className="text-center mb-6 border-b-2 border-black pb-4">
                                  <h1 className="text-3xl font-black uppercase text-blue-900">{settings.schoolName}</h1>
                                  <div className="flex justify-center gap-4 text-xs font-bold text-gray-600 mb-1">
                                      <span>{settings.schoolContact}</span>
                                      <span>|</span>
                                      <span>{settings.schoolEmail}</span>
                                  </div>
                                  <h2 className="text-xl font-bold uppercase mt-2 text-red-700">Assessment Question Pack ({questionBankPrintData.group} - Set {questionBankPrintData.set})</h2>
                                  <div className="text-sm font-bold text-gray-700 mt-1">{settings.termInfo} | {settings.academicYear}</div>
                              </div>

                              <div className="mb-4 border-b pb-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                      <p className="border-b border-dotted pb-1"><strong>Pupil Name:</strong> __________________________________________</p>
                                      <p className="border-b border-dotted pb-1"><strong>Serial Number:</strong> _____________________</p>
                                  </div>
                              </div>

                              <div className="p-4 border rounded min-h-[400px] whitespace-pre-wrap text-sm font-serif leading-relaxed">
                                  {questionBankPrintData.content || "[No content defined]"}
                              </div>
                          </div>
                          <div className="text-center mt-4 no-print">
                              <button onClick={handlePrintQuestionBank} className="bg-blue-600 text-white px-6 py-2 rounded font-bold">Print / Download</button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  const renderSchoolEnrolment = () => {
      // Logic for Bulk Upload Toggle State
      const isBulkUploadActive = systemConfig?.bulkUploadTargetClass === selectedClassTab;

      return (
          <div className="bg-white p-6 rounded shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-blue-900 uppercase">Individual Class Enrolment List ({selectedClassTab})</h3>
                  {isBulkUploadActive && (
                      <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                          Bulk Upload Active
                      </span>
                  )}
              </div>
              
              {/* BULK UPLOAD EXCEPTION UI */}
              {isBulkUploadActive && (
                  <div className="mb-6 bg-purple-50 border border-purple-200 p-4 rounded shadow-inner">
                      <h4 className="font-bold text-purple-900 mb-2">📥 Bulk Enrolment Upload Exception</h4>
                      <p className="text-xs text-gray-600 mb-4">
                          Paste your list from Excel (Name, Gender, DOB, Contact, Special Needs) or select a CSV file.
                          <br/>
                          Format: <code>Name [tab/comma] Gender [tab/comma] DOB [tab/comma] Contact [tab/comma] Special Needs</code>
                      </p>
                      
                      <div className="flex gap-4 items-start mb-4">
                          <textarea 
                            className="w-full h-32 border p-2 text-xs font-mono rounded"
                            placeholder="Paste Excel data here..."
                            value={pasteData}
                            onChange={(e) => setPasteData(e.target.value)}
                          />
                          <div className="flex flex-col gap-2 w-48">
                              <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-bold py-2 px-4 rounded text-center block">
                                  <span>📂 Select CSV File</span>
                                  <input type="file" accept=".csv, .txt" className="hidden" onChange={handleFileUpload} />
                              </label>
                              <button className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-2 px-4 rounded block">
                                  ☁️ Import from Drive
                              </button>
                              <button 
                                onClick={handleBulkProcess}
                                className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold py-2 px-4 rounded block shadow"
                              >
                                  ✅ Process Upload
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              <div className="mb-4 text-right">
                  <span className="bg-gray-100 px-3 py-1 rounded text-sm font-bold border">Total in {selectedClassTab}: {classEnrolled.length}</span>
              </div>

              <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-collapse">
                      <thead className="bg-gray-100 text-xs text-gray-700 uppercase">
                          <tr>
                              <th className="p-2 border text-left">Pupil ID</th>
                              <th className="p-2 border text-left">Name</th>
                              <th className="p-2 border text-left">DOB</th>
                              <th className="p-2 border text-left">Date Enrolled</th>
                              <th className="p-2 border text-left">Parent Contact</th>
                              <th className="p-2 border text-left">Special Needs</th>
                              <th className="p-2 border text-center">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {classEnrolled.map(s => (
                              <tr key={s.id} className="border-t hover:bg-blue-50">
                                  <td className="p-2 border font-mono text-xs font-bold text-gray-600">{s.admissionInfo?.generatedId}</td>
                                  <td className="p-2 border font-semibold uppercase">{s.name}</td>
                                  <td className="p-2 border">{s.dob}</td>
                                  <td className="p-2 border">{s.admissionInfo?.dateOfAdmission}</td>
                                  <td className="p-2 border">{s.contact}</td>
                                  <td className="p-2 border italic text-gray-500">{s.specialNeeds || 'None'}</td>
                                  <td className="p-2 border text-center">
                                      <button 
                                        onClick={() => handleShareWelcomePack(s)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-2 py-1 rounded"
                                      >
                                          Share Welcome Pack
                                      </button>
                                  </td>
                              </tr>
                          ))}
                          {classEnrolled.length === 0 && <tr><td colSpan={7} className="p-4 text-center italic text-gray-500">No pupils enrolled in this class.</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row">
       <div className="w-full md:w-64 bg-blue-900 text-white p-4 flex-shrink-0">
           <h2 className="text-lg font-bold uppercase mb-6 border-b border-blue-700 pb-2">Pupil Management</h2>
           <nav className="space-y-1">
               {availablePortals.map((portal) => (
                   <button
                      key={portal}
                      onClick={() => setActivePortal(portal as SubPortal)}
                      className={`w-full text-left px-3 py-2 rounded text-sm font-semibold transition-colors ${activePortal === portal ? 'bg-yellow-500 text-blue-900' : 'hover:bg-blue-800 text-blue-100'}`}
                   >
                       {portal}
                   </button>
               ))}
           </nav>
       </div>

       <div className="flex-1 p-6 overflow-y-auto">
           {/* Render Class Tabs for relevant portals */}
           {['Registration Form', 'Assessment Scheduling', 'Result Entry & Placement', 'Head Teacher Admission', 'Class Enrolment List'].includes(activePortal) && renderClassTabs()}

           {activePortal === 'Registration Form' && renderRegistrationForm()}
           {activePortal === 'Assessment Scheduling' && renderSchedulingPortal()}
           {activePortal === 'Result Entry & Placement' && renderResultEntryPortal()}
           {activePortal === 'Head Teacher Admission' && renderHeadTeacherAdmission()}
           {activePortal === 'Question Bank Management' && renderQuestionBank()}
           {activePortal === 'Class Enrolment List' && renderSchoolEnrolment()}
       </div>
    </div>
  );
};

export default PupilManagement;
