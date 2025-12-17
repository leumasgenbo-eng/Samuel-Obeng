
import React, { useState, useMemo, useEffect } from 'react';
import EditableField from './EditableField';
import { Department, Module, SchoolClass, GlobalSettings, StudentData, StaffMember, AssessmentColumn, ComplianceLog, ClassTimetableData, ExerciseLog, LessonAssessment, LessonPlan, ObservationScheduleItem, ExamScheduleItem, CalendarWeek, CalendarLists } from '../types';
import { DAYCARE_INDICATORS, getSubjectsForDepartment, SCHOOL_VENUES, DAYCARE_SUBJECTS, DAYCARE_ACTIVITY_GROUPS, DAYCARE_TIMETABLE_GROUPS, DAYCARE_PERIODS, DEPARTMENT_CLASSES, INDICATOR_SCALE_2_POINT, INDICATOR_SCALE_3_POINT, INDICATOR_SCALE_5_POINT, INDICATOR_SCALE_9_POINT, LESSON_ASSESSMENT_CHECKLIST_B, LESSON_OBSERVATION_CHECKLIST_C, DEFAULT_CALENDAR_LISTS, DEFAULT_CALENDAR_WEEKS_TEMPLATE } from '../constants';

interface GenericModuleProps {
  department: Department;
  schoolClass: SchoolClass;
  module: Module | string;
  settings?: GlobalSettings;
  onSettingChange?: (key: keyof GlobalSettings, value: any) => void;
  students?: StudentData[]; // Shared State
  setStudents?: React.Dispatch<React.SetStateAction<StudentData[]>>; // Shared Setter
  onSave?: () => void; // Save Action
}

const BLOOM_LEVELS = [
    "Remembering", "Understanding", "Applying", "Analyzing", "Evaluating", "Creating"
];

const WEEKS = Array.from({length: 16}, (_, i) => `Week ${i + 1}`);

