
import { StudentData, Department, GradeRange, IndicatorScale, CoreGradingScale, Module, SchoolClass, CalendarLists } from './types';

// ... (Existing exports JHS_SUBJECT_LIST etc)

export const JHS_SUBJECT_LIST = [
  "English Language",
  "Mathematics",
  "Science",
  "Social Studies",
  "Career Technology",
  "Creative Arts and Designing",
  "Ghana Language (Twi)",
  "Religious and Moral Education",
  "Computing",
  "French"
];

// Mapped subjects for Basic School (Lower and Upper)
export const BASIC_SUBJECT_LIST = [
  "English Language",
  "Mathematics",
  "Science",
  "History",
  "Physical Education",
  "Creativity", // Renamed from Creative Arts as requested
  "Ghana Language (Twi)",
  "Religious and Moral Education",
  "I.C.T",
  "French"
];

export const DAYCARE_SUBJECTS = [
  "Language & Literacy",
  "Numeracy",
  "Our World Our People (OWOP)",
  "Creative Activity"
];

export const DAYCARE_SKILLS = [
  "Physical Development",
  "Practical Life Skills",
  "Social Skills",
  "Music & Movement"
];

export const DEPARTMENT_CLASSES: Record<Department, SchoolClass[]> = {
  "Daycare": ["D1", "Creche"],
  "Nursery": ["N1", "N2"],
  "Kindergarten": ["K1", "K2"],
  "Lower Basic School": ["Basic 1", "Basic 2", "Basic 3"],
  "Upper Basic School": ["Basic 4", "Basic 5", "Basic 6"],
  "Junior High School": ["Basic 7", "Basic 8", "Basic 9"]
};

// Flattened list of all classes for dropdowns/tabs
export const ALL_CLASSES_FLAT = Object.values(DEPARTMENT_CLASSES).flat();

export const EC_CORE_SCALE_3_POINT: CoreGradingScale = {
    type: '3-point',
    ranges: [
        { min: 70, max: 100, grade: 'G', remark: 'Gold (High Proficiency)', color: 'text-green-600' },
        { min: 40, max: 69, grade: 'S', remark: 'Silver (Sufficient Proficiency)', color: 'text-blue-600' },
        { min: 0, max: 39, grade: 'B', remark: 'Bronze (Approaching Proficiency)', color: 'text-yellow-600' }
    ]
};

export const EC_CORE_SCALE_5_POINT: CoreGradingScale = {
    type: '5-point',
    ranges: [
        { min: 80, max: 100, grade: 'A', remark: 'Excellent', color: 'text-green-700' },
        { min: 70, max: 79, grade: 'B', remark: 'Very Good', color: 'text-green-600' },
        { min: 60, max: 69, grade: 'C', remark: 'Good', color: 'text-blue-600' },
        { min: 45, max: 59, grade: 'D', remark: 'Credit', color: 'text-yellow-600' },
        { min: 0, max: 44, grade: 'E', remark: 'Pass', color: 'text-red-600' }
    ]
};

export const EC_CORE_SCALE_9_POINT: CoreGradingScale = {
    type: '9-point',
    ranges: [
        { min: 80, max: 100, grade: '1', remark: 'Highest', color: 'text-green-800' },
        { min: 70, max: 79, grade: '2', remark: 'Higher', color: 'text-green-700' },
        { min: 60, max: 69, grade: '3', remark: 'High', color: 'text-green-600' },
        { min: 55, max: 59, grade: '4', remark: 'High Average', color: 'text-blue-600' },
        { min: 50, max: 54, grade: '5', remark: 'Average', color: 'text-blue-500' },
        { min: 45, max: 49, grade: '6', remark: 'Low Average', color: 'text-yellow-600' },
        { min: 40, max: 44, grade: '7', remark: 'Low', color: 'text-orange-600' },
        { min: 35, max: 39, grade: '8', remark: 'Lower', color: 'text-red-600' },
        { min: 0, max: 34, grade: '9', remark: 'Lowest', color: 'text-red-800' }
    ]
};

export const INDICATOR_SCALE_2_POINT: IndicatorScale = {
    type: '2-point',
    ranges: [
        { min: 1, max: 1, grade: 'Yes', remark: 'Observed', color: 'bg-green-100 text-green-800' },
        { min: 0, max: 0.99, grade: 'No', remark: 'Not Observed', color: 'bg-red-100 text-red-800' }
    ]
};

