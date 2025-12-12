
import React, { useState, useMemo, useEffect, useRef } from 'react';
import EditableField from './EditableField';
import { Department, Module, SchoolClass, GlobalSettings, StudentData, StaffMember, AssessmentColumn, FixedActivityConfig, ComplianceLog, TimetableConstraints, ClassTimetableData, EarlyChildhoodActivity, CalendarWeek } from '../types';
import { DAYCARE_INDICATORS, DAYCARE_ACTIVITY_GROUPS, getSubjectsForDepartment, SCHOOL_VENUES, DAYCARE_PERIODS, BASIC_LEVEL_VENUES, DAYCARE_SUBJECTS, CLASS_TIMETABLE_DATA, DAYCARE_ACTIVITIES_LIST, DAYCARE_LEARNING_AREAS, DAYCARE_ACTIVITY_DETAILS, DAYCARE_RESOURCES_LIST, DAYCARE_REMARKS_LIST, DAYCARE_TIMETABLE_STRUCTURE, CALENDAR_PERIODS, CALENDAR_ACTIVITIES, CALENDAR_ASSESSMENTS, CALENDAR_TEACHERS, CALENDAR_EXTRA_CURRICULAR } from '../constants';

interface GenericModuleProps {
  department: Department;
  schoolClass: SchoolClass;
  module: Module;
  settings?: GlobalSettings;
  onSettingChange?: (key: keyof GlobalSettings, value: any) => void;
  students?: StudentData[]; // Shared State
  setStudents?: React.Dispatch<React.SetStateAction<StudentData[]>>; // Shared Setter
  onSave?: () => void; // Save Action
}

// Mock Data Types for Attendance
type AttendanceStatus = 'P' | 'A' | 'WP' | 'WOP' | 'H'; // Present, Absent, With Permission, Without Permission, Holiday

// Exercise Assessment Types
interface AssessmentExercise {
    id: string;
    date: string;
    type: 'Class' | 'Home';
    source: 'Exercise Book' | 'Textbook';
    exerciseNo: string;
    maxScore: number;
    topic?: string;
    subject?: string;
    term?: string;
}

interface MonitoringLog {
    id: string;
    date: string;
    week: string;
    subject: string;
    source: string;
    term?: string;
    unmarked: number;
    undated: number;
    untitled: number;
    uncorrected: number;
    correctedNotMarked: number;
    missingBooks: number;
    exerciseDefaulters: string[]; // List of names
    homeworkDefaulters: string[]; // List of names
}

