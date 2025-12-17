
export interface SubjectScore {
  subject: string;
  score: number;
}

export interface ComputedSubject extends SubjectScore {
  grade: string;
  gradeValue: number; // 1-9 for calculation
  remark: string;
  facilitator: string;
  zScore: number;
}

export interface ScoreDetail {
  sectionA: number;
  sectionB: number;
  total: number;
}

export interface AssessmentColumn {
  id: string;
  title: string; // Used as a fallback or composite title
  strand?: string;
  subStrand?: string;
  indicatorCode?: string;
  date: string;
  maxScore: number;
}

export interface SBAConfig {
    cat1Max: number;
    cat2Max: number;
    cat3Max: number;
    cat1Date?: string;
    cat2Date?: string;
    cat3Date?: string;
    cat1Type?: 'Individual' | 'Group';
    cat2Type?: 'Individual' | 'Group';
    cat3Type?: 'Individual' | 'Group';
    term?: string;
    useRawScore: boolean; // If true, inputs are out of 100 and scaled down
}

export interface GradeRange {
  min: number;
  max: number;
  grade: string;
  remark: string;
  color?: string; // Tailwind class string
}

export interface CoreGradingScale {
  type: '3-point' | '5-point' | '9-point';
  ranges: GradeRange[];
}

export interface IndicatorScale {
  type: '2-point' | '3-point' | '5-point' | '9-point';
  ranges: GradeRange[];
}

// Parent/Guardian Detailed Info Structure
export interface ParentDetailedInfo {
    name: string;
    address: string;
    education: string;
    occupation: string;
    phone: string;
    religion: string;
    dateOfDeath?: string; // if deceased
    wivesCount?: string; // Specific to Father
    relationship?: string; // Specific to Guardian
    dateGuardianBegan?: string; // Specific to Guardian
}

export interface AdmissionTestInfo {
    isScheduled: boolean;
    testDate: string;
    testTime: string;
    venue: string;
    invigilatorId: string;
    invigilatorName: string;
    
    // New Scheduling Fields
    questionSet?: 'A' | 'B' | 'C' | 'D';
    serialNumber?: string;
    message?: string;
    duration?: string;

    // Daycare Specific
    proofOfBirth?: string; // Birth Cert ID / Ref
    birthSetVerified?: boolean;

    // Result Entry
    verifiedSerialNumber?: string; // For verification during entry
    scores?: {
        handwriting: number;
        spelling: number;
        scriptScore: number; // Renamed from content for clarity
        total: number;
    };
    
    status?: 'Pending' | 'Scheduled' | 'Results Ready' | 'Admitted' | 'Rejected';
    decision?: 'Retain' | 'Repeat Lower' | 'Skip to Higher' | 'Pending' | 'Pending Placement';
    comments?: string;
}

export interface StudentData {
  id: number;
  name: string;
  scores: Record<string, number>; // Legacy/Simple Total
  scoreDetails?: Record<string, ScoreDetail>; // Detailed breakdown
  subjectRemarks?: Record<string, string>; // Manual overrides for subject remarks
  overallRemark?: string; // Manual override for general remark (Class Teacher)
  finalRemark?: string; // Full override for the Report Card text (includes weakness etc)
  recommendation?: string; // Manual recommendation
  attendance?: string; // Attendance count
  
  // Bio-Data (Enrolment Synchronization)
  gender?: 'Male' | 'Female';
  dob?: string;
  guardian?: string; // Simple name for list view
  contact?: string;
  address?: string;
  specialNeeds?: string; // New Field

  // Daycare Specifics
  age?: string;
  promotedTo?: string;
  conduct?: string;
  interest?: string;
  skills?: Record<string, string>; // Manual override rating
  observationScores?: Record<string, number[]>; // Array of scores (1-9)
  
  // Assessment Grid Scores (Generic Module sync)
  assessmentScores?: Record<string, Record<string, number>>;