export const INDICATOR_SCALE_3_POINT: IndicatorScale = {
    type: '3-point',
    ranges: [
        { min: 7, max: 9, grade: 'A+', remark: 'Advanced', color: 'bg-green-100 text-green-800' },
        { min: 4, max: 6.99, grade: 'A', remark: 'Achieved', color: 'bg-blue-100 text-blue-800' },
        { min: 0, max: 3.99, grade: 'D', remark: 'Developing', color: 'bg-yellow-100 text-yellow-800' }
    ]
};

export const INDICATOR_SCALE_5_POINT: IndicatorScale = {
    type: '5-point',
    ranges: [
        { min: 8, max: 9, grade: '5', remark: 'Excellent', color: 'bg-green-200 text-green-900' },
        { min: 6, max: 7.99, grade: '4', remark: 'Very Good', color: 'bg-green-100 text-green-800' },
        { min: 4, max: 5.99, grade: '3', remark: 'Good', color: 'bg-blue-100 text-blue-800' },
        { min: 2, max: 3.99, grade: '2', remark: 'Fair', color: 'bg-yellow-100 text-yellow-800' },
        { min: 0, max: 1.99, grade: '1', remark: 'Needs Improvement', color: 'bg-red-100 text-red-800' }
    ]
};

export const INDICATOR_SCALE_9_POINT: IndicatorScale = {
    type: '9-point',
    ranges: [
        { min: 9, max: 9, grade: '9', remark: 'Exceptional', color: 'bg-green-300 text-green-900' },
        { min: 8, max: 8.99, grade: '8', remark: 'Superior', color: 'bg-green-200 text-green-800' },
        { min: 7, max: 7.99, grade: '7', remark: 'High Average', color: 'bg-green-100 text-green-700' },
        { min: 6, max: 6.99, grade: '6', remark: 'Average +', color: 'bg-blue-200 text-blue-800' },
        { min: 5, max: 5.99, grade: '5', remark: 'Average', color: 'bg-blue-100 text-blue-800' },
        { min: 4, max: 4.99, grade: '4', remark: 'Average -', color: 'bg-yellow-100 text-yellow-800' },
        { min: 3, max: 3.99, grade: '3', remark: 'Low Average', color: 'bg-orange-100 text-orange-800' },
        { min: 2, max: 2.99, grade: '2', remark: 'Low', color: 'bg-red-100 text-red-700' },
        { min: 0, max: 1.99, grade: '1', remark: 'Very Low', color: 'bg-red-200 text-red-900' }
    ]
};