const GenericModule: React.FC<GenericModuleProps> = ({ department, schoolClass, module, settings, onSettingChange, students = [], setStudents, onSave }) => {
  // Generic State
  const [tableData, setTableData] = useState<Record<string, string>[]>([]);
  const [newIndicator, setNewIndicator] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newSubjectName, setNewSubjectName] = useState(""); 
  const [staffData, setStaffData] = useState<StaffMember[]>([]);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // SBA / Daily Assessment State
  const [sbaSubject, setSbaSubject] = useState<string>("");
  const [sbaMode, setSbaMode] = useState<'config' | 'entry' | 'daily'>('daily');
  const [newColTitle, setNewColTitle] = useState("");
  const [newColMax, setNewColMax] = useState(10);
  const [newColDate, setNewColDate] = useState(new Date().toISOString().split('T')[0]);

  // Observation Schedule State
  const [newObservation, setNewObservation] = useState<Partial<ObservationScheduleItem>>({
      date: new Date().toISOString().split('T')[0],
      period: 'L0',
      duration: '30 mins',
      venue: 'Classroom',
      observedGroup: 'All',
      activity: ''
  });

  // Exam Schedule State
  const [examDate, setExamDate] = useState(new Date().toISOString().split('T')[0]);
  const [examTime, setExamTime] = useState("08:00");
  const [examDuration, setExamDuration] = useState("1 hr 30 mins");
  const [examVenue, setExamVenue] = useState(schoolClass); // Default to class name
  const [selectedExamSubjects, setSelectedExamSubjects] = useState<string[]>([]); // For adding new slot

  // Observation Entry State
  const [obsEntryDate, setObsEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [obsEntryPeriod, setObsEntryPeriod] = useState('L0');
  const [obsEntryDuration, setObsEntryDuration] = useState('30 mins');
  const [obsEntryVenue, setObsEntryVenue] = useState('Classroom');
  const [activeIndicatorGroup, setActiveIndicatorGroup] = useState(DAYCARE_ACTIVITY_GROUPS[0].category);
  const [selectedScaleType, setSelectedScaleType] = useState<'2-point' | '3-point' | '5-point' | '9-point'>('3-point');
  // Temporary state for observation scores entry
  const [tempObservationScores, setTempObservationScores] = useState<Record<number, Record<string, string>>>({});

  // Exercise Assessment State
  const [exerciseTab, setExerciseTab] = useState<'entry' | 'dashboard' | 'compliance'>('entry');
  const [currentExerciseEntry, setCurrentExerciseEntry] = useState<Partial<ExerciseLog>>({
      week: 'Week 1',
      date: new Date().toISOString().split('T')[0],
      bloomLevel: [],
      type: 'Classwork',
      questionCount: 5,
      handwritingLegibility: 10,
      handwritingClarity: 10,
      spellingCount: 0,
      appearance: 'Good',
      marked: [],
      defaulters: [],
      missing: [],
      facilitatorPrepared: false,
      pupilConfirmed: false,
      pupilConfirmationName: ''
  });

  // Lesson Assessment State
  const [assessmentTab, setAssessmentTab] = useState<'marking' | 'observation' | 'analysis' | 'compliance'>('marking');
  const [currentAssessment, setCurrentAssessment] = useState<Partial<LessonAssessment>>({
      teacherName: '',
      schoolClass: schoolClass,
      subject: '',
      topic: '',
      date: new Date().toISOString().split('T')[0],
      duration: '60 mins',
      strand: '',
      subStrand: '',
      indicator: '',
      classSize: students.length,
      schemeOfWorkStatus: 'Complete',
      referenceMaterials: true,
      referenceMaterialsCount: 0,
      supervisor: '',
      observationType: 'Live',
      writtenPlanChecks: {},
      observationRatings: {},
      writtenPlanScore: 0,
      observationScore: 0,
      overallEvaluation: 'Lesson requires improvement',
      supervisorComments: ''
  });

  // Calendar State
  const [calTerm, setCalTerm] = useState('Term 1');
  const [calTab, setCalTab] = useState<'Master' | 'Extra' | 'Manage'>('Master');
  const [calModal, setCalModal] = useState<{ isOpen: boolean; weekId: string; field: keyof CalendarWeek; options: string[] } | null>(null);
  const [newListVal, setNewListVal] = useState("");

  // Derived Data
  const isEarlyChildhood = department === 'Daycare' || department === 'Nursery';
  const coreSubjects = useMemo(() => {
      const standard = getSubjectsForDepartment(department);
      const deptCustom = settings?.departmentCustomSubjects?.[department] || [];
      const disabled = settings?.disabledSubjects || [];
      return Array.from(new Set([...standard, ...deptCustom])).filter(s => !disabled.includes(s));
  }, [department, settings?.departmentCustomSubjects, settings?.disabledSubjects]);

  const activeObservers = useMemo(() => {
      return (settings?.staffList || []).filter(s => s.status === 'Observer Active');
  }, [settings?.staffList]);

  // Set default subject for SBA if not set
  useEffect(() => {
      if (!sbaSubject && coreSubjects.length > 0) setSbaSubject(coreSubjects[0]);
  }, [coreSubjects, sbaSubject]);

  // Generate Timetable Options (Memoized)
  const timetableOptions = useMemo(() => {
      const options: React.ReactNode[] = [];
      const timetableActivities = new Set<string>();

      // 1. Add Standard Timetable Groups
      DAYCARE_TIMETABLE_GROUPS.forEach(group => {
          options.push(
              <optgroup key={group.category} label={group.category}>
                  {group.activities.map(act => {
                      timetableActivities.add(act);
                      return <option key={act} value={act}>{act}</option>;
                  })}
              </optgroup>
          );
      });

      // 2. Add Active Indicators (from the other list) if not already present
      const activeExtras = (settings?.activeIndicators || []).filter(ind => !timetableActivities.has(ind));
      
      if (activeExtras.length > 0) {
          options.push(
              <optgroup key="Selected Indicators" label="Selected Indicators (Assessment)">
                  {activeExtras.map(act => (
                      <option key={act} value={act}>{act}</option>
                  ))}
              </optgroup>
          );
      }
      
      return options;
  }, [settings?.activeIndicators]);

  // --- Helpers for SBA/Daily ---
  const checkTimetableMatch = (dateStr: string, subject: string) => {
      if (!dateStr || !subject) return { match: false, day: '', found: false };
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return { match: false, day: 'Invalid Date', found: false };
      
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const timetable = settings?.classTimetables?.[schoolClass];
      
      if (!timetable?.schedule?.[dayName]) return { match: false, day: dayName, found: false };
      
      const hasSubject = Object.values(timetable.schedule[dayName]).some((s: string) => 
          s.toLowerCase().includes(subject.toLowerCase())
      );
      return { match: hasSubject, day: dayName, found: true };
  };

  const checkCalendarWeek = (dateStr: string, catKey: string) => {
      if (!dateStr || !settings?.academicCalendar) return { status: 'Not Configured', color: 'text-gray-400' };
      const config = settings.academicCalendar[catKey];
      if (!config || !config.start || !config.end) return { status: 'Not Configured', color: 'text-gray-400' };

      const target = new Date(dateStr);
      const start = new Date(config.start);
      const end = new Date(config.end);

      if (target >= start && target <= end) return { status: 'Valid Week', color: 'text-green-600' };
      return { status: 'Wrong Week', color: 'text-red-600' };
  };

  const findFreePeriod = (subject: string): string => {
      return "12:00 PM (Break Time) or Post-School";
  };

  // --- Handlers for Lesson Assessment ---
  const calculateScores = () => {
      let wScore = 0;
      Object.entries(LESSON_ASSESSMENT_CHECKLIST_B).forEach(([sectionId, data]) => {
          const totalItems = data.items.length;
          if (totalItems === 0 || data.weight === 0) return;
          let checkedCount = 0;
          data.items.forEach((_, idx) => {
              if (currentAssessment.writtenPlanChecks?.[`${sectionId}.${idx}`]) { checkedCount++; }
          });
          wScore += (checkedCount / totalItems) * data.weight;
      });

      let obsScore = 0;
      let obsMax = 0;
      Object.entries(LESSON_OBSERVATION_CHECKLIST_C).forEach(([sectionId, items]) => {
          items.forEach((_, idx) => {
              obsMax += 4;
              obsScore += (currentAssessment.observationRatings?.[`${sectionId}.${idx}`] || 0);
          });
      });
      
      return { finalWrittenScore: Math.round(wScore), finalObsScore: obsMax > 0 ? Math.round((obsScore / obsMax) * 100) : 0 };
  };

  const handleChecklistToggle = (id: string) => {
      setCurrentAssessment(prev => ({ ...prev, writtenPlanChecks: { ...prev.writtenPlanChecks, [id]: !prev.writtenPlanChecks?.[id] } }));
  };

  const handleRatingChange = (id: string, rating: number) => {
      setCurrentAssessment(prev => ({ ...prev, observationRatings: { ...prev.observationRatings, [id]: rating } }));
  };

  const saveLessonAssessment = () => {
      const { finalWrittenScore, finalObsScore } = calculateScores();
      const newAssessment: LessonAssessment = {
          id: Date.now().toString(),
          ...currentAssessment as LessonAssessment,
          writtenPlanScore: finalWrittenScore,
          observationScore: finalObsScore
      };
      onSettingChange?.('lessonAssessments', [...(settings?.lessonAssessments || []), newAssessment]);
      onSave?.();
      alert("Lesson Assessment Saved Successfully");
  };

  // --- Handlers for Exercise Assessment ---
  const handleSaveExerciseLog = () => {
      if (!currentExerciseEntry.subject || !currentExerciseEntry.week) {
          alert("Subject and Week are required.");
          return;
      }
      
      // Match with Time Table
      let isMatch = false;
      const entryDate = new Date(currentExerciseEntry.date || '');
      if (!isNaN(entryDate.getTime())) {
          const dayName = entryDate.toLocaleDateString('en-US', { weekday: 'long' }); 
          const timetable = settings?.classTimetables?.[schoolClass];
          if (timetable && timetable.schedule) {
              const daySchedule: Record<string, string> = timetable.schedule[dayName] || {};
              isMatch = Object.values(daySchedule).some((subjectName) => 
                  (subjectName || '').toLowerCase().includes((currentExerciseEntry.subject || '').toLowerCase())
              );
          }
      }

      const newLog: ExerciseLog = {
          id: Date.now().toString(),
          schoolClass: schoolClass,
          ...currentExerciseEntry as ExerciseLog,
          classSize: students.length, 
          timetableMatch: isMatch, 
          isLateSubmission: false 
      };

      onSettingChange?.('exerciseLogs', [...(settings?.exerciseLogs || []), newLog]);
      onSave?.();
      alert(`Exercise Entry Saved${isMatch ? " (Matched with Time Table)" : " (⚠️ No Time Table match found)"}`);
      
      // Reset limited fields
      setCurrentExerciseEntry(prev => ({
          ...prev, 
          strand: '', subStrand: '', indicator: '', 
          defaulters: [], marked: [], missing: [],
          legibilityComment: '', clarityComment: '',
          pupilConfirmationName: '', facilitatorPrepared: false
      }));
  };

  const toggleStudentStatus = (studentId: number, status: 'Marked' | 'Defaulter' | 'Missing') => {
      const currentMarked = currentExerciseEntry.marked || [];
      const currentDefaulters = currentExerciseEntry.defaulters || [];
      const currentMissing = currentExerciseEntry.missing || [];
      
      // Remove from all first (exclusive status)
      let newMarked = currentMarked.filter(id => id !== studentId);
      let newDefaulters = currentDefaulters.filter(id => id !== studentId);
      let newMissing = currentMissing.filter(id => id !== studentId);
      
      if (status === 'Marked' && !currentMarked.includes(studentId)) newMarked.push(studentId);
      if (status === 'Defaulter' && !currentDefaulters.includes(studentId)) newDefaulters.push(studentId);
      if (status === 'Missing' && !currentMissing.includes(studentId)) newMissing.push(studentId);
      
      setCurrentExerciseEntry({ ...currentExerciseEntry, marked: newMarked, defaulters: newDefaulters, missing: newMissing });
  };

  const toggleBloomLevel = (level: string) => {
      const currentLevels = currentExerciseEntry.bloomLevel || [];
      const newLevels = currentLevels.includes(level) 
          ? currentLevels.filter(l => l !== level) 
          : [...currentLevels, level];
      setCurrentExerciseEntry({ ...currentExerciseEntry, bloomLevel: newLevels });
  };

  // --- Handlers for Subject Management ---
  const handleAddSubject = () => {
    if (!newSubjectName.trim() || !onSettingChange) return;
    const currentCustom: string[] = (settings?.customSubjects || []) as string[];
    // Explicitly cast to avoid 'unknown' type errors reported
    const subjectNameStr = newSubjectName as string; 
    const dept = department as Department;
    
    if (!currentCustom.includes(subjectNameStr) && !getSubjectsForDepartment(dept).includes(subjectNameStr)) {
        onSettingChange('customSubjects', [...currentCustom, subjectNameStr]);
        setNewSubjectName("");
        onSave?.();
    } else {
        alert("Subject already exists!");
    }
  };

  const handleToggleSubjectStatus = (subj: string) => {
    if (!onSettingChange) return;
    const currentDisabled: string[] = (settings?.disabledSubjects || []) as string[];
    const newDisabled = currentDisabled.includes(subj) 
        ? currentDisabled.filter((s: string) => s !== subj) 
        : [...currentDisabled, subj];
    onSettingChange('disabledSubjects', newDisabled);
    onSave?.();
  };

  const handleDeleteCustomSubject = (subj: string) => {
      if (!onSettingChange) return;
      if (window.confirm(`Delete custom subject "${subj}"?`)) {
          const currentCustom: string[] = (settings?.customSubjects || []) as string[];
          onSettingChange('customSubjects', currentCustom.filter((s: string) => s !== subj));
          onSave?.();
      }
  };

  const handleSharePDF = async (elementId: string, filename: string) => {
      setIsGeneratingPdf(true);
      const element = document.getElementById(elementId);
      if (element && (window as any).html2pdf) {
          await (window as any).html2pdf().from(element).save(filename);
      } else {
          alert("PDF generator not ready.");
      }
      setIsGeneratingPdf(false);
  };

  // --- Handlers for SBA/Daily ---
  const handleAddAssessmentColumn = () => {
      if (!newColTitle) return;
      const newCol: AssessmentColumn = {
          id: Date.now().toString(),
          title: newColTitle,
          maxScore: newColMax,
          date: newColDate
      };
      
      const currentCols = settings?.assessmentColumns?.[sbaSubject] || [];
      const newCols = [...currentCols, newCol];
      const newAssessmentColumns = { ...(settings?.assessmentColumns || {}), [sbaSubject]: newCols };
      
      onSettingChange?.('assessmentColumns', newAssessmentColumns);
      setNewColTitle("");
      onSave?.();
  };

  const handleDeleteAssessmentColumn = (colId: string) => {
      if (!confirm("Delete this assessment column and all scores associated with it?")) return;
      const currentCols = settings?.assessmentColumns?.[sbaSubject] || [];
      const newCols = currentCols.filter(c => c.id !== colId);
      const newAssessmentColumns = { ...(settings?.assessmentColumns || {}), [sbaSubject]: newCols };
      
      onSettingChange?.('assessmentColumns', newAssessmentColumns);
      
      // Cleanup scores
      const newStudents = students.map(s => {
          if (s.assessmentScores?.[sbaSubject]?.[colId]) {
              const newScores = { ...s.assessmentScores[sbaSubject] };
              delete newScores[colId];
              return { ...s, assessmentScores: { ...s.assessmentScores, [sbaSubject]: newScores } };
          }
          return s;
      });
      setStudents?.(newStudents);
      onSave?.();
  };

  const handleSBAConfigChange = (field: string, value: any) => {
      const currentConfig = settings?.sbaConfig?.[sbaSubject] || { 
          cat1Max: 15, cat2Max: 15, cat3Max: 15, 
          cat1Type: 'Individual', cat2Type: 'Group', cat3Type: 'Individual', 
          useRawScore: false 
      };
      
      const newConfig = { ...currentConfig, [field]: value };
      const newSbaConfig = { ...(settings?.sbaConfig || {}), [sbaSubject]: newConfig };
      onSettingChange?.('sbaConfig', newSbaConfig);
  };

  // --- Handlers for Examination Schedule ---
  const handleAddExamSlot = () => {
      if(!examDate || selectedExamSubjects.length === 0) {
          alert("Please select a date and at least one subject.");
          return;
      }
      
      // Enforce max 3 subjects per day check if needed, though this UI adds rows individually
      const currentExams = settings?.examTimeTable || [];
      
      const newItems: ExamScheduleItem[] = selectedExamSubjects.map(sub => ({
          id: Date.now().toString() + Math.random(),
          date: examDate,
          time: examTime,
          duration: examDuration,
          subject: sub,
          class: schoolClass,
          venue: examVenue,
          invigilatorId: '', // To be filled by Auto-Assign
          invigilatorName: 'TBA'
      }));

      onSettingChange?.('examTimeTable', [...currentExams, ...newItems]);
      setSelectedExamSubjects([]);
      onSave?.();
  };

  const handleDeleteExamSlot = (id: string) => {
      if(!onSettingChange) return;
      const currentExams = settings?.examTimeTable || [];
      onSettingChange('examTimeTable', currentExams.filter(x => x.id !== id));
      onSave?.();
  };

  const handleAutoAssignInvigilators = () => {
      const exams = settings?.examTimeTable || [];
      const allStaff = settings?.staffList || [];
      
      if (allStaff.length === 0) {
          alert("No staff registered. Please add staff in Staff Management.");
          return;
      }

      // Sort exams by date/time to process chronologically
      const sortedExams = [...exams].sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());
      
      // Track assignments to load balance: staffId -> count
      const assignmentCount: Record<string, number> = {};
      allStaff.forEach(s => assignmentCount[s.id] = 0);

      // Track busy slots: staffId -> Set("date_time")
      const busySlots: Record<string, Set<string>> = {};
      allStaff.forEach(s => busySlots[s.id] = new Set());

      const updatedExams = sortedExams.map(exam => {
          // If manually locked/set, skip? For now, we overwrite TBA or auto-assigns.
          // Rule 1: Subject Facilitator cannot invigilate their subject
          // Rule 2: Cannot be in two places at once
          
          const slotKey = `${exam.date}_${exam.time}`;
          
          // Get Candidates
          const candidates = allStaff.filter(staff => {
              // Rule 1: Not the subject teacher
              if (staff.subjects.includes(exam.subject)) return false;
              
              // Rule 2: Not busy
              if (busySlots[staff.id].has(slotKey)) return false;
              
              return true;
          });

          // Sort candidates by current load (Round Robin / Balancing)
          candidates.sort((a, b) => assignmentCount[a.id] - assignmentCount[b.id]);

          if (candidates.length > 0) {
              const selected = candidates[0];
              assignmentCount[selected.id]++;
              busySlots[selected.id].add(slotKey);
              
              return {
                  ...exam,
                  invigilatorId: selected.id,
                  invigilatorName: selected.name
              };
          } else {
              return {
                  ...exam,
                  invigilatorId: '',
                  invigilatorName: 'TBA (Conflict)'
              };
          }
      });

      onSettingChange?.('examTimeTable', updatedExams);
      onSave?.();
      alert("Invigilators assigned based on availability and subject constraints.");
  };

  // --- Handlers for Observation Schedule & Entry ---

  const handleAddObservationSchedule = () => {
    if (!newObservation.date || !newObservation.observerId) {
        alert("Date and Observer are required.");
        return;
    }
    
    // Find observer name
    const observer = (settings?.staffList || []).find(s => s.id === newObservation.observerId);

    const newItem: ObservationScheduleItem = {
        id: Date.now().toString(),
        date: newObservation.date || '',
        period: newObservation.period || 'L0',
        duration: newObservation.duration || '30 mins',
        venue: newObservation.venue || 'Classroom',
        observerId: newObservation.observerId,
        observerName: observer?.name || 'Unknown',
        observedGroup: newObservation.observedGroup || 'All',
        activity: newObservation.activity || ''
    };

    const currentTimetable = settings?.classTimetables?.[schoolClass] || { periods: [], schedule: {} };
    const currentSchedule = currentTimetable.observationSchedule || [];
    const newSchedule = [...currentSchedule, newItem];

    const newClassTimetables = {
        ...(settings?.classTimetables || {}),
        [schoolClass]: {
            ...currentTimetable,
            observationSchedule: newSchedule
        }
    };

    onSettingChange?.('classTimetables', newClassTimetables);
    onSave?.();
    setNewObservation(prev => ({ ...prev, activity: '', observedGroup: 'All' }));
  };

  const handleTempScoreChange = (studentId: number, indicator: string, value: string) => {
    setTempObservationScores(prev => ({
        ...prev,
        [studentId]: {
            ...(prev[studentId] || {}),
            [indicator]: value
        }
    }));
  };

  const handleSaveObservationEntry = () => {
    if (!students || !setStudents) return;

    const updatedStudents = students.map(student => {
        const studentUpdates = tempObservationScores[student.id];
        if (!studentUpdates) return student;

        const currentObs = student.observationScores || {};
        const newObs = { ...currentObs };

        Object.entries(studentUpdates).forEach(([indicator, valStr]) => {
            const val = parseFloat(valStr);
            if (!isNaN(val)) {
                const currentScores = newObs[indicator] || [];
                newObs[indicator] = [...currentScores, val];
            }
        });

        return { ...student, observationScores: newObs };
    });

    setStudents(updatedStudents);
    onSave?.();
    setTempObservationScores({});
    alert("Observation Entry Saved.");
  };

  // --- Renderers ---

  const renderMarkingSection = () => (
    <div className="space-y-4 pt-4">
        <h4 className="font-bold text-gray-800 border-b pb-2">Section B: Lesson Plan Evaluation</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(LESSON_ASSESSMENT_CHECKLIST_B).map(([key, section]) => (
                <div key={key} className="border p-3 rounded bg-gray-50">
                    <h5 className="font-bold text-sm text-blue-900 mb-2">{key}. {section.title} ({section.weight}%)</h5>
                    <div className="space-y-1">
                        {section.items.map((item, idx) => {
                            const checkId = `${key}.${idx}`;
                            return (
                                <label key={idx} className="flex items-start gap-2 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={!!currentAssessment.writtenPlanChecks?.[checkId]} 
                                        onChange={() => handleChecklistToggle(checkId)}
                                        className="mt-1"
                                    />
                                    <span className="text-xs text-gray-700">{item}</span>
                                </label>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    </div>
  );

  const renderObservationSection = () => (
      <div className="space-y-4 pt-4">
          <h4 className="font-bold text-gray-800 border-b pb-2">Section C: Live Observation Rating (0-4)</h4>
          <p className="text-xs text-gray-500 italic">0=Not Observed, 1=Poor, 2=Fair, 3=Good, 4=Excellent</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(LESSON_OBSERVATION_CHECKLIST_C).map(([key, items]) => (
                  <div key={key} className="border p-3 rounded bg-white">
                      <h5 className="font-bold text-sm text-green-900 mb-2">{key}</h5>
                      <div className="space-y-2">
                          {items.map((item, idx) => {
                              const ratingId = `${key}.${idx}`;
                              const val = currentAssessment.observationRatings?.[ratingId] || 0;
                              return (
                                  <div key={idx} className="flex justify-between items-center text-xs">
                                      <span className="text-gray-700 w-2/3">{item}</span>
                                      <div className="flex gap-1">
                                          {[0,1,2,3,4].map(r => (
                                              <button 
                                                key={r}
                                                onClick={() => handleRatingChange(ratingId, r)}
                                                className={`w-6 h-6 rounded-full font-bold transition-colors ${val === r ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                              >
                                                  {r}
                                              </button>
                                          ))}
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderAnalysisSection = () => (
      <div className="space-y-4 pt-4">
          <h4 className="font-bold text-gray-800 border-b pb-2">Section F: Qualitative Analysis</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-xs font-bold mb-1">Strengths</label>
                  <EditableField multiline rows={4} value={currentAssessment.strengths || ''} onChange={v => setCurrentAssessment(prev => ({...prev, strengths: v}))} className="w-full border p-2 rounded text-sm bg-gray-50" placeholder="Key strengths observed..." />
              </div>
              <div>
                  <label className="block text-xs font-bold mb-1">Areas for Improvement</label>
                  <EditableField multiline rows={4} value={currentAssessment.areasForImprovement || ''} onChange={v => setCurrentAssessment(prev => ({...prev, areasForImprovement: v}))} className="w-full border p-2 rounded text-sm bg-gray-50" placeholder="Areas needing attention..." />
              </div>
              <div>
                  <label className="block text-xs font-bold mb-1">Notable Behaviors (Teacher/Learners)</label>
                  <EditableField multiline rows={3} value={currentAssessment.notableBehaviors || ''} onChange={v => setCurrentAssessment(prev => ({...prev, notableBehaviors: v}))} className="w-full border p-2 rounded text-sm bg-gray-50" />
              </div>
              <div>
                  <label className="block text-xs font-bold mb-1">Learner Response / Engagement</label>
                  <EditableField multiline rows={3} value={currentAssessment.learnerResponse || ''} onChange={v => setCurrentAssessment(prev => ({...prev, learnerResponse: v}))} className="w-full border p-2 rounded text-sm bg-gray-50" />
              </div>
          </div>
      </div>
  );

  const renderComplianceSection = () => (
      <div className="space-y-4 pt-4">
          <h4 className="font-bold text-gray-800 border-b pb-2">Section D & G: Compliance & Conclusion</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                  <h5 className="font-bold text-sm mb-3">Checklist</h5>
                  <label className="flex items-center gap-2 mb-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={currentAssessment.schemeOfWorkStatus === 'Complete'} onChange={() => setCurrentAssessment(prev => ({...prev, schemeOfWorkStatus: prev.schemeOfWorkStatus === 'Complete' ? '' : 'Complete'}))} className="w-4 h-4" />
                      <span>Scheme of Work Up-to-date</span>
                  </label>
                  <label className="flex items-center gap-2 mb-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={!!currentAssessment.referenceMaterials} onChange={() => setCurrentAssessment(prev => ({...prev, referenceMaterials: !prev.referenceMaterials}))} className="w-4 h-4" />
                      <span>Reference Materials Used</span>
                  </label>
                  <div className="flex items-center gap-2 text-sm mt-3">
                      <span className="font-semibold">Ref Count:</span>
                      <input type="number" value={currentAssessment.referenceMaterialsCount || 0} onChange={e => setCurrentAssessment(prev => ({...prev, referenceMaterialsCount: parseInt(e.target.value)}))} className="w-16 border rounded p-1 bg-white" />
                  </div>
               </div>
               <div>
                  <label className="block text-xs font-bold mb-1">Overall Evaluation</label>
                  <select value={currentAssessment.overallEvaluation} onChange={e => setCurrentAssessment(prev => ({...prev, overallEvaluation: e.target.value}))} className="w-full border p-2 rounded text-sm mb-3 bg-white font-semibold">
                      <option>Lesson requires improvement</option>
                      <option>Lesson was satisfactory</option>
                      <option>Lesson was good</option>
                      <option>Lesson was excellent</option>
                  </select>
                  <label className="block text-xs font-bold mb-1">Supervisor Comments</label>
                  <EditableField multiline rows={3} value={currentAssessment.supervisorComments || ''} onChange={v => setCurrentAssessment(prev => ({...prev, supervisorComments: v}))} className="w-full border p-2 rounded text-sm bg-gray-50" />
               </div>
          </div>
      </div>
  );

  const renderComplianceTab = () => {
      // Calculate ratios per subject
      const subjectPerformance = coreSubjects.map(sub => {
          const subLogs = (settings?.exerciseLogs || []).filter(l => l.schoolClass === schoolClass && l.subject === sub);
          const totalExercises = subLogs.length;
          const matches = subLogs.filter(l => l.timetableMatch).length;
          const ratio = totalExercises > 0 ? (matches / totalExercises) * 100 : 0;
          // Find facilitator for this subject
          const facilitator = (settings?.staffList?.find(s => s.subjects?.includes(sub))?.name || settings?.facilitatorMapping?.[sub] || "Unknown") as string;
          return { subject: sub, total: totalExercises, matches, ratio, facilitator };
      }).sort((a, b) => b.ratio - a.ratio); // Order by highest performance

      const handleInvite = (facilitator: string, subject: string) => {
          const freePeriod = findFreePeriod(subject);
          const msg = `Dear Sir/Madam (${facilitator}), you are invited to the office regarding ${subject} compliance. Suggested time: ${freePeriod}.`;
          alert(`Invitation Generated:\n\n${msg}`);
      };

      return (
          <div className="space-y-6">
              <h3 className="font-bold text-lg text-blue-900">Compliance & Critical Ratios</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subjectPerformance.map(item => (
                      <div key={item.subject} className="border rounded bg-white p-4 shadow-sm relative overflow-hidden">
                          <div className={`absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white rounded-bl ${item.ratio >= 80 ? 'bg-green-500' : item.ratio >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                              {item.ratio.toFixed(0)}%
                          </div>
                          <h4 className="font-bold text-sm text-gray-800">{item.subject}</h4>
                          <p className="text-xs text-gray-500 mb-2">{item.facilitator}</p>
                          <div className="text-xs space-y-1 mb-4">
                              <div className="flex justify-between"><span>Exercises:</span> <strong>{item.total}</strong></div>
                              <div className="flex justify-between"><span>Timetable Matches:</span> <strong>{item.matches}</strong></div>
                          </div>
                          {item.ratio < 80 && (
                              <button onClick={() => handleInvite(item.facilitator, item.subject)} className="w-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold py-2 rounded hover:bg-red-100 flex items-center justify-center gap-2">
                                  <span>📧</span> Invite to Office
                              </button>
                          )}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderAcademicCalendar = () => {
      // Data Setup
      const calendarLists = settings?.calendarLists || DEFAULT_CALENDAR_LISTS;
      const calendarData = settings?.academicCalendar?.[calTerm] || DEFAULT_CALENDAR_WEEKS_TEMPLATE;

      const updateCalendarWeek = (weekId: string, updates: Partial<CalendarWeek>) => {
          const newData = calendarData.map(w => w.id === weekId ? { ...w, ...updates } : w);
          if (onSettingChange) {
              onSettingChange('academicCalendar', { ...(settings?.academicCalendar || {}), [calTerm]: newData });
          }
      };

      const handleListAdd = (key: keyof CalendarLists) => {
          if (!newListVal.trim()) return;
          if (onSettingChange) {
              const currentList = calendarLists[key];
              // Prevent duplicates
              if(!currentList.includes(newListVal)) {
                  const newLists = { ...calendarLists, [key]: [...currentList, newListVal] };
                  onSettingChange('calendarLists', newLists);
              }
              setNewListVal("");
          }
      };

      const handleListRemove = (key: keyof CalendarLists, val: string) => {
          if (onSettingChange) {
              const currentList = calendarLists[key];
              const newLists = { ...calendarLists, [key]: currentList.filter(i => i !== val) };
              onSettingChange('calendarLists', newLists);
          }
      };

      const openModal = (weekId: string, field: keyof CalendarWeek, listKey: keyof CalendarLists) => {
          setCalModal({ isOpen: true, weekId, field, options: calendarLists[listKey] });
      };

      return (
          <div className="bg-white p-6 rounded shadow-md min-h-[600px] flex flex-col">
              {/* Header */}
              <div className="flex flex-wrap justify-between items-center mb-6 border-b pb-4 gap-4">
                  <div>
                      <h2 className="text-2xl font-bold text-indigo-900 uppercase">Academic Calendar Management</h2>
                      <div className="flex gap-2 mt-2">
                          {['Term 1', 'Term 2', 'Term 3'].map(t => (
                              <button 
                                key={t} 
                                onClick={() => setCalTerm(t)} 
                                className={`px-3 py-1 text-xs font-bold rounded-full border ${calTerm === t ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                              >
                                  {t}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={() => setCalTab('Master')} className={`px-4 py-2 rounded text-sm font-bold ${calTab === 'Master' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-500'}`}>Master Plan</button>
                      <button onClick={() => setCalTab('Extra')} className={`px-4 py-2 rounded text-sm font-bold ${calTab === 'Extra' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-500'}`}>Extra-Curricular</button>
                      <button onClick={() => setCalTab('Manage')} className={`px-4 py-2 rounded text-sm font-bold ${calTab === 'Manage' ? 'bg-indigo-100 text-indigo-900' : 'text-gray-500'}`}>List Manager</button>
                      <button onClick={() => handleSharePDF('academic-calendar-print', 'Academic_Calendar.pdf')} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold shadow hover:bg-green-700">Export PDF</button>
                  </div>
              </div>

              {/* Master Plan Grid */}
              {calTab === 'Master' && (
                  <div id="academic-calendar-print" className="overflow-x-auto border rounded bg-white shadow-inner flex-1">
                      <table className="w-full text-xs text-left border-collapse">
                          <thead className="bg-indigo-50 text-indigo-900 uppercase sticky top-0 z-10">
                              <tr>
                                  <th className="p-3 border">Period / Week</th>
                                  <th className="p-3 border w-24">Date From</th>
                                  <th className="p-3 border w-24">Date To</th>
                                  <th className="p-3 border">Activity</th>
                                  <th className="p-3 border">Assessment</th>
                                  <th className="p-3 border">Lead Team</th>
                                  <th className="p-3 border">Extra-Curricular</th>
                              </tr>
                          </thead>
                          <tbody>
                              {calendarData.map(week => (
                                  <tr key={week.id} className="hover:bg-indigo-50 border-b">
                                      <td className="p-3 border font-bold text-gray-700 bg-gray-50">{week.period}</td>
                                      <td className="p-1 border"><input type="date" className="w-full bg-transparent border-none focus:ring-0 text-xs" value={week.dateFrom} onChange={e => updateCalendarWeek(week.id, { dateFrom: e.target.value })} /></td>
                                      <td className="p-1 border"><input type="date" className="w-full bg-transparent border-none focus:ring-0 text-xs" value={week.dateTo} onChange={e => updateCalendarWeek(week.id, { dateTo: e.target.value })} /></td>
                                      
                                      <td className="p-3 border cursor-pointer hover:bg-indigo-100 font-semibold" onClick={() => openModal(week.id, 'activity', 'activities')}>{week.activity || <span className="text-gray-300 italic">Select...</span>}</td>
                                      <td className="p-3 border cursor-pointer hover:bg-indigo-100" onClick={() => openModal(week.id, 'assessment', 'assessments')}>{week.assessment || <span className="text-gray-300 italic">Select...</span>}</td>
                                      <td className="p-3 border cursor-pointer hover:bg-indigo-100" onClick={() => openModal(week.id, 'leadTeam', 'leadTeam_teachers' as any)}>{week.leadTeam || <span className="text-gray-300 italic">Select...</span>}</td>
                                      <td className="p-3 border cursor-pointer hover:bg-indigo-100" onClick={() => openModal(week.id, 'extraCurricular', 'extra_curricular' as any)}>{week.extraCurricular || <span className="text-gray-300 italic">Select...</span>}</td>
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  </div>
              )}

              {/* Extra-Curricular Manager */}
              {calTab === 'Extra' && (
                  <div className="space-y-4">
                      <h3 className="font-bold text-lg text-gray-700 border-b pb-2">Extra-Curricular Logistics & Notes</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {calendarData.filter(w => w.extraCurricular).map(week => (
                              <div key={week.id} className="bg-gray-50 border p-4 rounded shadow-sm">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-bold text-indigo-800">{week.period}</h4>
                                      <span className="text-xs bg-white border px-2 py-1 rounded">{week.extraCurricular}</span>
                                  </div>
                                  <textarea 
                                    className="w-full border p-2 text-xs rounded h-24 focus:ring-2 focus:ring-indigo-500"
                                    placeholder="Enter logistics, requirements, notes..."
                                    value={week.extraCurricularNotes || ''}
                                    onChange={e => updateCalendarWeek(week.id, { extraCurricularNotes: e.target.value })}
                                  />
                              </div>
                          ))}
                          {calendarData.every(w => !w.extraCurricular) && <div className="col-span-3 text-center text-gray-500 py-10 italic">No extra-curricular activities selected in Master Plan yet.</div>}
                      </div>
                  </div>
              )}

              {/* List Manager */}
              {calTab === 'Manage' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {['activities', 'leadTeam_teachers', 'extra_curricular'].map((key: any) => (
                          <div key={key} className="bg-gray-50 p-4 rounded border">
                              <h4 className="font-bold text-sm uppercase mb-4 text-gray-700">{key.replace('_', ' ')}</h4>
                              <div className="flex gap-2 mb-4">
                                  <input type="text" className="border p-1 text-xs flex-1 rounded" placeholder="New Item..." value={key === calModal?.field ? newListVal : ''} onChange={e => { setCalModal({ ...calModal!, field: key }); setNewListVal(e.target.value); }} />
                                  <button onClick={() => handleListAdd(key)} className="bg-green-600 text-white px-3 py-1 rounded text-xs font-bold">+</button>
                              </div>
                              <div className="h-96 overflow-y-auto bg-white border rounded">
                                  {(calendarLists[key as keyof CalendarLists] || []).map((item: string) => (
                                      <div key={item} className="p-2 border-b text-xs flex justify-between items-center hover:bg-gray-50">
                                          <span>{item}</span>
                                          <button onClick={() => handleListRemove(key, item)} className="text-red-500 font-bold ml-2">×</button>
                                      </div>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* Selection Modal */}
              {calModal && calModal.isOpen && (
                  <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50" onClick={() => setCalModal(null)}>
                      <div className="bg-white p-6 rounded shadow-xl w-96 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                          <h3 className="font-bold text-lg mb-4 capitalize">Select {calModal.field}</h3>
                          <input 
                            type="text" 
                            className="border p-2 mb-4 w-full rounded text-sm" 
                            placeholder="Search or type custom..." 
                            onChange={(e) => {
                                // Search logic not fully implemented for brevity, relies on visual scan or direct custom entry handling if needed
                            }}
                            onKeyDown={(e) => {
                                if(e.key === 'Enter') {
                                    updateCalendarWeek(calModal.weekId, { [calModal.field]: (e.target as HTMLInputElement).value });
                                    setCalModal(null);
                                }
                            }}
                          />
                          <div className="overflow-y-auto flex-1 space-y-1">
                              <button onClick={() => { updateCalendarWeek(calModal.weekId, { [calModal.field]: '' }); setCalModal(null); }} className="w-full text-left p-2 hover:bg-red-50 text-red-600 text-sm font-bold border-b">Clear / None</button>
                              {calModal.options.map(opt => (
                                  <button 
                                    key={opt} 
                                    onClick={() => { updateCalendarWeek(calModal.weekId, { [calModal.field]: opt }); setCalModal(null); }}
                                    className="w-full text-left p-2 hover:bg-indigo-50 text-sm border-b last:border-0"
                                  >
                                      {opt}
                                  </button>
                              ))}
                          </div>
                          <button onClick={() => setCalModal(null)} className="mt-4 bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-bold w-full">Cancel</button>
                      </div>
                  </div>
              )}
          </div>
      );
  };

  if (module === 'Academic Calendar' as any) {
      return renderAcademicCalendar();
  }

  if (module === 'Exercise Assessment') {
      const logs = (settings?.exerciseLogs || []).filter(l => l.schoolClass === schoolClass);
      
      const renderEntryTab = () => (
          <div className="space-y-4">
              <div className="bg-white p-4 rounded border grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                      <label className="text-xs font-bold block mb-1">Subject</label>
                      <select value={currentExerciseEntry.subject} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, subject: e.target.value})} className="w-full border p-2 rounded text-sm">
                          <option value="">Select Subject...</option>
                          {coreSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                  </div>
                  <div>
                      <label className="text-xs font-bold block mb-1">Week</label>
                      <select value={currentExerciseEntry.week} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, week: e.target.value})} className="w-full border p-2 rounded text-sm">
                          {WEEKS.map(w => <option key={w} value={w}>{w}</option>)}
                      </select>
                  </div>
                  <div><label className="text-xs font-bold block mb-1">Date</label><input type="date" value={currentExerciseEntry.date} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, date: e.target.value})} className="w-full border p-2 rounded text-sm"/></div>
                  <div><label className="text-xs font-bold block mb-1">Class Size</label><div className="p-2 bg-gray-100 rounded text-sm font-bold">{students.length}</div></div>
                  <div>
                      <label className="text-xs font-bold block mb-1">Exercise Type</label>
                      <select value={currentExerciseEntry.type} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, type: e.target.value as any})} className="w-full border p-2 rounded text-sm">
                          <option value="Classwork">Classwork</option>
                          <option value="Home Assignment">Home Assignment</option>
                          <option value="Project">Project</option>
                      </select>
                  </div>
                  <div className="col-span-1 lg:col-span-3 grid grid-cols-3 gap-2">
                      <input type="text" placeholder="Strand" className="border p-2 rounded text-sm" value={currentExerciseEntry.strand} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, strand: e.target.value})} />
                      <input type="text" placeholder="Sub-Strand" className="border p-2 rounded text-sm" value={currentExerciseEntry.subStrand} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, subStrand: e.target.value})} />
                      <input type="text" placeholder="Indicator" className="border p-2 rounded text-sm" value={currentExerciseEntry.indicator} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, indicator: e.target.value})} />
                  </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Lists */}
                  <div className="bg-white p-4 rounded border">
                      <h4 className="font-bold text-sm mb-2 border-b pb-1">Pupil Check (Defaulters / Missing)</h4>
                      <div className="h-64 overflow-y-auto space-y-1">
                          {students.map(s => (
                              <div key={s.id} className="flex items-center gap-2 text-xs hover:bg-gray-50 p-1">
                                  <span className="flex-1 font-semibold">{s.name}</span>
                                  <button onClick={() => toggleStudentStatus(s.id, 'Defaulter')} className={`px-2 py-0.5 rounded border ${currentExerciseEntry.defaulters?.includes(s.id) ? 'bg-red-500 text-white' : 'bg-white'}`}>Def</button>
                                  <button onClick={() => toggleStudentStatus(s.id, 'Missing')} className={`px-2 py-0.5 rounded border ${currentExerciseEntry.missing?.includes(s.id) ? 'bg-orange-500 text-white' : 'bg-white'}`}>Mis</button>
                                  <button onClick={() => toggleStudentStatus(s.id, 'Marked')} className={`px-2 py-0.5 rounded border ${currentExerciseEntry.marked?.includes(s.id) ? 'bg-green-500 text-white' : 'bg-white'}`}>Mkd</button>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* Quality & Bloom */}
                  <div className="space-y-4">
                      <div className="bg-white p-4 rounded border">
                          <h4 className="font-bold text-sm mb-2 border-b pb-1">Bloom's Taxonomy (Question Nature)</h4>
                          <div className="flex flex-wrap gap-2">
                              {BLOOM_LEVELS.map(level => (
                                  <label key={level} className="flex items-center gap-1 text-xs cursor-pointer bg-gray-50 px-2 py-1 rounded border">
                                      <input type="checkbox" checked={currentExerciseEntry.bloomLevel?.includes(level)} onChange={() => toggleBloomLevel(level)} />
                                      {level}
                                  </label>
                              ))}
                          </div>
                          <div className="mt-2">
                              <label className="text-xs font-bold">No. of Questions:</label>
                              <input type="number" className="border p-1 w-16 ml-2 rounded text-sm" value={currentExerciseEntry.questionCount} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, questionCount: parseInt(e.target.value)})} />
                          </div>
                      </div>

                      <div className="bg-white p-4 rounded border space-y-2">
                          <h4 className="font-bold text-sm mb-2 border-b pb-1">Quality Checks</h4>
                          <div className="flex justify-between items-center text-xs">
                              <span>Handwriting Legibility (1-10):</span>
                              <input type="number" max="10" className="border w-12 text-center" value={currentExerciseEntry.handwritingLegibility} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, handwritingLegibility: parseInt(e.target.value)})} />
                          </div>
                          <div className="flex justify-between items-center text-xs">
                              <span>Handwriting Clarity (1-10):</span>
                              <input type="number" max="10" className="border w-12 text-center" value={currentExerciseEntry.handwritingClarity} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, handwritingClarity: parseInt(e.target.value)})} />
                          </div>
                          <div className="flex justify-between items-center text-xs">
                              <span>Spelling Mastery Count:</span>
                              <input type="number" className="border w-12 text-center" value={currentExerciseEntry.spellingCount} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, spellingCount: parseInt(e.target.value)})} />
                              <span className="text-gray-500">/ {students.length}</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                              <span>Appearance:</span>
                              <select value={currentExerciseEntry.appearance} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, appearance: e.target.value as any})} className="border p-1 rounded">
                                  <option>Good</option><option>Fair</option><option>Poor</option>
                              </select>
                          </div>
                      </div>
                      
                      <div className="bg-green-50 p-2 rounded border border-green-200">
                          <label className="flex items-center gap-2 text-xs font-bold text-green-900 cursor-pointer">
                              <input type="checkbox" checked={currentExerciseEntry.facilitatorPrepared} onChange={e => setCurrentExerciseEntry({...currentExerciseEntry, facilitatorPrepared: e.target.checked})} />
                              Facilitator has test items prepared?
                          </label>
                      </div>
                  </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                  <button onClick={handleSaveExerciseLog} className="bg-blue-600 text-white px-6 py-2 rounded font-bold shadow hover:bg-blue-700">Save Entry</button>
              </div>
          </div>
      );

      const renderDashboardTab = () => (
          <div className="space-y-4">
              <h3 className="font-bold text-lg text-blue-900">Exercise Analysis Dashboard</h3>
              <div className="overflow-x-auto border rounded bg-white">
                  <table className="w-full text-xs text-left">
                      <thead className="bg-gray-100 text-gray-700 uppercase">
                          <tr>
                              <th className="p-2 border">Week</th>
                              <th className="p-2 border">Subject</th>
                              <th className="p-2 border">Type</th>
                              <th className="p-2 border">Questions</th>
                              <th className="p-2 border">Bloom's Levels</th>
                              <th className="p-2 border">Defaulters</th>
                              <th className="p-2 border">TimeTable Match</th>
                          </tr>
                      </thead>
                      <tbody>
                          {logs.map(log => (
                              <tr key={log.id} className="border-b hover:bg-gray-50">
                                  <td className="p-2 border">{log.week}</td>
                                  <td className="p-2 border font-bold">{log.subject}</td>
                                  <td className="p-2 border">{log.type}</td>
                                  <td className="p-2 border text-center">{log.questionCount}</td>
                                  <td className="p-2 border">{log.bloomLevel?.join(", ")}</td>
                                  <td className="p-2 border text-red-600 font-bold text-center">{log.defaulters?.length || 0}</td>
                                  <td className="p-2 border text-center">
                                      {log.timetableMatch ? <span className="text-green-600">✔ Match</span> : <span className="text-red-500 font-bold">⚠ Mismatch</span>}
                                  </td>
                              </tr>
                          ))}
                          {logs.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-gray-500">No exercise logs found.</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
      );

      return (
          <div className="bg-white p-6 rounded shadow-md min-h-[600px]">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-blue-900 uppercase">Exercise Assessment Module</h2>
                  <div className="flex gap-2">
                      <button onClick={() => setExerciseTab('entry')} className={`px-4 py-2 rounded text-sm font-bold ${exerciseTab === 'entry' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Daily Entry</button>
                      <button onClick={() => setExerciseTab('dashboard')} className={`px-4 py-2 rounded text-sm font-bold ${exerciseTab === 'dashboard' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Analysis Dashboard</button>
                      <button onClick={() => setExerciseTab('compliance')} className={`px-4 py-2 rounded text-sm font-bold ${exerciseTab === 'compliance' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'}`}>Compliance & Ratios</button>
                  </div>
              </div>

              {exerciseTab === 'entry' && renderEntryTab()}
              {exerciseTab === 'dashboard' && renderDashboardTab()}
              {exerciseTab === 'compliance' && renderComplianceTab()}
          </div>
      );
  }

  if (module === 'School Based Assessment (SBA)' || module === 'Daily Assessment') {
      const sbaConfig = settings?.sbaConfig?.[sbaSubject] || { 
          cat1Max: 15, cat2Max: 15, cat3Max: 15, 
          cat1Type: 'Individual', cat2Type: 'Group', cat3Type: 'Individual', 
          useRawScore: false,
          cat1Date: '', cat2Date: '', cat3Date: ''
      };
      const columns = settings?.assessmentColumns?.[sbaSubject] || [];

      // Calculate Timetable Ratio
      let matchCount = 0;
      let totalDates = 0;
      if(sbaConfig.cat1Date) { totalDates++; if(checkTimetableMatch(sbaConfig.cat1Date, sbaSubject).match) matchCount++; }
      if(sbaConfig.cat2Date) { totalDates++; if(checkTimetableMatch(sbaConfig.cat2Date, sbaSubject).match) matchCount++; }
      if(sbaConfig.cat3Date) { totalDates++; if(checkTimetableMatch(sbaConfig.cat3Date, sbaSubject).match) matchCount++; }
      const complianceRatio = totalDates > 0 ? Math.round((matchCount / totalDates) * 100) : 0;

      return (
          <div className="bg-white p-6 rounded shadow-md min-h-[600px] border-t-4 border-blue-600">
              <div className="flex flex-col md:flex-row justify-between items-center mb-6 border-b pb-4 gap-4">
                  <div>
                      <h2 className="text-2xl font-bold text-blue-900 uppercase">Daily Exercise Record & SBA</h2>
                      <div className="text-sm font-bold text-gray-500">{department} - {schoolClass}</div>
                  </div>
                  <div className="flex gap-4 items-center bg-gray-50 p-2 rounded border border-gray-200 shadow-inner">
                      <label className="text-xs font-bold text-gray-600 uppercase">Select Subject:</label>
                      <select 
                          value={sbaSubject} 
                          onChange={(e) => setSbaSubject(e.target.value)} 
                          className="border p-2 rounded text-sm font-bold bg-white text-blue-900 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                          {coreSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      {complianceRatio > 0 && (
                          <div className={`text-xs font-bold px-2 py-1 rounded ${complianceRatio === 100 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
                              Timetable Match: {complianceRatio}%
                          </div>
                      )}
                  </div>
              </div>

              {/* Sub-Tabs */}
              <div className="flex gap-1 overflow-x-auto mb-6 bg-gray-100 p-1 rounded border border-gray-200">
                  <button onClick={() => setSbaMode('daily')} className={`px-4 py-2 text-sm font-bold rounded transition-colors ${sbaMode === 'daily' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}>1. Daily Assessment of Subject Score</button>
                  <button onClick={() => setSbaMode('config')} className={`px-4 py-2 text-sm font-bold rounded transition-colors ${sbaMode === 'config' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}>2. SBA Configuration & Entry</button>
              </div>

              {/* --- DAILY ASSESSMENT VIEW --- */}
              {sbaMode === 'daily' && (
                  <div>
                      <div className="flex gap-4 items-end mb-4 bg-blue-50 p-4 rounded border border-blue-100 shadow-sm">
                          <div className="flex-1">
                              <label className="text-xs font-bold text-blue-800 block mb-2 uppercase">Add New Subject-Indicator / Task</label>
                              <div className="flex gap-2">
                                  <input type="date" value={newColDate} onChange={e => setNewColDate(e.target.value)} className="w-32 border p-2 rounded text-sm" />
                                  <input type="text" value={newColTitle} onChange={e => setNewColTitle(e.target.value)} placeholder="Indicator / Topic..." className="flex-1 border p-2 rounded text-sm" />
                                  <div className="relative">
                                      <input type="number" value={newColMax} onChange={e => setNewColMax(parseInt(e.target.value))} className="w-20 border p-2 rounded text-sm text-center" placeholder="Max" />
                                      <span className="absolute right-1 top-2 text-[10px] text-gray-400 font-bold">MAX</span>
                                  </div>
                              </div>
                          </div>
                          <button onClick={handleAddAssessmentColumn} className="bg-blue-600 text-white px-6 py-2 rounded font-bold hover:bg-blue-700 h-10 text-sm shadow">
                              + Add Assessment
                          </button>
                      </div>

                      <div className="overflow-x-auto border rounded max-h-[500px] shadow-inner bg-white">
                          <table className="w-full text-sm border-collapse">
                              <thead className="bg-gray-100 text-xs font-bold text-gray-700 sticky top-0 z-10 shadow-sm">
                                  <tr>
                                      <th className="p-3 border text-left min-w-[200px] sticky left-0 bg-gray-100 shadow-r">Pupil Name</th>
                                      {columns.map(col => (
                                          <th key={col.id} className="p-2 border text-center min-w-[120px] bg-gray-50 group relative hover:bg-gray-100">
                                              <div className="text-[10px] text-gray-500 font-mono">{col.date}</div>
                                              <div className="truncate w-32 mx-auto font-bold text-blue-900" title={col.title}>{col.title}</div>
                                              <div className="text-[9px] text-gray-400 font-bold bg-gray-200 px-1 rounded inline-block mt-1">Max: {col.maxScore}</div>
                                              <button onClick={() => handleDeleteAssessmentColumn(col.id)} className="absolute top-1 right-1 text-red-400 hover:text-red-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-white rounded-full w-4 h-4 flex items-center justify-center shadow">×</button>
                                          </th>
                                      ))}
                                      <th className="p-3 border text-center w-24 bg-blue-100 text-blue-900 font-black sticky right-0 shadow-l">
                                          Avg Daily Score
                                      </th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {students.map((student, idx) => {
                                      let total = 0;
                                      let maxTotal = 0;
                                      return (
                                          <tr key={student.id} className="border-b hover:bg-blue-50 transition-colors">
                                              <td className="p-3 border font-bold uppercase text-xs sticky left-0 bg-white shadow-r">
                                                  <span className="text-gray-400 mr-2 text-[10px]">{idx + 1}.</span>
                                                  {student.name}
                                              </td>
                                              {columns.map(col => {
                                                  const score = student.assessmentScores?.[sbaSubject]?.[col.id] || 0;
                                                  total += score;
                                                  maxTotal += col.maxScore;
                                                  return (
                                                      <td key={col.id} className="p-2 border text-center relative">
                                                          <input 
                                                            type="number" 
                                                            min="0" 
                                                            max={col.maxScore}
                                                            value={student.assessmentScores?.[sbaSubject]?.[col.id] ?? ''} 
                                                            onChange={(e) => {
                                                                const val = parseFloat(e.target.value);
                                                                if (!isNaN(val) && val <= col.maxScore) {
                                                                    const currentScores = student.assessmentScores?.[sbaSubject] || {};
                                                                    const newScores = { ...currentScores, [col.id]: val };
                                                                    const newStudent = { ...student, assessmentScores: { ...student.assessmentScores, [sbaSubject]: newScores } };
                                                                    setStudents?.(prev => prev.map(s => s.id === student.id ? newStudent : s));
                                                                }
                                                            }}
                                                            className="w-16 text-center border p-1 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-gray-700 bg-gray-50 focus:bg-white"
                                                            placeholder="-"
                                                          />
                                                      </td>
                                                  )
                                              })}
                                              <td className="p-3 border text-center font-bold bg-blue-50 text-blue-900 sticky right-0 shadow-l text-lg">
                                                  {maxTotal > 0 ? Math.round((total / maxTotal) * 100) : 0}%
                                              </td>
                                          </tr>
                                      )
                                  })}
                                  {students.length === 0 && <tr><td colSpan={columns.length + 2} className="p-8 text-center text-gray-500 italic">No students found.</td></tr>}
                              </tbody>
                          </table>
                      </div>
                  </div>
              )}

              {/* --- SBA CONFIGURATION & ENTRY VIEW --- */}
              {sbaMode === 'config' && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Configuration Panel */}
                      <div className="lg:col-span-1 space-y-4">
                          <div className="bg-blue-50 p-4 rounded border border-blue-200 shadow-sm">
                              <h4 className="font-bold text-blue-900 mb-3 border-b border-blue-300 pb-1 text-sm uppercase">SBA Configuration</h4>
                              
                              {['cat1', 'cat2', 'cat3'].map((cat, i) => {
                                  const dateKey = `${cat}Date`;
                                  const maxKey = `${cat}Max`;
                                  const typeKey = `${cat}Type`;
                                  const dateVal = sbaConfig[dateKey as keyof typeof sbaConfig] as string;
                                  const typeVal = sbaConfig[typeKey as keyof typeof sbaConfig] || (i === 1 ? 'Group' : 'Individual'); // Default: 1=Ind, 2=Grp, 3=Ind
                                  const timetableCheck = checkTimetableMatch(dateVal, sbaSubject);
                                  const calendarCheck = checkCalendarWeek(dateVal, `CAT ${i+1}`);

                                  return (
                                      <div key={cat} className="mb-4 bg-white p-3 rounded shadow-sm border border-gray-200 relative overflow-hidden">
                                          <div className={`absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold text-white rounded-bl ${typeVal === 'Individual' ? 'bg-purple-500' : 'bg-orange-500'}`}>
                                              {typeVal}
                                          </div>
                                          <div className="flex justify-between items-center mb-2">
                                              <span className="font-bold text-sm text-gray-700 uppercase flex items-center gap-2">
                                                  <span className="bg-gray-200 text-gray-700 w-5 h-5 rounded-full flex items-center justify-center text-xs">{i+1}</span>
                                                  CAT {i+1}
                                              </span>
                                              <select 
                                                value={typeVal} 
                                                onChange={(e) => handleSBAConfigChange(typeKey, e.target.value)}
                                                className="text-xs border rounded p-1 font-semibold text-gray-600 bg-gray-50"
                                              >
                                                  <option value="Individual">Individual</option>
                                                  <option value="Group">Group</option>
                                              </select>
                                          </div>
                                          <div className="grid grid-cols-2 gap-2 mb-2">
                                              <div>
                                                  <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Date</label>
                                                  <input 
                                                    type="date" 
                                                    value={dateVal || ''} 
                                                    onChange={(e) => handleSBAConfigChange(dateKey, e.target.value)}
                                                    className={`w-full border p-1 rounded text-xs font-medium ${!timetableCheck.match && dateVal ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-300'}`}
                                                  />
                                              </div>
                                              <div>
                                                  <label className="text-[10px] font-bold text-gray-500 block mb-0.5">Max Score</label>
                                                  <input 
                                                    type="number" 
                                                    value={sbaConfig[maxKey as keyof typeof sbaConfig] as number} 
                                                    onChange={(e) => handleSBAConfigChange(maxKey, parseInt(e.target.value))}
                                                    className="w-full border p-1 rounded text-xs text-center font-bold"
                                                  />
                                              </div>
                                          </div>
                                          {dateVal && (
                                              <div className="flex flex-col gap-1 mt-1 pt-1 border-t border-dashed">
                                                  <div className="flex items-center gap-1 text-[10px]">
                                                      <span className="text-gray-400">TimeTable:</span>
                                                      {timetableCheck.match ? (
                                                          <span className="text-green-600 font-bold flex items-center gap-1">✓ Match ({timetableCheck.day})</span>
                                                      ) : (
                                                          <span className="text-red-600 font-bold flex items-center gap-1">⚠ Mismatch ({timetableCheck.day || 'N/A'})</span>
                                                      )}
                                                  </div>
                                                  <div className="flex items-center gap-1 text-[10px]">
                                                      <span className="text-gray-400">Calendar:</span>
                                                      <span className={`font-bold ${calendarCheck.color}`}>{calendarCheck.status}</span>
                                                  </div>
                                              </div>
                                          )}
                                      </div>
                                  )
                              })}
                              
                              <button onClick={onSave} className="w-full bg-blue-600 text-white text-xs font-bold py-2 rounded shadow hover:bg-blue-700 mt-2 flex items-center justify-center gap-2">
                                  <span>💾</span> Save Configuration
                              </button>
                          </div>
                      </div>

                      {/* Entry Table */}
                      <div className="lg:col-span-2 bg-white rounded border border-gray-200 overflow-hidden flex flex-col h-[600px] shadow-sm">
                          <div className="bg-gray-100 p-3 border-b font-bold text-gray-700 text-sm flex justify-between items-center">
                              <span>SBA Score Entry (Assessment of Learning)</span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">Total Max: {sbaConfig.cat1Max + sbaConfig.cat2Max + sbaConfig.cat3Max}</span>
                          </div>
                          <div className="overflow-auto flex-1">
                              <table className="w-full text-sm border-collapse">
                                  <thead className="bg-gray-50 text-xs font-bold text-gray-600 sticky top-0 z-10 shadow-sm">
                                      <tr>
                                          <th className="p-3 border text-left min-w-[150px]">Pupil Name</th>
                                          <th className="p-2 border text-center w-24">CAT 1 ({sbaConfig.cat1Max})</th>
                                          <th className="p-2 border text-center w-24">CAT 2 ({sbaConfig.cat2Max})</th>
                                          <th className="p-2 border text-center w-24">CAT 3 ({sbaConfig.cat3Max})</th>
                                          <th className="p-3 border text-center w-24 bg-blue-50 text-blue-900">Total</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {students.map((student, idx) => {
                                          const scores = student.assessmentScores?.[sbaSubject] || {};
                                          const cat1 = scores['cat1'] || 0;
                                          const cat2 = scores['cat2'] || 0;
                                          const cat3 = scores['cat3'] || 0;
                                          const total = cat1 + cat2 + cat3;

                                          const updateScore = (key: string, val: string) => {
                                              const num = parseFloat(val) || 0;
                                              const max = sbaConfig[`${key}Max` as keyof typeof sbaConfig] as number;
                                              if (num <= max) {
                                                  const newScores = { ...scores, [key]: num };
                                                  const newStudent = { ...student, assessmentScores: { ...student.assessmentScores, [sbaSubject]: newScores } };
                                                  setStudents?.(prev => prev.map(s => s.id === student.id ? newStudent : s));
                                              }
                                          };

                                          return (
                                              <tr key={student.id} className="border-b hover:bg-gray-50">
                                                  <td className="p-3 border font-bold uppercase text-xs">
                                                      <span className="text-gray-400 mr-2 text-[10px]">{idx + 1}.</span>
                                                      {student.name}
                                                  </td>
                                                  <td className="p-2 border text-center">
                                                      <input 
                                                        type="number" 
                                                        min="0"
                                                        max={sbaConfig.cat1Max}
                                                        value={scores['cat1'] ?? ''} 
                                                        onChange={e => updateScore('cat1', e.target.value)} 
                                                        className="w-16 text-center border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                                        placeholder="-"
                                                      />
                                                  </td>
                                                  <td className="p-2 border text-center">
                                                      <input 
                                                        type="number" 
                                                        min="0"
                                                        max={sbaConfig.cat2Max}
                                                        value={scores['cat2'] ?? ''} 
                                                        onChange={e => updateScore('cat2', e.target.value)} 
                                                        className="w-16 text-center border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                                        placeholder="-"
                                                      />
                                                  </td>
                                                  <td className="p-2 border text-center">
                                                      <input 
                                                        type="number" 
                                                        min="0"
                                                        max={sbaConfig.cat3Max}
                                                        value={scores['cat3'] ?? ''} 
                                                        onChange={e => updateScore('cat3', e.target.value)} 
                                                        className="w-16 text-center border p-1 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                                                        placeholder="-"
                                                      />
                                                  </td>
                                                  <td className="p-3 border text-center font-bold bg-blue-50 text-blue-900 text-lg">{total}</td>
                                              </tr>
                                          )
                                      })}
                                  </tbody>
                              </table>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  // --- EXAMINATION TIME TABLE ---
  if (module === 'Examination Time Table' as any || module === 'Examination Schedule' as any) {
      const schedule = (settings?.examTimeTable || []).filter(s => s.class === schoolClass);
      
      return (
          <div className="bg-white p-6 rounded shadow-md min-h-[600px]">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-red-900 uppercase">Examination Schedule ({schoolClass})</h2>
                  <div className="flex gap-2">
                      <button onClick={handleAutoAssignInvigilators} className="bg-blue-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-blue-700 shadow flex items-center gap-2">
                          <span>🔄</span> Auto-Assign Invigilators
                      </button>
                      <button onClick={() => handleSharePDF('exam-schedule-print', 'Exam_Schedule.pdf')} className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700 shadow">
                          Share PDF
                      </button>
                  </div>
              </div>

              {/* Schedule Creation Form */}
              <div className="bg-red-50 p-4 rounded border border-red-200 mb-6">
                  <h4 className="font-bold text-red-800 text-sm uppercase mb-4">Add Examination Slot</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div><label className="text-xs font-bold block mb-1">Date</label><input type="date" className="w-full border p-2 rounded text-sm" value={examDate} onChange={e => setExamDate(e.target.value)} /></div>
                      <div><label className="text-xs font-bold block mb-1">Start Time</label><input type="time" className="w-full border p-2 rounded text-sm" value={examTime} onChange={e => setExamTime(e.target.value)} /></div>
                      <div><label className="text-xs font-bold block mb-1">Duration</label><input type="text" className="w-full border p-2 rounded text-sm" value={examDuration} onChange={e => setExamDuration(e.target.value)} /></div>
                      <div><label className="text-xs font-bold block mb-1">Venue</label><input type="text" className="w-full border p-2 rounded text-sm" value={examVenue} onChange={e => setExamVenue(e.target.value)} /></div>
                  </div>
                  <div className="mt-4">
                      <label className="text-xs font-bold block mb-2">Select Subjects (Max 3)</label>
                      <div className="flex flex-wrap gap-2 mb-2">
                          {coreSubjects.map(sub => (
                              <button 
                                key={sub}
                                onClick={() => {
                                    if (selectedExamSubjects.includes(sub)) {
                                        setSelectedExamSubjects(prev => prev.filter(s => s !== sub));
                                    } else {
                                        if (selectedExamSubjects.length < 3) {
                                            setSelectedExamSubjects(prev => [...prev, sub]);
                                        } else {
                                            alert("Max 3 subjects allowed per slot creation.");
                                        }
                                    }
                                }}
                                className={`px-3 py-1 rounded text-xs font-bold border ${selectedExamSubjects.includes(sub) ? 'bg-red-600 text-white border-red-700' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                              >
                                  {sub}
                              </button>
                          ))}
                      </div>
                      <button onClick={handleAddExamSlot} className="w-full bg-red-600 text-white font-bold py-2 rounded shadow hover:bg-red-700 text-sm mt-2">
                          Create Time Table Slot
                      </button>
                  </div>
              </div>

              {/* Schedule Table */}
              <div id="exam-schedule-print" className="overflow-x-auto border rounded bg-white">
                  <table className="w-full text-sm">
                      <thead className="bg-red-100 text-red-900 uppercase text-xs">
                          <tr>
                              <th className="p-3 text-left w-24">Date</th>
                              <th className="p-3 text-center w-20">Time</th>
                              <th className="p-3 text-left">Subject</th>
                              <th className="p-3 text-left w-32">Venue</th>
                              <th className="p-3 text-left w-48">Invigilator</th>
                              <th className="p-3 text-center w-16 no-print">Action</th>
                          </tr>
                      </thead>
                      <tbody>
                          {schedule.sort((a,b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()).map((item) => (
                              <tr key={item.id} className="border-b hover:bg-red-50">
                                  <td className="p-3 font-semibold text-gray-700">{item.date}</td>
                                  <td className="p-3 text-center font-bold">{item.time}</td>
                                  <td className="p-3 font-bold text-blue-900">{item.subject} <span className="text-xs font-normal text-gray-500 block">({item.duration})</span></td>
                                  <td className="p-3">{item.venue}</td>
                                  <td className="p-3">
                                      <div className={`font-bold ${item.invigilatorName.includes('TBA') ? 'text-red-500 animate-pulse' : 'text-green-800'}`}>
                                          {item.invigilatorName}
                                      </div>
                                  </td>
                                  <td className="p-3 text-center no-print">
                                      <button onClick={() => handleDeleteExamSlot(item.id)} className="text-red-500 hover:text-red-700 font-bold">×</button>
                                  </td>
                              </tr>
                          ))}
                          {schedule.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-gray-500 italic">No examination slots scheduled.</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  }

  // --- LESSON PLANS MODULE ---
  if (module === 'Lesson Plans') {
      return (
          <div className="bg-white p-6 rounded shadow-md min-h-[800px]">
              <div className="flex flex-col md:flex-row justify-between items-center border-b pb-4 mb-6 gap-4">
                  <div>
                      <h2 className="text-2xl font-bold uppercase text-blue-900">Comprehensive Lesson Assessment</h2>
                      <div className="text-sm font-bold text-gray-500">Tool: Written Plan & Live Observation</div>
                  </div>
                  <div className="flex gap-2">
                      <button onClick={saveLessonAssessment} className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700 shadow">
                          Save Assessment
                      </button>
                  </div>
              </div>

              {/* Sub Tabs */}
              <div className="flex gap-1 overflow-x-auto mb-6 bg-gray-100 p-1 rounded">
                  <button onClick={() => setAssessmentTab('marking')} className={`px-4 py-2 text-sm font-bold rounded transition-colors ${assessmentTab === 'marking' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}>1. Plan Marking (Sec A/B)</button>
                  <button onClick={() => setAssessmentTab('observation')} className={`px-4 py-2 text-sm font-bold rounded transition-colors ${assessmentTab === 'observation' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}>2. Live Observation (Sec C)</button>
                  <button onClick={() => setAssessmentTab('analysis')} className={`px-4 py-2 text-sm font-bold rounded transition-colors ${assessmentTab === 'analysis' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}>3. Analysis (Sec F)</button>
                  <button onClick={() => setAssessmentTab('compliance')} className={`px-4 py-2 text-sm font-bold rounded transition-colors ${assessmentTab === 'compliance' ? 'bg-white text-blue-900 shadow' : 'text-gray-500 hover:text-gray-800'}`}>4. Compliance (Sec D/G)</button>
              </div>

              {/* PDF Share Button for Active Tab */}
              <div className="flex justify-end mb-2">
                  <button 
                    onClick={() => handleSharePDF(`${assessmentTab}-section-print`, `Lesson_${assessmentTab}_${new Date().toISOString().split('T')[0]}.pdf`)}
                    disabled={isGeneratingPdf}
                    className="text-xs font-bold text-red-600 border border-red-200 bg-red-50 px-3 py-1 rounded hover:bg-red-100 flex items-center gap-1"
                  >
                      {isGeneratingPdf ? 'Generating...' : '📄 Share Tab as PDF'}
                  </button>
              </div>

              {/* Content Area */}
              <div className="min-h-[500px]">
                  {assessmentTab === 'marking' && renderMarkingSection()}
                  {assessmentTab === 'observation' && renderObservationSection()}
                  {assessmentTab === 'analysis' && renderAnalysisSection()}
                  {assessmentTab === 'compliance' && renderComplianceSection()}
              </div>
          </div>
      );
  }

  // --- DAYCARE: OBSERVATION SCHEDULE (TIME TABLE REPLACEMENT) ---
  if (module === 'Observation Schedule' as any) {
      const schedule = settings?.classTimetables?.[schoolClass]?.observationSchedule || [];
      return (
          <div className="bg-white p-6 rounded shadow-md min-h-[600px]">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                  <h2 className="text-2xl font-bold text-purple-900 uppercase">Observation Schedule ({schoolClass})</h2>
                  <button 
                    onClick={() => handleSharePDF('observation-schedule-print', 'Observation_Schedule.pdf')}
                    className="bg-green-600 text-white px-4 py-2 rounded font-bold text-sm hover:bg-green-700"
                  >
                      Export PDF
                  </button>
              </div>

              {/* Schedule Entry Form */}
              <div className="bg-purple-50 p-4 rounded border border-purple-200 mb-6">
                  <h4 className="font-bold text-purple-800 text-sm uppercase mb-4">Add Observation Slot</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      <div><label className="text-xs font-bold block mb-1">Date</label><input type="date" className="w-full border p-2 rounded text-sm" value={newObservation.date} onChange={e => setNewObservation({...newObservation, date: e.target.value})} /></div>
                      <div><label className="text-xs font-bold block mb-1">Period</label><select className="w-full border p-2 rounded text-sm" value={newObservation.period} onChange={e => setNewObservation({...newObservation, period: e.target.value})}>{DAYCARE_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                      <div>
                          <label className="text-xs font-bold block mb-1">Activity / Subject</label>
                          <select 
                            className="w-full border p-2 rounded text-sm" 
                            value={newObservation.activity || ''} 
                            onChange={e => setNewObservation({...newObservation, activity: e.target.value})}
                          >
                              <option value="">Select Activity...</option>
                              {timetableOptions}
                          </select>
                      </div>
                      <div><label className="text-xs font-bold block mb-1">Venue</label><select className="w-full border p-2 rounded text-sm" value={newObservation.venue} onChange={e => setNewObservation({...newObservation, venue: e.target.value})}>{SCHOOL_VENUES.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
                      <div><label className="text-xs font-bold block mb-1">Observer</label><select className="w-full border p-2 rounded text-sm" value={newObservation.observerId} onChange={e => setNewObservation({...newObservation, observerId: e.target.value})}><option value="">Select Active Observer...</option>{activeObservers.map(s => <option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}</select></div>
                      <div className="flex items-end"><button onClick={handleAddObservationSchedule} className="w-full bg-purple-600 text-white font-bold py-2 rounded shadow hover:bg-purple-700 text-sm">Add Slot</button></div>
                  </div>
              </div>

              {/* ... table ... */}
              <div id="observation-schedule-print" className="overflow-x-auto border rounded">
                  <table className="w-full text-sm">
                      <thead className="bg-purple-100 text-purple-900 uppercase text-xs">
                          <tr>
                              <th className="p-3 text-left">Date</th>
                              <th className="p-3 text-center">Period</th>
                              <th className="p-3 text-left w-1/4">Activity / Subject</th>
                              <th className="p-3 text-left">Venue</th>
                              <th className="p-3 text-left">Observer</th>
                              <th className="p-3 text-left">Observed (Pupils)</th>
                          </tr>
                      </thead>
                      <tbody>
                          {schedule.map((item, idx) => (
                              <tr key={idx} className="border-b hover:bg-purple-50">
                                  <td className="p-3">{item.date}</td>
                                  <td className="p-3 text-center font-bold">{item.period}</td>
                                  <td className="p-3 font-semibold text-gray-700">{item.activity || 'General Observation'}</td>
                                  <td className="p-3">{item.venue}</td>
                                  <td className="p-3 font-bold text-purple-800">{item.observerName}</td>
                                  <td className="p-3 italic text-gray-600">{item.observedGroup}</td>
                              </tr>
                          ))}
                          {schedule.length === 0 && <tr><td colSpan={6} className="p-4 text-center text-gray-500">No scheduled observations.</td></tr>}
                      </tbody>
                  </table>
              </div>
          </div>
      );
  }

  // --- FACILITATOR LIST ---
  if (module === 'Facilitator List' as any) {
      const mapping = settings?.facilitatorMapping || {};
      return (
           <div className="bg-white p-6 rounded shadow-md min-h-[600px]">
               <div className="text-center mb-6 border-b pb-4"><h1 className="text-2xl font-bold uppercase text-blue-900"><EditableField value={settings?.schoolName || "SCHOOL NAME"} onChange={(v) => onSettingChange?.('schoolName', v)} className="text-center w-full bg-transparent" /></h1><h2 className="text-xl font-bold uppercase text-gray-800">Facilitator Allocation List</h2></div>
               <div className="overflow-x-auto"><table className="w-full text-sm border-collapse border border-gray-300"><thead className="bg-gray-100 uppercase text-xs font-bold text-gray-700"><tr><th className="p-3 border text-left">Subject / Learning Area</th><th className="p-3 border text-left">Assigned Facilitator</th></tr></thead><tbody>{coreSubjects.map(sub => (<tr key={sub} className="hover:bg-gray-50"><td className="p-3 border font-bold">{sub}</td><td className="p-3 border"><EditableField value={mapping[sub] || "TBA"} onChange={(val) => { if(onSettingChange) { onSettingChange('facilitatorMapping', { ...mapping, [sub]: val }); } }} className="w-full font-semibold text-blue-900"/></td></tr>))}</tbody></table></div>
           </div>
      );
  }

  // --- SUBJECT/INDICATOR MANAGEMENT ---
  if (['Subject List', 'Learning Area / Subject', 'Indicators List'].includes(module as any)) {
       const isIndicator = (module as string) === 'Indicators List';
       if (isIndicator) {
         const activeList = settings?.activeIndicators || [];
         return (
             <div className="bg-white p-6 rounded shadow-md min-h-[600px]">
                 <h2 className="text-2xl font-bold text-blue-900 mb-6 uppercase border-b pb-2">Indicators Management</h2>
                 <p className="text-sm text-gray-500 mb-4 italic">Select activities to be tracked as active indicators. These will also be available for scheduling in the Time Table.</p>
                 <div className="space-y-4">
                     {DAYCARE_ACTIVITY_GROUPS.map((group, idx) => {
                         const isExpanded = expandedGroups[group.category];
                         const activeCount = group.activities.filter(a => activeList.includes(a)).length;
                         return (
                             <div key={idx} className="border rounded overflow-hidden shadow-sm">
                                 <div 
                                    className={`p-3 flex justify-between items-center cursor-pointer transition-colors ${isExpanded ? 'bg-blue-50 border-b border-blue-100' : 'bg-white hover:bg-gray-50'}`} 
                                    onClick={() => setExpandedGroups(prev => ({...prev, [group.category]: !prev[group.category]}))}
                                 >
                                     <div className="font-bold text-gray-800 text-sm flex items-center gap-2">
                                         <span className="text-blue-500">{isExpanded ? '▼' : '▶'}</span>
                                         {group.category} 
                                     </div>
                                     <div className="flex items-center gap-4">
                                         {activeCount > 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">{activeCount} Active</span>}
                                     </div>
                                 </div>
                                 {isExpanded && (
                                     <div className="p-4 bg-gray-50 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 animate-fade-in-down">
                                         {group.activities.map(act => (
                                             <label key={act} className="flex items-start gap-2 cursor-pointer p-2 bg-white rounded border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                                                 <input 
                                                    type="checkbox" 
                                                    checked={activeList.includes(act)} 
                                                    onChange={() => {
                                                        const current = settings?.activeIndicators || [];
                                                        const newInds = current.includes(act) ? current.filter(i => i !== act) : [...current, act];
                                                        onSettingChange?.('activeIndicators', newInds);
                                                    }} 
                                                    className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                 />
                                                 <span className="text-xs font-semibold text-gray-700 leading-tight">{act}</span>
                                             </label>
                                         ))}
                                     </div>
                                 )}
                             </div>
                         )
                     })}
                 </div>
             </div>
         )
       }
       return (
           <div className="bg-white p-6 rounded shadow-md min-h-[600px]">
               <h2 className="text-2xl font-bold text-blue-900 mb-2 uppercase border-b pb-2">{module} Management</h2>
               <div className="mb-6 p-4 bg-gray-50 border rounded flex gap-4 items-end">
                   <div className="flex-1"><label className="block text-xs font-bold text-gray-600 mb-1">Add New Learning Area / Subject</label><input type="text" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} placeholder="Enter subject name..." className="w-full p-2 border rounded"/></div>
                   <button onClick={handleAddSubject} className="bg-blue-600 text-white px-4 py-2 rounded font-bold hover:bg-blue-700">+ Add</button>
               </div>
               <div className="overflow-x-auto border rounded">
                   <table className="w-full text-sm"><thead className="bg-gray-100 uppercase text-xs font-bold text-gray-700"><tr><th className="p-3 text-left">Learning Area / Subject Name</th><th className="p-3 text-center w-32">Type</th><th className="p-3 text-center w-32">Status</th><th className="p-3 text-center w-40">Action</th></tr></thead>
                       <tbody>
                           {coreSubjects.map((subj, i) => {
                               const isCustom = (settings?.customSubjects || []).includes(subj);
                               const isActive = !(settings?.disabledSubjects || []).includes(subj);
                               return (
                                   <tr key={i} className="border-b last:border-0 hover:bg-gray-50"><td className="p-3 font-bold text-gray-800">{subj}</td><td className="p-3 text-center text-xs">{isCustom ? <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Custom</span> : <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded">Standard</span>}</td><td className="p-3 text-center">{isActive ? <span className="text-green-600 font-bold text-xs bg-green-50 px-2 py-1 rounded">Active</span> : <span className="text-red-600 font-bold text-xs bg-red-50 px-2 py-1 rounded">Inactive</span>}</td><td className="p-3 text-center flex justify-center gap-2 items-center"><button onClick={() => handleToggleSubjectStatus(subj)} className={`text-xs px-2 py-1 rounded border font-bold ${isActive ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100' : 'bg-green-50 text-green-600 border-green-200 hover:bg-green-100'}`}>{isActive ? 'Deactivate' : 'Activate'}</button>{isCustom && (<button onClick={() => handleDeleteCustomSubject(subj)} className="text-gray-400 hover:text-red-600" title="Permanently Delete Custom Subject">x</button>)}</td></tr>
                               );
                           })}
                       </tbody>
                   </table>
               </div>
           </div>
       )
  }

  // Default Placeholder
  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h2 className="text-xl font-bold mb-4">{module}</h2>
      <p>Module content for {module} in {department} - {schoolClass} is under construction.</p>
    </div>
  );
};

export default GenericModule;