  // NEW: Comprehensive Admission Data
  admissionInfo?: {
      receiptNumber: string;
      dateOfAdmission: string; // Used for stale check
      othersName?: string; // Middle names etc
      homeTown?: string;
      nationality?: string;
      region?: string;
      religion?: string;
      lastSchool?: string;
      presentClass?: string;
      classApplyingFor?: string;
      
      father?: ParentDetailedInfo;
      mother?: ParentDetailedInfo;
      guardianDetailed?: ParentDetailedInfo;
      
      livingWith?: 'Both Parents' | 'Mother' | 'Father' | 'Guardian' | 'Alone';
      
      declaration?: {
          parentName: string;
          wardName: string; // "Master / Miss ..."
          signed: boolean;
          date: string;
      };

      testData?: AdmissionTestInfo;
      generatedId?: string; // The official Pupil ID after admission
  };
}

export interface ProcessedStudent {
  id: number;
  name: string;
  subjects: ComputedSubject[];
  totalScore: number;
  bestSixAggregate: number; // Lower is better
  bestCoreSubjects: ComputedSubject[];
  bestElectiveSubjects: ComputedSubject[];
  overallRemark: string;
  recommendation: string;
  weaknessAnalysis: string;
  category: string;
  rank: number;
  attendance?: string;

  // Daycare Specifics (Passed through)
  age?: string;
  promotedTo?: string;
  conduct?: string;
  interest?: string;
  skills?: Record<string, string>;
}

export interface ClassStatistics {
  subjectMeans: Record<string, number>;
  subjectStdDevs: Record<string, number>;
}

export interface StaffMember {
    id: string;
    name: string;
    role: 'Class Teacher' | 'Facilitator' | 'Facilitator Assistant' | 'Caregiver' | 'Non-Teaching Staff' | 'Administrator' | 'Guest' | 'Invigilator' | 'Security' | 'Kitchen Staff' | 'Supervisory' | 'Guest resource';
    status: 'Active' | 'On Leave' | 'Suspended' | 'Exited' | 'Observer Active' | 'Observer Inactive';
    
    // New: Multiple roles for Observers
    observerRoles?: string[]; 

    // Registration / Bio-data
    gender?: 'Male' | 'Female';
    dob?: string;
    contact: string;
    email?: string;
    address?: string;
    
    // Professional
    qualification: string;
    certifications?: string;
    department?: string;
    subjects: string[]; // List of subjects they teach
    assignedClass?: string;
    employmentType?: 'Full Time' | 'Part Time' | 'Contract' | 'Volunteer';
    
    // HR Details
    jobDescription?: string;
    duty?: string; // Specific duty
    skills?: string;
    
    // Placement
    isInvigilator?: boolean;
    isGuest?: boolean;
}

export interface StaffMovementLog {
    id: string;
    staffId: string;
    staffName: string;
    type: 'In' | 'Out';
    time: string;
    date: string;
    destination?: string;
    reason?: string;
}

export interface StaffAttendanceRecord {
    id: string;
    date: string;
    staffId: string;
    staffName: string;
    status: 'Present' | 'Late' | 'Absent' | 'Permission';
    timeIn?: string;
    timeOut?: string;
    remarks?: string;
}

export interface StaffLeaveRecord {
    id: string;
    staffId: string;
    staffName: string;
    type: 'Sick' | 'Casual' | 'Maternity' | 'Study' | 'Other';
    startDate: string;
    endDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    reason?: string;
}

export interface StaffMeetingLog {
    id: string;
    date: string;
    type: 'PLC' | 'General' | 'Departmental' | 'Briefing';
    topic: string;
    attendees: string; // Comma separated or count
    minutes?: string;
}

export interface StaffWelfareLog {
    id: string;
    date: string;
    type: 'Dues' | 'Event' | 'Support' | 'Contribution';
    description: string;
    amount?: number;
    beneficiary?: string;
}

export interface StaffTrainingLog {
    id: string;
    date: string;
    title: string;
    provider: string; // Internal or External
    attendees: string;
    outcome?: string;
}

export interface FixedActivityConfig {
    day: string;
    periodIndex: number;
    duration: number;
    active: boolean;
}

export interface ComplianceLog {
    status: 'Present' | 'Absent' | 'Late' | 'Closed Before' | 'Missed';
    deviationType?: 'Other Activity' | 'Other Facilitator' | 'None';
    deviationNote?: string;
    timestamp: string;
}