// ... (Existing Daycare Activity Groups etc.) ...
// Updated Daycare Activities for Indicators Management
export const DAYCARE_ACTIVITY_GROUPS = [
  {
    category: "ENJOY RUNNING AND CLIMBING (Physical/outdoor movement)",
    activities: [
      "Playing with equipment", "Physical development", "Outdoor play / exploration", "Games", 
      "Exploration", "Pushing & pulling", "Rolling", "Running & climbing–related outdoor movement"
    ]
  },
  {
    category: "INDICATE TOILET NEEDS (Direct or related hygiene skills)",
    activities: [
      "Washing hands", "Wiping practices"
    ]
  },
  {
    category: "PERFORM SELF-HELP ACTIVITIES – DRESSING UP / WASHING",
    activities: [
      "Shoe polishing", "Dressing skills", "Dressing", "Bagging", "Washing hands", 
      "Folding", "Sorting", "Pairing", "Setting table", "Dusting", "Arranging chairs", 
      "Arranging logo", "Grooming", "Napping time", "Snack break – eating habits & table manners", 
      "Practice good eating habits"
    ]
  },
  {
    category: "ENJOY PLAYING WITH OTHER CHILDREN",
    activities: [
      "Games", "Play", "Exploration", "Role play", "Playing with toys", "Waiting to go home (social patience)"
    ]
  },
  {
    category: "WILLINGLY SHARES FOOD / PLAY WITH OTHERS",
    activities: [
      "Sharing", "Snack break – eating habits", "Table manners"
    ]
  },
  {
    category: "INTEREST IN DANCE, DRAMA, SOCIAL AND CULTURAL ACTIVITIES",
    activities: [
      "Dancing", "Action songs", "Story time / picture story", "Class worship routine", "Music", 
      "Rhymes & songs", "Outdoor poem / rhyme / recitation", "Social conversation activities"
    ]
  },
  {
    category: "LOOKS HAPPY AND CHEERFUL DURING PLAY AND OTHER ACTIVITIES",
    activities: [
      "Morning routines", "Conversation", "Class rules", "Picture matching", "Naming objects", 
      "Identification of objects", "Playing with toys", "Waving"
    ]
  },
  {
    category: "IDENTIFY FAMILIAR NATURE SOUNDS",
    activities: [
      "Sounds of animals", "Nature-related sound activities"
    ]
  },
  {
    category: "IDENTIFY MECHANICAL SOUNDS",
    activities: [
      "Mechanical sound identification"
    ]
  },
  {
    category: "INTEREST IN PAINTING, MOULDING, ART AND CREATIVE WORK",
    activities: [
      "Painting", "Scribbling", "Colouring", "Drawing", "Moulding", "Modelling", "Weaving", 
      "Construction", "Pattern maps", "Repeating of patterns", "Puzzles", "Threading", 
      "Picture description", "Picture reading"
    ]
  },
  {
    category: "SAY AND ACT SIMPLE NURSERY RHYMES",
    activities: [
      "Rhymes", "Songs", "Recitations", "Action songs", "Rhymes & songs", "Jolly phonics drills", 
      "Jolly Phonics", "Outdoor poem / rhyme", "Picture stories used for rhyme/storytelling"
    ]
  },
  {
    category: "LANGUAGE & EARLY LITERACY DEVELOPMENT",
    activities: [
      "Writing letters", "Tracing", "Letters & sounds", "Letters/sounds", "Comprehension-based writing", 
      "Picture reading", "Literacy centres", "Picture story", "Picture matching", "Picture description", 
      "Counting words", "Naming objects", "Story time", "Conversation", "Eye-movement training"
    ]
  },
  {
    category: "COGNITIVE & NUMERACY SKILLS",
    activities: [
      "Counting", "Counting items", "Shapes", "Puzzles", "Sorting", "Pairing", "Pattern maps", "Memory games"
    ]
  },
  {
    category: "PRACTICAL LIFE / MONTESSORI SKILLS",
    activities: [
      "Scooping", "Pouring-type implied activities", "Threading", "Weaving", "Sewing", "Setting table", 
      "Folding", "Dusting", "Arranging chairs", "Arranging logo"
    ]
  },
  {
    category: "KNOWING MY WORLD – SOCIAL & ENVIRONMENTAL AWARENESS",
    activities: [
      "Myself", "Family", "Sitting room", "Kitchen", "Identification of objects", "Sound awareness", "Naming objects"
    ]
  }
];

// New Constant for Time Table Generation Groups
export const DAYCARE_TIMETABLE_GROUPS = [
  {
    category: "Language & Literacy",
    activities: [
      "Rhymes & Songs", "Recitations", "Poems", "Picture Story", "Storytelling & Sharing",
      "Print awareness", "Picture Matching", "Letter Sounds", "Two Letter Sounds",
      "Jolly Phonics Drills", "Writing Letters", "Action Songs", "Picture Reading",
      "Comprehension Activities", "Naming Objects", "Memory Games", "Tracing Letters",
      "Reading Readiness Activities"
    ]
  },
  {
    category: "Numeracy",
    activities: [
      "Counting Items", "Number Identification", "Pattern Mapping", "Sorting & Grouping",
      "Throwing & Catching (numeracy game)", "Puzzles", "Tracing Numerals",
      "Shapes Identification", "Left-to-Right Eye Movement Training", "Counting Words",
      "Repeating Patterns"
    ]
  },
  {
    category: "Our World Our People (OWOP)",
    activities: [
      "Myself & My Family", "Kitchen / Home Objects", "Community Helpers", "Parts of the Body",
      "Sound of Domestic Animals", "Hygiene Practices", "Washing Hands", "Good Eating Habits",
      "Table Manners", "Classroom Rules", "Identifying Familiar Objects", "Environmental Exploration",
      "Waiting to go home routines"
    ]
  },
  {
    category: "Creative / Practical Activity",
    activities: [
      "Painting", "Colouring", "Scribbling", "Construction", "Moulding", "Modelling",
      "Threading", "Weaving", "Drawing", "Craft Work", "Tearing Games", "Role Play",
      "Playing With Toys", "Musical Games", "Dancing to Music", "Art & Craft Posters",
      "Practical Life Skills", "Shoe Polishing", "Dressing Skills", "Push & Pull Activities",
      "Wiping Practices", "Scooping", "Rolling", "Folding", "Sorting", "Pairing",
      "Setting Table", "Dusting Chairs & Tables", "Arranging Chairs", "Arranging Learning Materials",
      "Fetching Water", "Bagging"
    ]
  },
  {
    category: "Physical Development",
    activities: [
      "Outdoor Poem / Rhyme", "Physical Education", "Throwing & Catching",
      "Jumping Games", "Climbing", "Gross Motor Play", "Play Equipment Time"
    ]
  }
];

