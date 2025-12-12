

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
  title: string;
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
    term?: string;
    useRawScore: boolean; // If true, inputs are out of 100 and scaled down
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
  guardian?: string;
  contact?: string;
  address?: string;

  // Daycare Specifics
  age?: string;
  promotedTo?: string;
  conduct?: string;
  interest?: string;
  skills?: Record<string, 'D' | 'A' | 'A+'>; // Manual override rating
  observationScores?: Record<string, number[]>; // Array of scores (1-9) from multiple observations
  
  // Assessment Grid Scores (Generic Module sync)
  assessmentScores?: Record<string, Record<string, number>>;
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
  skills?: Record<string, 'D' | 'A' | 'A+'>;
}

export interface ClassStatistics {
  subjectMeans: Record<string, number>;
  subjectStdDevs: Record<string, number>;
}

export interface StaffMember {
    id: string;
    name: string;
    // Expanded roles to include Daycare specifics
    role: 'Class Teacher' | 'Subject Teacher' | 'Both' | 'Supervisory' | 'Facilitator' | 'Facilitator Assistant' | 'Caregiver' | 'Guest';
    // Expanded status to include Observer status
    status: 'Full Time' | 'Part Time' | 'Observer Active' | 'Not Active';
    subjects: string[]; // List of subjects they teach
    contact: string;
    qualification: string;
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

export interface EarlyChildhoodActivity {
    id: string;
    time: string;
    activity: string;
    subject?: string;
    details?: string;
    tlm?: string;
    remarks?: string;
    isCustomary?: boolean;
}

export interface CalendarWeek {
    week: number;
    period: string; // Date range label (legacy/display)
    startDate?: string; // New: Week Begin Date
    endDate?: string;   // New: Week End Date
    coreActivity: string;
    assessment: string;
    leadTeam: string;
    extraCurricular: string;
    extraCurricularNotes?: string; 
}

export interface TimetableConstraints {
    partTimeAvailability?: Record<string, string[]>;
    fixedActivities?: Record<string, FixedActivityConfig>;
    extraTuitionActive?: boolean;
}

export interface ClassTimetableData {
    periods: { time: string; type: 'Lesson' | 'Break' | 'Extra' | string }[];
    schedule: Record<string, Record<string, string>>;
    earlyChildhoodSchedule?: Record<string, EarlyChildhoodActivity[]>;
    subjectDemands?: Record<string, number>;
    constraints?: TimetableConstraints;
    complianceLogs?: Record<string, Record<string, ComplianceLog>>; // Day -> PeriodIdx -> Log
}

export interface GlobalSettings {
  schoolName: string;
  examTitle: string;
  mockSeries: string;
  mockAnnouncement: string;
  mockDeadline: string;
  submittedSubjects: string[]; // List of subjects that have been "finalized"
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
  gradingSystemRemarks: Record<string, string>; // A1: "Excellent", B2: "Very Good" etc.
  activeIndicators: string[]; // List of active developmental indicators for Daycare
  customIndicators: string[]; // List of custom created indicators
  customSubjects: string[]; // List of custom subjects added by user
  disabledSubjects: string[]; // List of standard subjects marked as inactive by user
  
  // Staff / Facilitator Management
  staffList: StaffMember[];
  
  // Examination Management
  examTimeTable?: Record<string, string>[];
  invigilationList?: Record<string, string>[];
  
  // Assessment Configuration
  assessmentColumns?: Record<string, AssessmentColumn[]>;
  sbaWeights?: Record<string, number>; // Legacy SBA total weight
  sbaConfig?: Record<string, SBAConfig>; // New breakdown configuration per subject
  
  // Class Timetables (For Grid Based Depts)
  classTimetables?: Record<string, ClassTimetableData>;

  // Academic Calendar
  academicCalendar?: Record<string, CalendarWeek[]>; // Keyed by "Term 1", "Term 2", "Term 3"
}

export interface FacilitatorStats {
  facilitatorName: string;
  subject: string;
  studentCount: number;
  gradeCounts: Record<string, number>; // A1: 5, B2: 3 etc
  totalGradeValue: number; // Sum of (count * value)
  performancePercentage: number; // New formula result
  averageGradeValue: number;
  performanceGrade: string; // The grade assigned to the facilitator
}

// School System Types
export type Department = 
  | "Daycare"
  | "Nursery"
  | "Kindergarten"
  | "Lower Basic School"
  | "Upper Basic School"
  | "Junior High School";

export type SchoolClass = string; // e.g., "D1", "Basic 1", "JHS 1"

export type Module = 
  | "Time Table"
  | "Academic Calendar"
  | "Facilitator List"
  | "Pupil Enrolment"
  | "Assessment"
  | "Lesson Plans"
  | "Exercise Assessment"
  | "Staff Movement"
  | "Materials & Logistics"
  | "Learner Materials & Booklist"
  | "Disciplinary"
  | "Special Event Day";