export interface TimetableConstraints {
    partTimeAvailability?: Record<string, string[]>;
    fixedActivities?: Record<string, FixedActivityConfig>;
    extraTuitionActive?: boolean;
}

// Daycare Observation Schedule Item
export interface ObservationScheduleItem {
    id: string;
    date: string;
    period: string; // L0, L1 etc
    duration: string;
    venue: string;
    observerId: string;
    observerName: string;
    observedGroup: string; // "All" or comma separated names
    activity?: string; // New field for specific activity from the updated groups
}

// Exam Schedule Item Structure
export interface ExamScheduleItem {
    id: string;
    date: string;
    time: string;
    endTime?: string;
    duration: string;
    subject: string;
    class: string;
    venue: string;
    invigilatorId: string;
    invigilatorName: string;
}

// Academic Calendar Types
export interface CalendarWeek {
    id: string;
    period: string; // "Week 1", "Reopening", etc.
    dateFrom: string;
    dateTo: string;
    activity: string;
    assessment: string;
    leadTeam: string;
    extraCurricular: string;
    extraCurricularNotes?: string;
}

export interface CalendarLists {
    periods: string[];
    activities: string[];
    assessments: string[];
    leadTeam: string[];
    extraCurricular: string[];
}

export interface ClassTimetableData {
    periods: { time: string; type: 'Lesson' | 'Break' | 'Extra' | string }[];
    schedule: Record<string, Record<string, string>>;
    subjectDemands?: Record<string, number>;
    constraints?: TimetableConstraints;
    complianceLogs?: Record<string, Record<string, ComplianceLog>>; // Day -> PeriodIdx -> Log
    
    // Daycare Specific
    observationSchedule?: ObservationScheduleItem[];
}

export interface PromotionConfig {
    metric: 'Aggregate' | 'Average Score';
    cutoffValue: number; // Max Aggregate (e.g. 36) or Min Average (e.g. 50)
    minAttendance: number; // e.g. 45 days
    exceptionalCutoff: number; // e.g. Aggregate 10 or Average 90 for Double Promotion
}

export interface FileRecord {
    id: string;
    name: string;
    path: string; // Full hierarchical path
    uploadDate: string;
    size: string;
    type: string;
    content?: string; // base64 data for demo purposes
}

export interface LessonPlan {
    id: string;
    schoolClass: string;
    subject: string;
    week: string;
    date: string;
    strand: string;
    subStrand: string;
    indicator: string;
    objectives?: string;
}

export interface LessonAssessment {
    id: string;
    // Section A
    teacherName: string;
    staffId?: string;
    schoolClass: string;
    subject: string;
    strand: string;
    subStrand: string;
    indicator: string;
    topic: string;
    date: string;
    week: string;
    duration: string;
    classSize: number;
    supervisor: string;

    // Added missing fields based on usage
    schemeOfWorkStatus?: string;
    referenceMaterials?: boolean;
    referenceMaterialsCount?: number;
    observationType?: string;

    // Section B Data (Key: Criteria ID (e.g., 'B1.1'), Value: Boolean)
    writtenPlanChecks: Record<string, boolean>;
    writtenPlanScore: number; // Calculated based on weights

    // Section C Data (Key: Criteria ID (e.g., 'C1.1'), Value: 0-4)
    observationRatings: Record<string, number>;
    observationScore: number; // Calculated

    // Section F (Qualitative)
    strengths?: string;
    areasForImprovement?: string;
    notableBehaviors?: string;
    learnerResponse?: string;
    
    // Reflective Indicators
    reflectiveEvidence?: string;
    useOfFeedback?: string;
    willingnessToAdjust?: string;

    // Section G
    overallEvaluation: string;
    supervisorComments: string;
}

// New Interface for Exercise Assessment Module
export interface ExerciseLog {
    id: string;
    schoolClass: string; // To filter per class
    subject: string;
    week: string; // Week 1 to 16
    strand: string;
    subStrand: string;
    indicator: string;
    date: string;
    classSize: number;
    type: 'Classwork' | 'Home Assignment' | 'Project';
    
    // Questions
    bloomLevel: string[]; // Multi-select array e.g., ['Remembering', 'Understanding']
    questionCount: number;
    