// Flat list of all available indicators for defaults/fallback
export const DAYCARE_INDICATORS = DAYCARE_ACTIVITY_GROUPS.flatMap(group => group.activities);

export const SCHOOL_VENUES = [
  "Classroom",
  "Playground",
  "Sensory Room",
  "Nap Room",
  "Canteen / Dining Hall",
  "Assembly Hall",
  "School Garden",
  "Library / Reading Corner",
  "Music Room",
  "Computer Lab",
  "Sick Bay",
  "Main Field",
  "Sand Pit",
  "Water Play Area",
  "Activity Corner"
];

// Generate Basic Level Venues: B1 A, B1 B ... B9 B
export const BASIC_LEVEL_VENUES: string[] = [];
for (let i = 9; i >= 1; i--) {
  BASIC_LEVEL_VENUES.push(`B${i} A`);
  BASIC_LEVEL_VENUES.push(`B${i} B`);
}

export const DAYCARE_PERIODS = [
  "L0", "L1", "L2", "B1", "L3", "L4", "B2", "L5", "L6", "L7"
];

// Helper to get subjects based on Department
export const getSubjectsForDepartment = (dept: Department): string[] => {
    if (dept === "Daycare" || dept === "Nursery" || dept === "Kindergarten") return DAYCARE_SUBJECTS;
    if (dept === "Junior High School") return JHS_SUBJECT_LIST;
    if (dept === "Lower Basic School" || dept === "Upper Basic School") return BASIC_SUBJECT_LIST;
    return JHS_SUBJECT_LIST; // Default fallback
};

export const SUBJECT_LIST = JHS_SUBJECT_LIST; // Default legacy export

export const CORE_SUBJECTS = ["Mathematics", "English Language", "Social Studies", "Science", "History"];
// Remaining are treated as Electives for the purpose of "Best 2 Electives" calculation

export const FACILITATORS: Record<string, string> = {
  // Empty as per reset request, used only for reference if needed
};

// Default Grading Remarks
export const DEFAULT_GRADING_REMARKS: Record<string, string> = {
    'A1': 'Excellent',
    'B2': 'Very Good',
    'B3': 'Good',
    'C4': 'Credit',
    'C5': 'Credit',
    'C6': 'Credit',
    'D7': 'Pass',
    'E8': 'Pass',
    'F9': 'Fail'
};

export const CLASS_TIMETABLE_DATA = {
  // ... (unchanged)
};

// Raw data parsed from the user prompt
export const RAW_STUDENTS: StudentData[] = [
  // ... (unchanged)
];

export const MODULES: Module[] = [
  "Time Table",
  "Academic Calendar",
  "Staff Management",
  "Pupil Management",
  "Assessment",
  "Result Entry",
  "Materials & Logistics",
  "Learner Materials & Booklist",
  "Disciplinary",
  "Special Event Day"
];

// TEMPLATES FOR PUPIL MANAGEMENT
export const CLASS_RULES = [
    "Punctuality: All pupils must arrive by 7:30 AM.",
    "Appearance: Uniforms must be neat, clean, and tucked in.",
    "Respect: Respect all facilitators, staff, and fellow pupils.",
    "Language: English is the official language of communication on campus.",
    "Property: Do not damage school property or the property of others.",
    "Hygiene: Hands must be washed before eating and after using the washroom.",
    "Movement: Obtain a permission pass before leaving the classroom.",
    "Homework: All assignments must be completed and submitted on time.",
    "Conduct: No fighting, bullying, or use of abusive language.",
    "Safety: Report all injuries or incidents to a facilitator immediately."
];