const GenericModule: React.FC<GenericModuleProps> = ({ department, schoolClass, module, settings, onSettingChange, students = [], setStudents, onSave }) => {
  // Generic State for Tables
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [newIndicator, setNewIndicator] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newStaff, setNewStaff] = useState<Partial<StaffMember>>({ role: 'Facilitator', status: 'Observer Active' });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // State for Daycare Accordion
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  
  // -- Academic Calendar State --
  const [activeTerm, setActiveTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 1');
  const [calendarView, setCalendarView] = useState<'planner' | 'extra_curricular'>('planner');
  const [calendarModal, setCalendarModal] = useState<{ isOpen: boolean; weekIdx: number; field: keyof CalendarWeek; options: string[] } | null>(null);
  
  // -- Time Table State (Early Childhood) --
  const [activeDay, setActiveDay] = useState<string>('Monday');
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [showActivityGroupPicker, setShowActivityGroupPicker] = useState(false);
  const [currentActivity, setCurrentActivity] = useState<Partial<EarlyChildhoodActivity>>({});
  const [editIndex, setEditIndex] = useState<number | null>(null); 
  const [customResources, setCustomResources] = useState<string[]>([]);
  const [newResourceInput, setNewResourceInput] = useState("");

  // State for Observation Points Modal
  const [isObservationModalOpen, setIsObservationModalOpen] = useState(false);
  const [activeObservationActivity, setActiveObservationActivity] = useState("");
  // Temporary state for the modal input
  const [observationPointsInput, setObservationPointsInput] = useState<Record<number, string>>({}); 

  // Enrolment Specific State
  const [enrolmentView, setEnrolmentView] = useState<'records' | 'attendance' | 'history'>('records');

  // Attendance State: Map Week Number -> Student ID -> Day -> Status
  const [attendanceHistory, setAttendanceHistory] = useState<Record<string, Record<number, Record<string, AttendanceStatus>>>>({});
  
  // Week Info State
  const [weekInfo, setWeekInfo] = useState({ number: "1", start: "", end: "" });

  // Exercise Assessment State
  const [exerciseView, setExerciseView] = useState<'entry' | 'monitoring' | 'sheet_assignments' | 'sheet_inspection'>('entry');
  const [exerciseTerm, setExerciseTerm] = useState("Term 1");
  const [exercises, setExercises] = useState<AssessmentExercise[]>([]);
  const [exerciseScores, setExerciseScores] = useState<Record<string, Record<number, string>>>({}); // ExID -> StudentID -> Score (string to allow empty)
  const [newExercise, setNewExercise] = useState<Partial<AssessmentExercise>>({
      type: 'Class',
      source: 'Exercise Book',
      exerciseNo: '',
      date: new Date().toISOString().split('T')[0],
      maxScore: 10,
      subject: ''
  });
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);
  const [exerciseListFilter, setExerciseListFilter] = useState("");
  
  // Daily Assessment State
  const [dailySubject, setDailySubject] = useState("");
  const [newIndicatorCol, setNewIndicatorCol] = useState({ title: '', maxScore: 10, date: new Date().toISOString().split('T')[0] });
  
  // Master Sheet Filter State
  const [sheetSubjectFilter, setSheetSubjectFilter] = useState("");

  // Exam Time Table Specific State
  const [examDurations, setExamDurations] = useState<string[]>(["30 Mins", "45 Mins", "1 Hour", "1 Hour 30 Mins", "2 Hours"]);
  const [newDuration, setNewDuration] = useState("");
  const [timetableStartDate, setTimetableStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [timetableStartTime, setTimetableStartTime] = useState("09:00");
  const [subjectsPerDay, setSubjectsPerDay] = useState(2); // Default 2
  const [subjectOrder, setSubjectOrder] = useState<string[]>([]);
  const [breakDuration, setBreakDuration] = useState(30); // Break duration in minutes

  // Class Time Table Specific State
  const [showTimetableConfig, setShowTimetableConfig] = useState(false);
  const [isComplianceMode, setIsComplianceMode] = useState(false);
  const [complianceModal, setComplianceModal] = useState<{ isOpen: boolean; day: string; periodIdx: number; subject: string; existingLog?: ComplianceLog } | null>(null);
  const [complianceForm, setComplianceForm] = useState<Partial<ComplianceLog>>({ status: 'Present', deviationType: 'None', deviationNote: '' });

  // Monitoring / Book Inspection State
  const [monitoringLogs, setMonitoringLogs] = useState<MonitoringLog[]>([]);
  const [newLog, setNewLog] = useState<Partial<MonitoringLog>>({
      date: new Date().toISOString().split('T')[0],
      week: '1',
      subject: '',
      source: 'Exercise Book',
      unmarked: 0,
      undated: 0,
      untitled: 0,
      uncorrected: 0,
      correctedNotMarked: 0,
      missingBooks: 0,
      exerciseDefaulters: [],
      homeworkDefaulters: []
  });

  const isEarlyChildhood = department === 'Daycare' || department === 'Nursery';
  const isPreSchool = ['Daycare', 'Nursery', 'Kindergarten'].includes(department);
  const isDaycare = department === 'Daycare';
  
  // Feature flag for the monitoring system
  const showMonitoringSystem = true; // Enabled for all departments

  const coreSubjects = useMemo(() => {
      const standard = getSubjectsForDepartment(department);
      const custom = settings?.customSubjects || [];
      const disabled = settings?.disabledSubjects || [];
      // Combine and remove duplicates using Set
      const combined = [...standard, ...custom].filter(s => !disabled.includes(s));
      return Array.from(new Set(combined));
  }, [department, settings?.customSubjects, settings?.disabledSubjects]);

  // Logic for available subjects in dropdown (Hoisted to top level)
  const availableSubjects = useMemo(() => {
      let list = [...coreSubjects];
      if (isEarlyChildhood) {
          // Add indicators if they are not already in the list
          const indicators = DAYCARE_INDICATORS.filter(ind => !list.includes(ind) && !settings?.disabledSubjects?.includes(ind));
          list = [...list, ...indicators];
      }
      return list;
  }, [coreSubjects, isEarlyChildhood, settings?.disabledSubjects]);

  const allTLM = useMemo(() => {
      // Use Daycare specific list if applicable
      if (isPreSchool) return [...DAYCARE_RESOURCES_LIST, ...customResources];
      return [...customResources]; // Or define standard resources list
  }, [isPreSchool, customResources]);

  // Initialize sheet filter if empty
  useEffect(() => {
      if (module === 'Exercise Assessment' && !sheetSubjectFilter && coreSubjects.length > 0) {
          setSheetSubjectFilter(coreSubjects[0]);
      }
      // Initialize subject order for timetable
      if ((module === 'Examination Time Table' as any || module === 'Examination Schedule' as any) && subjectOrder.length === 0 && coreSubjects.length > 0) {
          setSubjectOrder(coreSubjects);
      }
  }, [module, coreSubjects, sheetSubjectFilter, subjectOrder]);

  // Constants - Shortened for brevity
  const ACADEMIC_ACTIVITIES_PRESET = [ "REOPENING/ORIENTATION/STAFF MEETING", "EXAMINATION", "WEEK OF VACATION" ];

  // Initialize Generic Table Data based on Module/View
  useEffect(() => {
     if (module === 'Examination Time Table' as any || module === 'Observation Schedule' as any || module === 'Examination Schedule' as any) {
        // Load only current class data
        const globalData = settings?.examTimeTable || [];
        const classData = globalData.filter(r => r['Class'] === schoolClass);
        setTableData(classData.length > 0 ? classData : []);
     } else if (module === 'Invigilators List' as any || module === 'Observers List' as any) {
        // Load only current class data
        const globalData = settings?.invigilationList || [];
        const classData = globalData.filter(r => r['Class'] === schoolClass);
        setTableData(classData.length > 0 ? classData : []);
     } else if (module !== 'Academic Calendar' && module !== 'Pupil Enrolment' && module !== 'Exercise Assessment' && module !== 'Facilitator List' && module !== 'Daily Assessment' as any && module !== 'School Based Assessment (SBA)' as any && module !== 'Class Time Table' as any && module !== 'Time Table Analysis' as any) {
          // Default empty rows for generic tables
          if (tableData.length === 0) setTableData(Array(5).fill({}));
      }
  }, [module, calendarView, schoolClass, department, isEarlyChildhood, isPreSchool, settings?.examTimeTable, settings?.invigilationList]);

  // Initialize Academic Calendar if needed
  useEffect(() => {
      if (module === 'Academic Calendar' && settings && onSettingChange) {
          const currentCalendar = settings.academicCalendar || {};
          if (!currentCalendar[activeTerm] || currentCalendar[activeTerm].length === 0) {
              // Initialize with 16 weeks
              const initialWeeks: CalendarWeek[] = Array.from({ length: 16 }, (_, i) => ({
                  week: i + 1,
                  period: CALENDAR_PERIODS[i] || `Week ${i + 1}`,
                  coreActivity: '',
                  assessment: '',
                  leadTeam: '',
                  extraCurricular: '',
                  extraCurricularNotes: '',
                  startDate: '',
                  endDate: ''
              }));
              onSettingChange('academicCalendar', {
                  ...currentCalendar,
                  [activeTerm]: initialWeeks
              });
          }
      }
  }, [module, activeTerm, settings, onSettingChange]);

  // Define finalColumns
  const finalColumns = useMemo(() => {
    if (module === 'Examination Time Table' as any || module === 'Examination Schedule' as any) {
        return ['Date', 'Time', 'Subject Code', 'Subject Title', 'Subject Facilitator', 'Duration', 'Venue', 'Enrolment Count'];
    }
    if (module === 'Invigilators List' as any) {
        return ['Date of Invigilation', 'Time', 'Subject', 'Venue', 'Name of Facilitator', 'Role', 'Confirmation', 'Status'];
    }
    if (module === 'Observation Schedule' as any) {
        return ['Date of Observation', 'Period of Observation', 'Observers', 'Venue / Location', 'Duration'];
    }
    if (module === 'Observers List' as any) {
        if (department === 'Kindergarten') {
            return ['Date of Assessment', 'Time of the Assessment', 'Name of Assessor', 'Role', 'Indicator Management', 'Pupil or Group List', 'Total Pupils Assessed'];
        }
        // Daycare/Nursery
        return ['Date Of Observation', 'Time of the Observation', 'Pupil or Group List', 'Total Pupils Observed'];
    }
    
    // Default columns
    return ['Column 1', 'Column 2', 'Column 3', 'Column 4', 'Column 5'];
  }, [module, department]);

  // Handlers
  const handleTableChange = (index: number, column: string, value: string) => {
      const newData = [...tableData];
      newData[index] = { ...newData[index], [column]: value };
      setTableData(newData);
  };

  const addRow = () => {
      const newRow: Record<string, string> = {};
      finalColumns.forEach(col => newRow[col] = "");
      setTableData([...tableData, newRow]);
  };

  const handleSuggestGroups = (index: number) => {
      const count = students.length;
      handleTableChange(index, 'Pupil or Group List', `All ${count} Pupils`);
  };

  // --- Enrolment Logic ---
  const sortedStudents = useMemo(() => {
    const boys = students.filter(s => s.gender === 'Male').sort((a, b) => a.name.localeCompare(b.name));
    const girls = students.filter(s => s.gender === 'Female').sort((a, b) => a.name.localeCompare(b.name));
    const others = students.filter(s => !s.gender).sort((a,b) => a.name.localeCompare(b.name));
    return [...boys, ...girls, ...others];
  }, [students]);

  const handleStudentChange = (id: number, field: keyof StudentData, value: string) => {
    if (!setStudents) return;
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleGenderChange = (id: number, val: string) => {
      if (!setStudents) return;
      const normalized = val.toLowerCase().startsWith('m') ? 'Male' : 'Female';
      setStudents(prev => prev.map(s => s.id === id ? { ...s, gender: normalized } : s));
  };

  const addNewStudent = () => {
    if (!setStudents) return;
    const newId = students.length > 0 ? Math.max(...students.map(s => s.id)) + 1 : 1;
    setStudents([...students, { 
        id: newId, 
        name: "NEW PUPIL", 
        gender: "Male",
        scores: {},
        scoreDetails: {},
        dob: "", 
        guardian: "", 
        contact: "", 
        address: "" 
    }]);
  };

  // --- Early Childhood Time Table Logic ---
  const handleOpenActivityModal = (activity?: EarlyChildhoodActivity, index?: number) => {
      if (activity) {
          setCurrentActivity(activity);
          setEditIndex(index !== undefined ? index : null);
      } else {
          setCurrentActivity({
              time: '',
              activity: DAYCARE_ACTIVITIES_LIST[0],
              subject: '',
              details: '',
              tlm: '',
              remarks: '',
              isCustomary: false
          });
          setEditIndex(null);
      }
      setIsActivityModalOpen(true);
      setShowActivityGroupPicker(false); // Reset picker state
  };

  const handleSaveActivity = () => {
      if (!settings || !onSettingChange) return;
      const currentSchedule = settings.classTimetables?.[schoolClass]?.earlyChildhoodSchedule || {};
      const dayActivities = currentSchedule[activeDay] || [];
      
      const newActivity = { 
          ...currentActivity, 
          id: currentActivity.id || `${activeDay}-${Date.now()}` 
      } as EarlyChildhoodActivity;

      let updatedDayActivities;
      if (editIndex !== null) {
          updatedDayActivities = [...dayActivities];
          updatedDayActivities[editIndex] = newActivity;
      } else {
          updatedDayActivities = [...dayActivities, newActivity];
      }

      onSettingChange('classTimetables', {
          ...settings.classTimetables,
          [schoolClass]: {
              ...(settings.classTimetables?.[schoolClass] || {}),
              earlyChildhoodSchedule: {
                  ...currentSchedule,
                  [activeDay]: updatedDayActivities
              }
          }
      });
      setIsActivityModalOpen(false);
  };

  // Helper to toggle detail or TLM items
  const toggleItemInList = (currentStr: string | undefined, item: string) => {
      const items = (currentStr || '').split(', ').filter(s => s.trim() !== '');
      if (items.includes(item)) {
          return items.filter(s => s !== item).join(', ');
      } else {
          return [...items, item].join(', ');
      }
  };

  const handleOpenCompliance = (activity: EarlyChildhoodActivity, index: number) => {
      if (!isComplianceMode) return;
      const savedLogs = settings?.classTimetables?.[schoolClass]?.complianceLogs || {};
      const existingLog = savedLogs[activeDay]?.[index];
      
      setComplianceModal({ 
          isOpen: true, 
          day: activeDay, 
          periodIdx: index, 
          subject: activity.activity + (activity.subject ? ` (${activity.subject})` : ''), 
          existingLog 
      });
      setComplianceForm(existingLog || { status: 'Present', deviationType: 'None', deviationNote: '' });
  };

  const handleSaveComplianceLog = () => {
      if (!complianceModal || !settings || !onSettingChange) return;
      const { day, periodIdx } = complianceModal;
      const newLog: ComplianceLog = {
          status: complianceForm.status as any,
          deviationType: complianceForm.deviationType as any,
          deviationNote: complianceForm.deviationNote,
          timestamp: new Date().toISOString()
      };

      const currentLogs = settings.classTimetables?.[schoolClass]?.complianceLogs || {};
      const dayLogs = currentLogs[day] || {};
      
      onSettingChange('classTimetables', {
          ...settings.classTimetables,
          [schoolClass]: { 
              ...(settings.classTimetables?.[schoolClass] || {}), 
              complianceLogs: { 
                  ...currentLogs, 
                  [day]: { ...dayLogs, [periodIdx]: newLog } 
              } 
          } as any
      });
      setComplianceModal(null);
  };

  // --- Observation Point Entry Logic ---
  const handleOpenObservationModal = (defaultActivity: string = "") => {
      setIsObservationModalOpen(true);
      setObservationPointsInput({});
      // Set active activity if provided (from the row), else default to first available
      if (defaultActivity) {
          setActiveObservationActivity(defaultActivity);
      } else if (!activeObservationActivity && settings?.activeIndicators && settings.activeIndicators.length > 0) {
          setActiveObservationActivity(settings.activeIndicators[0]);
      }
  };

  const handleCloseObservationModal = () => {
      setIsObservationModalOpen(false);
      setObservationPointsInput({});
  };

  const handleObservationPointChange = (studentId: number, value: string) => {
      let num = parseInt(value);
      if (isNaN(num)) {
          setObservationPointsInput(prev => ({ ...prev, [studentId]: value })); 
          return;
      }
      if (num > 9) num = 9;
      if (num < 1) num = 1;
      setObservationPointsInput(prev => ({ ...prev, [studentId]: num.toString() }));
  };

  const handleSaveObservationPoints = () => {
      if (!activeObservationActivity) {
          alert("Please select an activity/indicator.");
          return;
      }
      if (!setStudents) return;

      setStudents(prev => prev.map(student => {
          const newScoreStr = observationPointsInput[student.id];
          if (newScoreStr) {
              const newScore = parseInt(newScoreStr);
              if (!isNaN(newScore)) {
                   const existingScores: number[] = student.observationScores?.[activeObservationActivity] || [];
                   return {
                       ...student,
                       observationScores: {
                           ...(student.observationScores || {}),
                           [activeObservationActivity]: [...existingScores, newScore]
                       }
                   };
              }
          }
          return student;
      }));

      alert(`Points saved for ${activeObservationActivity}`);
      setObservationPointsInput({}); 
  };

  // --- Copy to Clipboard ---
  const handleCopyToClipboard = () => {
      // Headers
      let text = finalColumns.join('\t') + '\n';
      // Rows
      tableData.forEach(row => {
          const rowText = finalColumns.map(col => row[col] || '').join('\t');
          text += rowText + '\n';
      });
      
      navigator.clipboard.writeText(text).then(() => {
          alert("Table data copied to clipboard!");
      });
  };

  // --- PDF Export Logic for Schedules ---
  const handleShareSchedulePDF = async () => {
      setIsGeneratingPdf(true);
      const originalElement = document.getElementById('generic-module-table-container');
      if (!originalElement) {
          alert("Table not found");
          setIsGeneratingPdf(false);
          return;
      }

      // @ts-ignore
      if (typeof window.html2pdf === 'undefined') {
          alert("PDF generator not loaded");
          setIsGeneratingPdf(false);
          return;
      }

      const clone = originalElement.cloneNode(true) as HTMLElement;
      
      // Transform Inputs to Text
      const inputs = clone.querySelectorAll('input, select, textarea');
      inputs.forEach((input: any) => {
          const val = input.value;
          const parent = input.parentElement;
          if (parent) {
              const span = document.createElement('span');
              span.textContent = val;
              span.style.fontWeight = 'bold';
              parent.replaceChild(span, input);
          }
      });

      // Styling for A4 Fit
      clone.style.margin = '0';
      clone.style.width = '100%';
      clone.style.fontSize = '12px'; // Adjust font size for fit
      const tables = clone.querySelectorAll('table');
      tables.forEach(t => {
          t.style.width = '100%';
          t.style.borderCollapse = 'collapse';
      });

      // Determine Header Title
      let docTitle = module as string;
      if (module === 'Examination Time Table' as any || module === 'Examination Schedule' as any) docTitle = 'PROVISIONAL EXAMINATION SCHEDULE';
      if (module === 'Invigilators List' as any) docTitle = 'INVIGILATOR LIST';
      if (module === 'Observers List' as any) docTitle = 'OBSERVERS LIST';
      if (module === 'Observation Schedule' as any) docTitle = 'OBSERVATION SCHEDULE';
      if (module === 'Class Time Table' as any) docTitle = 'CLASS TIME TABLE';
      if (module === 'Academic Calendar') docTitle = 'ACADEMIC CALENDAR';

      // Header Construction
      const headerDiv = document.createElement('div');
      headerDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 10px; font-family: sans-serif;">
            <h2 style="text-transform: uppercase; color: #1e3a8a; font-weight: bold; margin: 0; font-size: 20px;">${settings?.schoolName}</h2>
            <h3 style="text-transform: uppercase; color: #b91c1c; font-weight: bold; margin: 5px 0; font-size: 16px;">${docTitle}</h3>
            <div style="font-size: 12px; color: #333; font-weight: bold; margin-top: 5px; display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <span>ACADEMIC YEAR: ${settings?.academicYear}</span>
                <span>|</span>
                <span>${settings?.termInfo}</span>
                <span>|</span>
                ${(module !== 'Academic Calendar') ? `<span>CLASS: ${schoolClass}</span>` : `<span>TERM: ${activeTerm}</span>`}
                ${(module === 'Examination Time Table' as any || module === 'Observation Schedule' as any || module === 'Examination Schedule' as any) ? `<span>|</span><span>ENROLMENT: ${students.length}</span>` : ''}
            </div>
        </div>
      `;
      clone.insertBefore(headerDiv, clone.firstChild);

      // Footer Construction (Authorization)
      const footerDiv = document.createElement('div');
      footerDiv.innerHTML = `
        <div style="margin-top: 40px; display: flex; justify-content: space-between; page-break-inside: avoid; font-family: sans-serif; padding: 0 40px;">
          <div style="text-align: center;">
             <div style="border-bottom: 1px solid black; width: 180px; height: 30px;"></div>
             <p style="font-weight: bold; font-size: 12px; margin-top: 5px;">Academic Supervisor</p>
          </div>
          <div style="text-align: center;">
             <div style="border-bottom: 1px solid black; width: 180px; height: 30px;"></div>
             <p style="font-weight: bold; font-size: 12px; margin-top: 5px;">Headteacher</p>
          </div>
        </div>
      `;
      clone.appendChild(footerDiv);

      const opt = {
          margin: [10, 10, 10, 10], // Top, Left, Bottom, Right
          filename: `${module.replace(/\s/g, '_')}_${schoolClass}_Schedule.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
      };

      try {
          // @ts-ignore
          const worker = window.html2pdf().set(opt).from(clone);
          const pdfBlob = await worker.output('blob');
          const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: `${module}` });
          } else {
              const url = URL.createObjectURL(pdfBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = opt.filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          }
      } catch (e) {
          console.error(e);
          alert("Error generating PDF");
      } finally {
          setIsGeneratingPdf(false);
      }
  };

  // --- Share PDF Helper for Analysis ---
  const handleShareAnalysisPDF = async () => {
      setIsGeneratingPdf(true);
      const originalElement = document.getElementById('timetable-analysis-print-area');
      if (!originalElement) { alert("Element not found"); setIsGeneratingPdf(false); return; }

      // @ts-ignore
      if (typeof window.html2pdf === 'undefined') { alert("PDF library not loaded"); setIsGeneratingPdf(false); return; }

      const clone = originalElement.cloneNode(true) as HTMLElement;
      clone.style.margin = '0';
      clone.style.width = '100%';
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.top = '-10000px';
      container.style.left = '0';
      container.style.width = '210mm';
      container.appendChild(clone);
      document.body.appendChild(container);

      const opt = {
          margin: 10,
          filename: `Timetable_Analysis_${schoolClass}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      try {
          // @ts-ignore
          const worker = window.html2pdf().set(opt).from(clone);
          const pdfBlob = await worker.output('blob');
          const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({ files: [file], title: 'Timetable Analysis' });
          } else {
              const url = URL.createObjectURL(pdfBlob);
              const a = document.createElement('a');
              a.href = url;
              a.download = opt.filename;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          }
      } catch (e) {
          console.error(e);
          alert("Error");
      } finally {
          document.body.removeChild(container);
          setIsGeneratingPdf(false);
      }
  };

  // --- Module Handlers ---
  const toggleIndicator = (indicator: string) => {
      if (!settings || !onSettingChange) return;
      const current = settings.activeIndicators || [];
      const next = current.includes(indicator) ? current.filter(i => i !== indicator) : [...current, indicator];
      onSettingChange('activeIndicators', next);
  };
  const handleAddIndicator = () => {
      if (!newIndicator.trim() || !settings || !onSettingChange) return;
      const trimmed = newIndicator.trim();
      const currentCustom = settings.customIndicators || [];
      if (!currentCustom.includes(trimmed)) onSettingChange('customIndicators', [...currentCustom, trimmed]);
      setNewIndicator("");
  };
  const handleDeleteIndicator = (indicator: string) => { /*...*/ };

  // --- ACADEMIC CALENDAR HANDLERS ---
  const handleCalendarChange = (weekIdx: number, field: keyof CalendarWeek, value: any) => {
      if (!settings || !onSettingChange) return;
      const currentCalendar = settings.academicCalendar || {};
      const weeks = [...(currentCalendar[activeTerm] || [])];
      
      if (weeks[weekIdx]) {
          weeks[weekIdx] = { ...weeks[weekIdx], [field]: value };
          onSettingChange('academicCalendar', {
              ...currentCalendar,
              [activeTerm]: weeks
          });
      }
  };

  const openCalendarModal = (weekIdx: number, field: keyof CalendarWeek, options: string[]) => {
      setCalendarModal({ isOpen: true, weekIdx, field, options });
  };

  const syncCalendarDates = () => {
      if (!settings || !onSettingChange) return;
      const weeks = settings.academicCalendar?.[activeTerm] || [];
      
      const vacationWeek = weeks.find(w => w.coreActivity?.includes("Vacation") || w.coreActivity?.includes("Graduation"));
      const reopeningWeek = weeks.find(w => w.coreActivity?.includes("Reopening"));
      // Also check for Mid-Term
      const midTermWeek = weeks.find(w => w.coreActivity?.includes("Mid-Term") || w.period?.includes("Mid-Term"));

      let msg = "Sync Results:\n";
      
      if (vacationWeek && vacationWeek.startDate) {
          // If vacation week starts, maybe use end date as Vacation Date? Let's use Start Date.
          onSettingChange('endDate', vacationWeek.startDate);
          msg += `Vacation Date set to: ${vacationWeek.startDate}\n`;
      } else {
          msg += `Vacation Date not updated (No 'Vacation' activity with date found).\n`;
      }

      if (reopeningWeek && reopeningWeek.startDate) {
          // Reopening implies Next Term Begin usually if it's the *end* of the term plan or the beginning of next.
          // Assuming this calendar plans current term, 'Reopening' at start is current term start.
          // Maybe user wants "Next Term Begins"? That implies a future date not in current plan?
          // OR maybe user enters next term's reopening in week 16?
          // Let's assume user manually updates Next Term Begin for now unless they explicitly mark a week as "Next Term Reopening"
          // But I'll leave the logic for Vacation.
      }
      
      if (midTermWeek && midTermWeek.startDate) {
          // Maybe update term info? Just leaving placeholder.
      }

      alert(msg);
  };

  // --- SUBJECT MANAGEMENT (New) ---
  const handleAddSubject = () => {
      if (!newSubject.trim() || !settings || !onSettingChange) return;
      const trimmed = newSubject.trim();
      const currentCustom = settings.customSubjects || [];
      if (!currentCustom.includes(trimmed)) {
          onSettingChange('customSubjects', [...currentCustom, trimmed]);
      }
      setNewSubject("");
  };

  const handleRemoveCustomSubject = (subject: string) => {
      if (!settings || !onSettingChange) return;
      const currentCustom = settings.customSubjects || [];
      onSettingChange('customSubjects', currentCustom.filter(s => s !== subject));
  };

  const handleToggleStandardSubject = (subject: string) => {
      if (!settings || !onSettingChange) return;
      const disabled = settings.disabledSubjects || [];
      const isCurrentlyDisabled = disabled.includes(subject);
      
      let newDisabled;
      if (isCurrentlyDisabled) {
          // Enable it (remove from disabled list)
          newDisabled = disabled.filter(s => s !== subject);
      } else {
          // Disable it (add to disabled list)
          newDisabled = [...disabled, subject];
      }
      onSettingChange('disabledSubjects', newDisabled);
  };

  // --- ---------------- RENDER ---------------- ---
  
  if (module === 'Academic Calendar') {
      const calendarData = settings?.academicCalendar?.[activeTerm] || [];
      
      // Dynamic Facilitator List for "Lead Team" options
      const staffOptions = settings?.staffList && settings.staffList.length > 0 
        ? settings.staffList.map(s => s.name) 
        : CALENDAR_TEACHERS;

      return (
          <div className="bg-white p-6 rounded shadow-md min-h-[600px] relative">
              <div className="mb-4 pb-2 border-b flex justify-between items-end">
                 <div>
                    <h2 className="text-2xl font-bold text-blue-900 uppercase">
                        <EditableField value={settings?.schoolName || "SCHOOL NAME"} onChange={(v) => onSettingChange?.('schoolName', v)} className="w-full bg-transparent" />
                    </h2>
                    <h3 className="text-xl font-bold text-gray-800 uppercase">Academic Calendar Management Desk</h3>
                    <div className="text-sm text-gray-500 font-semibold mt-1 flex items-center gap-2">
                        <span>Select Active Term:</span>
                        <select 
                            value={activeTerm}
                            onChange={(e) => setActiveTerm(e.target.value as any)}
                            className="border rounded p-1 font-bold text-blue-900 bg-blue-50"
                        >
                            <option value="Term 1">Term 1</option>
                            <option value="Term 2">Term 2</option>
                            <option value="Term 3">Term 3</option>
                        </select>
                    </div>
                 </div>
                 <div className="flex items-center gap-4">
                     <button 
                        onClick={syncCalendarDates}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-xs font-bold shadow flex items-center gap-1"
                     >
                         Sync Dates to Reports
                     </button>
                     <button 
                        onClick={handleShareSchedulePDF}
                        disabled={isGeneratingPdf}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold shadow flex items-center gap-1"
                     >
                         {isGeneratingPdf ? 'Wait...' : 'Share Calendar PDF'}
                     </button>
                 </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex gap-4 mb-4 border-b pb-2">
                 <button onClick={() => setCalendarView('planner')} className={`px-4 py-2 rounded font-bold text-sm ${calendarView === 'planner' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Master Calendar Plan</button>
                 <button onClick={() => setCalendarView('extra_curricular')} className={`px-4 py-2 rounded font-bold text-sm ${calendarView === 'extra_curricular' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>Extra-Curricular Manager</button>
              </div>

              {calendarView === 'planner' && (
                  <div className="overflow-x-auto" id="generic-module-table-container">
                      <table className="w-full text-xs text-left border-collapse border border-gray-300">
                          <thead className="bg-gray-100 uppercase font-bold text-gray-700">
                              <tr>
                                  <th className="p-3 border border-gray-300 w-16 text-center">Week</th>
                                  <th className="p-3 border border-gray-300 w-32">Period</th>
                                  <th className="p-3 border border-gray-300 w-48 text-center bg-blue-50">Date Panel (Begin - End)</th>
                                  <th className="p-3 border border-gray-300">Core Activity</th>
                                  <th className="p-3 border border-gray-300 w-40">Assessment</th>
                                  <th className="p-3 border border-gray-300 w-40">Lead Team</th>
                                  <th className="p-3 border border-gray-300 w-48">Extra Curricular</th>
                              </tr>
                          </thead>
                          <tbody>
                              {calendarData.map((week, idx) => (
                                  <tr key={idx} className="hover:bg-gray-50 border-b">
                                      <td className="p-2 border border-gray-300 text-center font-bold bg-gray-50">{week.week}</td>
                                      <td className="p-2 border border-gray-300">
                                          <EditableField value={week.period || CALENDAR_PERIODS[idx] || ""} onChange={(v) => handleCalendarChange(idx, 'period', v)} className="w-full bg-transparent" />
                                      </td>
                                      {/* Date Panel */}
                                      <td className="p-1 border border-gray-300 bg-blue-50/30">
                                          <div className="flex flex-col gap-1">
                                              <input 
                                                type="date" 
                                                value={week.startDate || ''} 
                                                onChange={(e) => handleCalendarChange(idx, 'startDate', e.target.value)}
                                                className="w-full border border-gray-300 rounded text-[10px] p-0.5"
                                              />
                                              <input 
                                                type="date" 
                                                value={week.endDate || ''} 
                                                onChange={(e) => handleCalendarChange(idx, 'endDate', e.target.value)}
                                                className="w-full border border-gray-300 rounded text-[10px] p-0.5"
                                              />
                                          </div>
                                      </td>
                                      <td className="p-2 border border-gray-300 cursor-pointer hover:bg-blue-50 relative group" onClick={() => openCalendarModal(idx, 'coreActivity', CALENDAR_ACTIVITIES)}>
                                          <div className="w-full min-h-[20px]">{week.coreActivity || <span className="text-gray-400 italic">Select Activity...</span>}</div>
                                      </td>
                                      <td className="p-2 border border-gray-300 cursor-pointer hover:bg-blue-50" onClick={() => openCalendarModal(idx, 'assessment', CALENDAR_ASSESSMENTS)}>
                                          <div className="w-full min-h-[20px]">{week.assessment || <span className="text-gray-400 italic">Select...</span>}</div>
                                      </td>
                                      <td className="p-2 border border-gray-300 cursor-pointer hover:bg-blue-50" onClick={() => openCalendarModal(idx, 'leadTeam', staffOptions)}>
                                          <div className="w-full min-h-[20px]">{week.leadTeam || <span className="text-gray-400 italic">Select Team...</span>}</div>
                                      </td>
                                      <td className="p-2 border border-gray-300 cursor-pointer hover:bg-blue-50" onClick={() => openCalendarModal(idx, 'extraCurricular', CALENDAR_EXTRA_CURRICULAR)}>
                                          <div className="w-full min-h-[20px] font-bold text-blue-800">{week.extraCurricular || <span className="text-gray-400 italic font-normal">Add Activity...</span>}</div>
                                      </td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}

              {calendarView === 'extra_curricular' && (
                  <div className="space-y-4">
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm text-yellow-800 mb-4">
                          <strong>Note:</strong> This view lists only weeks where Extra-Curricular activities have been scheduled in the Master Plan. Use this area to add specific details, resources needed, or notes for the activity.
                      </div>
                      <div className="grid grid-cols-1 gap-4">
                          {calendarData.filter(w => w.extraCurricular).length === 0 && (
                              <div className="text-center p-8 text-gray-500 italic border-2 border-dashed rounded">
                                  No extra-curricular activities scheduled yet. Go to the Master Plan to add them.
                              </div>
                          )}
                          {calendarData.filter(w => w.extraCurricular).map((week, idx) => {
                              // Find original index
                              const originalIdx = calendarData.findIndex(w => w.week === week.week);
                              return (
                                  <div key={week.week} className="border rounded bg-white shadow-sm p-4">
                                      <div className="flex justify-between items-start mb-2 border-b pb-2">
                                          <div>
                                              <span className="text-xs font-bold uppercase text-gray-500">Week {week.week} ({week.period})</span>
                                              <h4 className="text-lg font-bold text-blue-900">{week.extraCurricular}</h4>
                                          </div>
                                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold">Active</span>
                                      </div>
                                      <div>
                                          <label className="block text-xs font-bold uppercase text-gray-600 mb-1">Details / Notes / Resources</label>
                                          <textarea 
                                              value={week.extraCurricularNotes || ''} 
                                              onChange={(e) => handleCalendarChange(originalIdx, 'extraCurricularNotes', e.target.value)}
                                              className="w-full border p-2 rounded text-sm h-24 focus:ring-2 focus:ring-blue-500 outline-none"
                                              placeholder="Enter specific details for this activity..."
                                          />
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              )}

              {/* POP-OUT MODAL FOR CALENDAR SELECTION */}
              {calendarModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                          <div className="flex justify-between items-center mb-4 border-b pb-2">
                              <h3 className="font-bold text-lg text-blue-900">Select {calendarModal.field === 'coreActivity' ? 'Activity' : calendarModal.field === 'assessment' ? 'Assessment' : calendarModal.field === 'leadTeam' ? 'Lead Team' : 'Extra Curricular'}</h3>
                              <button onClick={() => setCalendarModal(null)} className="text-gray-400 hover:text-red-500 font-bold">✕</button>
                          </div>
                          
                          <div className="flex-1 overflow-y-auto pr-2">
                              <div className="grid grid-cols-1 gap-2">
                                  {calendarModal.options.map(option => (
                                      <button 
                                          key={option}
                                          onClick={() => {
                                              handleCalendarChange(calendarModal.weekIdx, calendarModal.field, option);
                                              setCalendarModal(null);
                                          }}
                                          className="text-left px-4 py-2 border rounded hover:bg-blue-50 hover:border-blue-300 text-sm transition-colors"
                                      >
                                          {option}
                                      </button>
                                  ))}
                              </div>
                          </div>
                          
                          <div className="mt-4 pt-4 border-t">
                              <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Or Enter Custom Text:</label>
                              <div className="flex gap-2">
                                  <input 
                                      type="text" 
                                      className="flex-1 border p-2 rounded text-sm"
                                      placeholder="Type custom entry..."
                                      onKeyDown={(e) => {
                                          if (e.key === 'Enter') {
                                              handleCalendarChange(calendarModal.weekIdx, calendarModal.field, (e.target as HTMLInputElement).value);
                                              setCalendarModal(null);
                                          }
                                      }}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // ... (Rest of component remains unchanged from previous implementation)
  if (module === 'Class Time Table' as any) {
      const isEarlyChildhoodTimetable = department === 'Daycare' || department === 'Nursery' || department === 'Kindergarten';
      
      // Early Childhood: Static Activity Based (JSON)
      if (isEarlyChildhoodTimetable) {
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
          const dayData = settings?.classTimetables?.[schoolClass]?.earlyChildhoodSchedule?.[activeDay] || [];

          return (
              <div className="bg-white p-6 rounded shadow-md min-h-[600px] relative" id="generic-module-table-container">
                  <div className="mb-4 pb-2 border-b flex justify-between items-end">
                     <div>
                        <h2 className="text-2xl font-bold text-blue-900 uppercase">
                            <EditableField value={settings?.schoolName || "SCHOOL NAME"} onChange={(v) => onSettingChange?.('schoolName', v)} className="w-full bg-transparent" />
                        </h2>
                        <h3 className="text-xl font-bold text-gray-800 uppercase">Class Time Table (Activity Based)</h3>
                        <div className="text-sm text-gray-500 font-semibold mt-1">
                            {department} &bull; {schoolClass}
                        </div>
                     </div>
                     <div className="flex items-center gap-4">
                         <button 
                            onClick={() => setIsComplianceMode(!isComplianceMode)}
                            className={`px-3 py-1 rounded text-xs font-bold shadow flex items-center gap-1 border transition-colors ${isComplianceMode ? 'bg-purple-600 text-white border-purple-800' : 'bg-white text-purple-700 border-purple-200 hover:bg-purple-50'}`}
                         >
                             {isComplianceMode ? (
                                 <>
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                    Exit Compliance Mode
                                 </>
                             ) : (
                                 'Enter Compliance Mode'
                             )}
                         </button>
                         <button 
                            onClick={handleShareSchedulePDF}
                            disabled={isGeneratingPdf}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-bold shadow flex items-center gap-1"
                         >
                             {isGeneratingPdf ? 'Wait...' : 'Share PDF'}
                         </button>
                     </div>
                  </div>

                  {/* Day Selector Tabs */}
                  <div className="flex gap-2 mb-4 border-b">
                      {days.map(day => (
                          <button
                            key={day}
                            onClick={() => setActiveDay(day)}
                            className={`px-4 py-2 font-bold text-sm rounded-t-lg transition-colors ${activeDay === day ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                          >
                              {day}
                          </button>
                      ))}
                  </div>

                  {/* Compliance Mode Banner */}
                  {isComplianceMode && (
                      <div className="bg-purple-50 border border-purple-200 p-2 text-center text-xs font-bold text-purple-900 mb-4 rounded">
                          COMPLIANCE CHECKLIST MODE ACTIVE: Click on an activity to log attendance, punctuality, or activity deviations.
                      </div>
                  )}

                  {/* Data Table */}
                  <div className="overflow-x-auto">
                      <table className="w-full text-sm text-left border-collapse border border-gray-300">
                          <thead className="bg-gray-100 uppercase text-xs font-bold text-gray-700">
                              <tr>
                                  <th className="p-3 border border-gray-300 w-32">Time Period</th>
                                  <th className="p-3 border border-gray-300">Activity / Learning Area</th>
                                  <th className="p-3 border border-gray-300">Details</th>
                                  <th className="p-3 border border-gray-300 w-48">TLM / Resources</th>
                                  <th className