    // Checks (Scale 1-10)
    handwritingLegibility: number;
    handwritingClarity: number;
    legibilityComment: string;
    clarityComment: string;
    appearance: 'Good' | 'Fair' | 'Poor';
    
    // Specific Pupil Check
    spellingCount: number; // Count of pupils who can spell well

    // Verification
    facilitatorPrepared: boolean;
    pupilConfirmed: boolean;
    pupilConfirmationName: string;
    
    // Student Lists (IDs)
    defaulters: number[];
    missing: number[];
    marked: number[];
    
    // Computed/System Flags
    isLateSubmission: boolean;
    timetableMatch: boolean;
}

export interface GlobalSettings {
  schoolName: string;
  schoolLogo?: string; // Added field for Logo (Base64)
  examTitle: string;
  mockSeries: string;
  mockAnnouncement: string;
  mockDeadline: string;
  submittedSubjects: string[]; 
  termInfo: string;
  academicYear: string;
  nextTermBegin: string;
  attendanceTotal: string;
  startDate: string;
  endDate: string;
  headTeacherName: string;
  reportDate: string;
  schoolContact: string;
  schoolEmail: string;
  facilitatorMapping: Record<string, string>;
  gradingSystemRemarks: Record<string, string>; 
  activeIndicators: string[]; 
  customIndicators: string[]; 
  customSubjects: string[]; 
  departmentCustomSubjects?: Record<string, string[]>; // NEW: Isolated custom subjects per department
  disabledSubjects: string[]; 
  
  earlyChildhoodConfig?: {
      useDailyAssessment: boolean; 
      weightA: number; 
      weightB: number; 
  };

  earlyChildhoodGrading?: {
      core: CoreGradingScale;
      indicators: IndicatorScale;
  };

  // Promotion Configuration
  promotionConfig?: PromotionConfig;

  staffList: StaffMember[];
  staffAttendance?: StaffAttendanceRecord[];
  staffLeave?: StaffLeaveRecord[];
  staffMovement?: StaffMovementLog[];
  staffMeetings?: StaffMeetingLog[];
  staffWelfare?: StaffWelfareLog[];
  staffTraining?: StaffTrainingLog[];
  
  // File Management System
  fileRegistry?: FileRecord[];

  // Exercise Assessment Logs
  exerciseLogs?: ExerciseLog[];
  lessonPlans?: LessonPlan[];
  lessonAssessments?: LessonAssessment[]; // NEW: For Comprehensive Assessment

  // Exam Schedule (Centralized)
  examTimeTable?: ExamScheduleItem[]; // Changed from Record<string, string>[] to specific type
  
  invigilationList?: Record<string, string>[];
  
  assessmentColumns?: Record<string, AssessmentColumn[]>;
  sbaWeights?: Record<string, number>; 
  sbaConfig?: Record<string, SBAConfig>; 
  
  admissionQuestionBank?: Record<string, Record<string, string>>; 

  classTimetables?: Record<string, ClassTimetableData>;

  // Updated Academic Calendar
  academicCalendar: Record<string, CalendarWeek[]>; // Keyed by Term (Term 1, Term 2, etc.)
  calendarLists?: CalendarLists; // Dynamic lists for dropdowns
}

export interface SystemConfig {
    activeRole: string;
    roles: string[];
    moduleVisibility: Record<string, boolean>;
    actionPermissions: Record<string, boolean>;
    bulkUploadTargetClass?: string | null; // Class name enabled for bulk upload exception
}

export interface FacilitatorStats {
  facilitatorName: string;
  subject: string;
  studentCount: number;
  gradeCounts: Record<string, number>; 
  totalGradeValue: number; 
  performancePercentage: number; 
  averageGradeValue: number;
  performanceGrade: string; 
}

export type Department = 
  | "Daycare"
  | "Nursery"
  | "Kindergarten"
  | "Lower Basic School"
  | "Upper Basic School"
  | "Junior High School";

export type SchoolClass = string; 

export type Module = 
  | "Time Table"
  | "Academic Calendar"
  | "Staff Management"
  | "Pupil Management"
  | "Assessment"
  | "Result Entry"
  | "Materials & Logistics"
  | "Learner Materials & Booklist"
  | "Disciplinary"
  | "Special Event Day";