export const BOOK_LIST_TEMPLATES = {
    "Daycare": [
        "1 x Drawing Book (A4)",
        "1 x Pack of Crayons (Jumbo)",
        "1 x Water Bottle",
        "2 x Change of Clothing",
        "1 x Pack of Wipes",
        "1 x Nap Mat / Blanket"
    ],
    "Nursery": [
        "1 x Tracing Book",
        "1 x Colouring Book",
        "1 x Pack of Pencils",
        "1 x Eraser",
        "1 x Sharpener",
        "1 x Drawing Book (A4)"
    ],
    "Kindergarten": [
        "1 x Math Workbook 1",
        "1 x English Workbook 1",
        "1 x My First Copybook",
        "1 x Pack of Pencils & Erasers",
        "1 x Set of Poster Colours",
        "4 x Exercise Books (Note 1)"
    ],
    "Lower Basic School": [
        "1 x English Reader (Standard Based)",
        "1 x Mathematics Textbook",
        "1 x Science Textbook",
        "1 x OWOP Textbook",
        "10 x Exercise Books (Note 1)",
        "1 x Mathematical Set",
        "1 x Drawing Board"
    ],
    "Upper Basic School": [
        "1 x Comprehensive English",
        "1 x Mathematics for Upper Primary",
        "1 x Integrated Science Book 4-6",
        "1 x Computing Textbook",
        "12 x Exercise Books (Note 1)",
        "1 x Graph Book",
        "1 x Sketch Pad"
    ],
    "Junior High School": [
        "1 x Cockcrow (Literature)",
        "1 x English Past Questions",
        "1 x Aki-Ola Mathematics",
        "1 x Integrated Science Textbook",
        "1 x Social Studies Textbook",
        "1 x Computing Textbook",
        "15 x Exercise Books (Note 1)",
        "1 x Graph Book",
        "1 x Technical Drawing Set"
    ]
};

// ------------------------------------------------------------------
// COMPREHENSIVE LESSON ASSESSMENT CONSTANTS
// ------------------------------------------------------------------

export const LESSON_ASSESSMENT_CHECKLIST_B = {
    "B1": { title: "Lesson Objectives & Outcomes", items: ["Objectives are clearly stated", "Core competencies stated", "Performance indicators stated", "Objectives are learner-centred", "Objectives are SMART", "Objectives align with curriculum standards", "Objectives reflect appropriate cognitive level", "Objectives are measurable and observable"], weight: 15 },
    "B2": { title: "Content & Subject Matter Knowledge", items: ["Content is accurate and relevant", "Content aligns with stated objectives", "Concepts are logically sequenced", "Examples are appropriate to learner level", "Content connects to learners’ prior knowledge", "Content reflects real-life relevance"], weight: 15 },
    "B3": { title: "Teaching & Learning Strategies", items: ["Strategies match lesson objectives", "Strategies support different learning styles", "Strategies promote active participation", "Strategies include inquiry/problem-solving", "Cooperative and individual learning are planned", "Teaching approach is learner-centred"], weight: 20 },
    "B4": { title: "Lesson Structure & Instructional Stages", items: ["Introduction (Set induction) is engaging", "Prior knowledge is stimulated", "Presentation is clear and well-paced", "Modeling is included", "Guided practice is planned", "Independent practice is included", "Closure summarizes key learning points"], weight: 15 },
    "B5": { title: "Teaching & Learning Materials (TLMs)", items: ["Materials are relevant and appropriate", "Materials support lesson objectives", "Materials promote multi-sensory learning", "Materials are available and well prepared", "Technology (if used) is appropriate"], weight: 10 },
    "B6": { title: "Assessment & Evaluation Methods", items: ["Assessment aligns with objectives", "Assessment includes formative techniques", "Assessment methods are varied", "Assessment checks understanding", "Feedback strategies are planned", "Assessment allows learner self-expression"], weight: 15 },
    "B7": { title: "Classroom Management & Organization (Planned)", items: ["Time allocation is realistic", "Classroom organization is considered", "Grouping strategies are considered", "Classroom rules/procedures are considered", "Lesson flow is logical and smooth"], weight: 0 }, // Part of Obs, not explicit weighted in Plan Score
    "B8": { title: "Inclusivity & Learner Support", items: ["Lesson caters for diverse learners", "Strategies for struggling learners included", "Extension activities provided", "Learner participation is equitable", "Gender and cultural sensitivity observed"], weight: 10 },
    "B9": { title: "Reflective Practice (Lesson Plan)", items: ["Reflection section included", "Anticipated challenges identified", "Planned improvements stated", "Teacher demonstrates reflective thinking"], weight: 0 } // Part of Analysis
};

export const LESSON_OBSERVATION_CHECKLIST_C = {
    "C1": ["Teacher arrived on time", "Teacher is well-prepared", "Appropriate professional dressing", "Lesson plan available", "Teaching materials ready"],
    "C2": ["Gained learners’ attention", "Clear lesson objectives communicated", "Prior knowledge activated", "Learners motivated and engaged"],
    "C3": ["Subject matter knowledge evident", "Explanations are clear", "Voice is audible and appropriate", "Language is correct and clear", "Board work is neat and legible", "Teacher uses examples effectively"],
    "C4": ["Learners actively participate", "Questions encourage thinking", "Wait time provided", "Learners collaborate effectively", "Teacher moves around the class", "Strategies match learning styles"],
    "C5": ["Class rules enforced respectfully", "Learners remain focused", "Positive behavior reinforced", "No use of sarcasm or humiliation", "Teacher maintains authority"],
    "C6": ["Teacher checks understanding", "Feedback is immediate and constructive", "Assessment aligns with objectives", "Teacher adjusts teaching when necessary"],
    "C7": ["Key points summarized", "Learners reflect on learning", "Lesson linked to next topic", "Homework/assignment clearly explained"]
};

// ------------------------------------------------------------------
// ACADEMIC CALENDAR DEFAULTS
// ------------------------------------------------------------------

export const DEFAULT_CALENDAR_LISTS: CalendarLists = {
    periods: [
        "Reopening Week", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", "Week 7",
        "Week 8 – Mid-Term", "Week 9", "Week 10", "Week 11", "Week 12",
        "Week 13 – Revision Week", "Week 14 – Examination Week", "Week 15 – Vacation / Graduation", "Week 16"
    ],
    activities: [
        "Reopening / Cleaning / Orientation", "Staff Meeting", "Preparation of SOL/SOW", "Submission of SOL/SOW",
        "PLC: Stages of Learner Development", "PLC: Test Item Preparation", "PLC: Qualities of Good and Effective Teacher",
        "PLC: Handling Learning Disabilities", "PLC: Peer Tutoring / Teaching Practice", "PLC: Techniques of Teaching I",
        "PLC: Techniques of Teaching II", "PLC: Teaching Methods I", "PLC: Teaching Methods II", "PLC: Reflection",
        "Inspection of Registers", "Inspection of SBA/Registers", "Teaching / Normal Classes", "Health Talk",
        "Talk Session", "Peer Pressure Education", "Homework Management Skills", "INSET", "Revision Week",
        "Examination Week", "Vacation / Graduation", "Mid-Term Examination", "Field Trip / Excursion / Hiking",
        "Civic Education", "Leadership & Prefectship Training", "Magazine / Journal Writing"
    ],
    assessments: [
        "No Assessment This Week", "C.A.T 1,4,7", "C.A.T 2,5,8", "C.A.T 3,6,9",
        "Mock 1", "Mock 2", "Mock 3", "Mock 4", "Mock 5", "Mock 6", "Mock 7", "Mock 8"
    ],
    leadTeam_teachers: [
        "Sir Michael", "Sir Mishael", "Sir Manasseh", "Sir Miguel", "Sir Frank", "Sir Geoffrey",
        "Sir Samuel", "Sir Appiah", "Sir Emmanuel", "Madam Abigail", "Madam Priccy", "Madam Ruby",
        "Madam Juliana", "Madam Theresa", "Madam Priscilla", "Madam Lawrencia", "Madam Cynthia",
        "Madam Joana", "Madam Julie"
    ],
    extra_curricular: [
        "Pick-And-Act", "Spelling Bee Contest", "Sports & Athletics", "Inter-Class Games",
        "Inter-Sectional Sports", "Indoor Games", "Outdoor Games", "Talent Exhibition",
        "Performing Arts Showcase", "Debate Competition", "Model Parliament", "Sanitation Campaign",
        "Oral Hygiene Demonstrations", "Puzzle Task Activities", "Club Discussions", "Fruit & Colours Day",
        "Movie Day", "Music & Dance", "Cultural Dance", "Art Competition", "Artefact Design",
        "Civic Values Demonstration", "Picnic / Excursion / Field Trip", "Our Day Celebration",
        "Readers Day", "Leadership Activities", "Preschool Demonstrations (Action Words)"
    ]
} as any; // Cast to avoid key mismatch with interface temporarily if keys differ slightly

export const DEFAULT_CALENDAR_WEEKS_TEMPLATE = DEFAULT_CALENDAR_LISTS.periods.map((p, i) => ({
    id: `week-${i}`,
    period: p,
    dateFrom: '',
    dateTo: '',
    activity: i === 0 ? 'Reopening / Cleaning / Orientation' : 'Teaching / Normal Classes',
    assessment: 'No Assessment This Week',
    leadTeam: '',
    extraCurricular: '',
    extraCurricularNotes: ''
}));
