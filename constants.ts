

import { StudentData, Department } from './types';

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
  "LANGUAGE AND LITERACY",
  "NUMERACY",
  "CREATIVE ACTIVITIES",
  "OUR WORLD OUR PEOPLE"
];

export const DAYCARE_SKILLS = [
  "ENJOY RUNNING AND CLIMBING",
  "INDICATE TOILET NEEDS",
  "PERFORM SELFHELP ACTIVITIES – DRESSING UP / WASHING",
  "ENJOY PLAYING WITH OTHER CHILDREN",
  "WILLINGLY SHARES FOOD / PLAY WITH OTHERS",
  "INTEREST IN DANCE, DRAMA, SOCIAL AND CULTURAL ACTIVITIES",
  "LOOKS HAPPY AND CHEERFUL DURING PLAY AND OTHER ACTIVITIES",
  "INDENTIFY FAMILIAR NATURE SOUNDS",
  "IDENTIFY MECHANICAL SOUNDS",
  "INTEREST IN PAINTING, MOULDING, ART AND CREATIVE WORK",
  "SAY AND ACT SIMPLE NURSERY RHYMES"
];

export const DAYCARE_INDICATORS = [
  "ENJOY RUNNING AND CLIMBING",
  "INDICATE TOILET NEEDS",
  "PERFORM SELFHELP ACTIVITIES – DRESSING UP / WASHING",
  "ENJOY PLAYING WITH OTHER CHILDREN",
  "WILLINGLY SHARES FOOD / PLAY WITH OTHERS",
  "INTEREST IN DANCE, DRAMA, SOCIAL AND CULTURAL ACTIVITIES",
  "LOOKS HAPPY AND CHEERFUL DURING PLAY AND OTHER ACTIVITIES",
  "INDENTIFY FAMILIAR NATURE SOUNDS",
  "IDENTIFY MECHANICAL SOUNDS",
  "INTEREST IN PAINTING, MOULDING, ART AND CREATIVE WORK",
  "SAY AND ACT SIMPLE NURSERY RHYMES"
];

export const DAYCARE_ACTIVITY_GROUPS = [
  {
    category: "ENJOY RUNNING AND CLIMBING",
    activities: [
      "Playing with equipment", "Physical development", "Outdoor play / exploration", "Games", "Exploration", "Pushing & pulling", "Rolling", "Running & climbing–related outdoor movement"
    ]
  },
  {
    category: "INDICATE TOILET NEEDS",
    activities: [
      "Washing hands", "Wiping practices"
    ]
  },
  {
    category: "PERFORM SELF-HELP ACTIVITIES – DRESSING UP / WASHING",
    activities: [
      "Shoe polishing", "Dressing skills", "Dressing", "Bagging", "Washing hands", "Folding", "Sorting", "Pairing", "Setting table", "Dusting", "Arranging chairs", "Arranging logo", "Grooming", "Napping time", "Snack break – eating habits & table manners", "Practice good eating habits"
    ]
  },
  {
    category: "ENJOY PLAYING WITH OTHER CHILDREN",
    activities: [
      "Games", "Play", "Exploration", "Role play", "Playing with toys", "Waiting to go home"
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
      "Dancing", "Action songs", "Story time / picture story", "Class worship routine", "Music", "Rhymes & songs", "Outdoor poem / rhyme / recitation", "Social conversation activities"
    ]
  },
  {
    category: "LOOKS HAPPY AND CHEERFUL DURING PLAY AND OTHER ACTIVITIES",
    activities: [
      "Morning routines", "Conversation", "Class rules", "Picture matching", "Naming objects", "Identification of objects", "Playing with toys", "Games & exploration", "Waving"
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
      "Painting", "Scribbling", "Colouring", "Drawing", "Moulding", "Modelling", "Weaving", "Construction", "Pattern maps", "Repeating of patterns", "Puzzles", "Threading", "Picture description", "Picture reading"
    ]
  },
  {
    category: "SAY AND ACT SIMPLE NURSERY RHYMES",
    activities: [
      "Rhymes", "Songs", "Recitations", "Action songs", "Jolly phonics drills", "Jolly Phonics", "Outdoor poem / rhyme", "Picture stories used for rhyme/storytelling"
    ]
  },
  {
    category: "LANGUAGE & EARLY LITERACY DEVELOPMENT",
    activities: [
      "Writing letters", "Tracing", "Letters & sounds", "Comprehension-based writing", "Picture reading", "Literacy centres", "Picture story", "Picture matching", "Picture description", "Counting words", "Naming objects", "Story time", "Conversation", "Eye-movement training"
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
      "Scooping", "Pouring-type implied activities", "Threading", "Weaving", "Sewing", "Setting table", "Folding", "Dusting", "Arranging chairs", "Arranging logo"
    ]
  },
  {
    category: "KNOWING MY WORLD – SOCIAL & ENVIRONMENTAL AWARENESS",
    activities: [
      "Myself", "Family", "Sitting room", "Kitchen", "Identification of objects", "Sound awareness", "Naming objects"
    ]
  }
];

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
  "Main Field"
];

// Generate Basic Level Venues: B1 A, B1 B ... B9 B
export const BASIC_LEVEL_VENUES: string[] = [];
for (let i = 1; i <= 9; i++) {
  BASIC_LEVEL_VENUES.push(`B${i} A`);
  BASIC_LEVEL_VENUES.push(`B${i} B`);
}

export const DAYCARE_PERIODS = [
  "L0", "L1", "L2", "B1", "L3", "L4", "B2", "L5", "L6", "L7"
];

// --- ACADEMIC CALENDAR CONSTANTS ---
export const CALENDAR_PERIODS = [
  "Reopening Week", "Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6", 
  "Week 7", "Week 8 – Mid-Term", "Week 9", "Week 10", "Week 11", "Week 12", 
  "Week 13 – Revision Week", "Week 14 – Examination Week", "Week 15 – Vacation / Graduation", "Week 16"
];

export const CALENDAR_ACTIVITIES = [
  "Reopening / Cleaning / Orientation", "Staff Meeting", "Preparation of SOL/SOW", "Submission of SOL/SOW",
  "PLC: Stages of Learner Development", "PLC: Test Item Preparation", "PLC: Qualities of Good and Effective Teacher",
  "PLC: Handling Learning Disabilities", "PLC: Peer Tutoring / Teaching Practice", "PLC: Techniques of Teaching I",
  "PLC: Techniques of Teaching II", "PLC: Teaching Methods I", "PLC: Teaching Methods II", "PLC: Reflection",
  "Inspection of Registers", "Inspection of SBA/Registers", "Teaching / Normal Classes", "Health Talk",
  "Talk Session", "Peer Pressure Education", "Homework Management Skills", "INSET", "Revision Week",
  "Examination Week", "Vacation / Graduation", "Mid-Term Examination", "Field Trip / Excursion / Hiking",
  "Civic Education", "Leadership & Prefectship Training", "Magazine / Journal Writing"
];

export const CALENDAR_ASSESSMENTS = [
  "No Assessment This Week", 
  "C.A.T 1", 
  "C.A.T 2", 
  "C.A.T 3",
  "Mock 1", 
  "Mock 2", 
  "Mock 3", 
  "Mock 4", 
  "Mock 5", 
  "Mock 6", 
  "Mock 7", 
  "Mock 8"
];

// Legacy fallback if staff list is empty, though code now prefers dynamic list
export const CALENDAR_TEACHERS = [
  "Sir Michael", "Sir Mishael", "Sir Manasseh", "Sir Miguel", "Sir Frank", "Sir Geoffrey", "Sir Samuel",
  "Sir Appiah", "Sir Emmanuel", "Madam Abigail", "Madam Priccy", "Madam Ruby", "Madam Juliana",
  "Madam Theresa", "Madam Priscilla", "Madam Lawrencia", "Madam Cynthia", "Madam Joana", "Madam Julie"
];

export const CALENDAR_EXTRA_CURRICULAR = [
  "Pick-And-Act", "Spelling Bee Contest", "Sports & Athletics", "Inter-Class Games", "Inter-Sectional Sports",
  "Indoor Games", "Outdoor Games", "Talent Exhibition", "Performing Arts Showcase", "Debate Competition",
  "Model Parliament", "Sanitation Campaign", "Oral Hygiene Demonstrations", "Puzzle Task Activities",
  "Club Discussions", "Fruit & Colours Day", "Movie Day", "Music & Dance", "Cultural Dance",
  "Art Competition", "Artefact Design", "Civic Values Demonstration", "Picnic / Excursion / Field Trip",
  "Our Day Celebration", "Readers Day", "Leadership Activities", "Preschool Demonstrations (Action Words)"
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
  "Science": "SIR JOSHUA",
  "Computing": "SIR ISAAC",
  "I.C.T": "SIR ISAAC",
  "Mathematics": "SIR SAMMY",
  "Religious and Moral Education": "MADAM JANE",
  "Creative Arts and Designing": "MADAM NORTEY", // JHS Name
  "Creative Arts": "MADAM NORTEY", // Legacy/Variant
  "Creativity": "MADAM NORTEY", // Basic School Name
  "CREATIVE ACTIVITIES": "MADAM NORTEY", // Daycare Name
  "French": "SIR CHARLES",
  "Social Studies": "SIR ASHMIE",
  "History": "SIR ASHMIE",
  "English Language": "MADAM NANCY",
  "LANGUAGE AND LITERACY": "MADAM NANCY",
  "Ghana Language (Twi)": "MADAM RITA",
  "Career Technology": "SIR JOSHUA",
  "Physical Education": "SIR JOSHUA",
  "OUR WORLD OUR PEOPLE": "MADAM JANE",
  "NUMERACY": "SIR SAMMY"
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
  "Timetable2025": {
    "Days": {
      "Monday": [
        { "TimePeriod": "L0 (7:30-8:00)", "Activity": "Arrival & Welcome", "LearningArea": null, "Details": "Settling into class", "TLM": null, "Remarks": null },
        { "TimePeriod": "L1 (8:30-9:25)", "Activity": "Circle Time", "LearningArea": "Language & Literacy", "Details": "Rhymes, recitations, songs, poems", "TLM": ["Fun Science", "Fun Colouring", "Mathematics Book", "TLRs"], "Remarks": null },
        { "TimePeriod": "L2 (9:25-10:20)", "Activity": "Group Activity 1 (Indoor)", "LearningArea": "Creative Activity", "Details": "Shoe polishing, dressing, push & pull, conversation", "TLM": ["Picture Reading Books", "Drawing Books"], "Remarks": null },
        { "TimePeriod": "B1 (10:20-10:35)", "Activity": "Snack Break", "LearningArea": null, "Details": "Good eating habits & table manners", "TLM": null, "Remarks": null },
        { "TimePeriod": "L3 (10:35-11:30)", "Activity": "Group Activity 2 (Indoor)", "LearningArea": "Our World Our People", "Details": "Classroom rules, parts of the body, hygiene routines", "TLM": ["Posters", "Audio/Visual Devices"], "Remarks": null },
        { "TimePeriod": "L4 (11:30-12:25)", "Activity": "Phonics Time", "LearningArea": "Language & Literacy", "Details": "Jolly Phonics, rhymes & songs, writing letters", "TLM": ["Jolly Phonics", "A/V Devices"], "Remarks": null },
        { "TimePeriod": "B2 (12:25-1:10)", "Activity": "Lunch Break", "LearningArea": null, "Details": "Eating habits & table manners", "TLM": null, "Remarks": null },
        { "TimePeriod": "L5 (1:10-1:55)", "Activity": "Learning Centre", "LearningArea": "Creative Activity", "Details": "Picture stories, family members", "TLM": null, "Remarks": null },
        { "TimePeriod": "L6 (1:55-2:50)", "Activity": "Story Time", "LearningArea": "Language & Literacy", "Details": "Storytelling & sharing; Clean-up & dressing (moved from L7)", "TLM": null, "Remarks": null },
        { "TimePeriod": "L7 (2:50-3:30)", "Activity": "Closing", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null }
      ],
      "Tuesday": [
        { "TimePeriod": "L0 (7:30-8:00)", "Activity": "Arrival & Welcome", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L1 (8:30-9:25)", "Activity": "Circle Time", "LearningArea": "Language & Literacy", "Details": "Myself, my family, my home", "TLM": ["Fun Creativity"], "Remarks": null },
        { "TimePeriod": "L2 (9:25-10:20)", "Activity": "Group Activity 1", "LearningArea": "Creative Activity", "Details": "Painting, scribbling, action words", "TLM": ["Fun Write & Colour", "Fun Science"], "Remarks": null },
        { "TimePeriod": "B1 (10:20-10:35)", "Activity": "Snack Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L3 (10:35-11:30)", "Activity": "Group Activity 2", "LearningArea": "Numeracy", "Details": "Counting, puzzles, pattern mapping, tracing", "TLM": ["Posters", "A/V Devices"], "Remarks": null },
        { "TimePeriod": "L4 (11:30-12:25)", "Activity": "Phonics Time", "LearningArea": "Language & Literacy", "Details": "Letter sounds, two-letter sounds", "TLM": ["Jolly Phonics"], "Remarks": null },
        { "TimePeriod": "B2 (12:25-1:10)", "Activity": "Lunch Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L5 (1:10-1:55)", "Activity": "Learning Centre", "LearningArea": "OWOP", "Details": "Grooming, sound of animals, washing hands", "TLM": null, "Remarks": null },
        { "TimePeriod": "L6 (1:55-2:50)", "Activity": "Story Time", "LearningArea": "Language & Literacy", "Details": "Drawing, weaving", "TLM": null, "Remarks": null },
        { "TimePeriod": "L7 (2:50-3:30)", "Activity": "Closing", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null }
      ],
      "Wednesday": [
        { "TimePeriod": "L0 (7:30-8:00)", "Activity": "Arrival & Welcome", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L1 (8:30-9:25)", "Activity": "Worship", "LearningArea": "OWOP", "Details": "Songs, praise, worship", "TLM": null, "Remarks": null },
        { "TimePeriod": "L2 (9:25-10:20)", "Activity": "Group Activity 1", "LearningArea": "Numeracy", "Details": "Sorting, grouping, counting, pairing", "TLM": ["Fun Creativity"], "Remarks": null },
        { "TimePeriod": "B1 (10:20-10:35)", "Activity": "Snack Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L3 (10:35-11:30)", "Activity": "Group Activity 2", "LearningArea": "OWOP", "Details": "Picture story, puzzles, naming objects", "TLM": ["Picture Reading Book"], "Remarks": null },
        { "TimePeriod": "L4 (11:30-12:25)", "Activity": "Phonics Time", "LearningArea": "Language & Literacy", "Details": "Memory games, threading, matching", "TLM": ["A/V Devices"], "Remarks": null },
        { "TimePeriod": "B2 (12:25-1:10)", "Activity": "Lunch Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L5 (1:10-1:55)", "Activity": "Learning Centre", "LearningArea": "Language & Literacy", "Details": "Letters & sounds, shapes", "TLM": null, "Remarks": null },
        { "TimePeriod": "L6 (1:55-2:50)", "Activity": "Story Time", "LearningArea": "Language & Literacy", "Details": "Dance, songs, identification of objects", "TLM": null, "Remarks": null },
        { "TimePeriod": "L7 (2:50-3:30)", "Activity": "Closing", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null }
      ],
      "Thursday": [
        { "TimePeriod": "L0 (7:30-8:00)", "Activity": "Arrival & Welcome", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L1 (8:30-9:25)", "Activity": "Circle Time (Music)", "LearningArea": "Creative Activity", "Details": "Singing, music notation", "TLM": ["Jolly Phonics"], "Remarks": null },
        { "TimePeriod": "L2 (9:25-10:20)", "Activity": "Group Activity 1", "LearningArea": "OWOP", "Details": "Counting, picture story", "TLM": ["Drawing Book"], "Remarks": null },
        { "TimePeriod": "B1 (10:20-10:35)", "Activity": "Snack Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L3 (10:35-11:30)", "Activity": "Group Activity 2", "LearningArea": "Creative Activity", "Details": "Construction, moulding, modelling", "TLM": ["Posters"], "Remarks": null },
        { "TimePeriod": "L4 (11:30-12:25)", "Activity": "Phonics Time", "LearningArea": "Language & Literacy", "Details": "Two-letter sounds, shapes, threading", "TLM": ["Jolly Phonics"], "Remarks": null },
        { "TimePeriod": "B2 (12:25-1:10)", "Activity": "Lunch Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L5 (1:10-1:55)", "Activity": "Learning Centre", "LearningArea": "Creative Activity", "Details": "Colouring, patterns, drawing", "TLM": null, "Remarks": null },
        { "TimePeriod": "L6 (1:55-2:50)", "Activity": "Story Time", "LearningArea": "Language & Literacy", "Details": "Storytelling, musical activities", "TLM": null, "Remarks": null },
        { "TimePeriod": "L7 (2:50-3:30)", "Activity": "Closing", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null }
      ],
      "Friday": [
        { "TimePeriod": "L0 (7:30-8:00)", "Activity": "Arrival & Welcome", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L1 (8:30-9:25)", "Activity": "Circle Time (Physical Education)", "LearningArea": "Creative Activity", "Details": "Outdoor poem, rhyme, recitation", "TLM": ["Audio Recorders"], "Remarks": null },
        { "TimePeriod": "L2 (9:25-10:20)", "Activity": "Group Activity 1", "LearningArea": "OWOP", "Details": "Sewing, setting table", "TLM": ["Creativity Tools"], "Remarks": null },
        { "TimePeriod": "B1 (10:20-10:35)", "Activity": "Snack Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L3 (10:35-11:30)", "Activity": "Group Activity 2", "LearningArea": "Creative Activity", "Details": "Letter sounds, writing patterns", "TLM": ["Posters"], "Remarks": null },
        { "TimePeriod": "L4 (11:30-12:25)", "Activity": "Phonics Time", "LearningArea": "Language & Literacy", "Details": "Physical development, role play", "TLM": null, "Remarks": null },
        { "TimePeriod": "B2 (12:25-1:10)", "Activity": "Lunch Break", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null },
        { "TimePeriod": "L5 (1:10-1:55)", "Activity": "Learning Centre", "LearningArea": "OWOP", "Details": "Identification of objects", "TLM": null, "Remarks": null },
        { "TimePeriod": "L6 (1:55-2:50)", "Activity": "Story Time", "LearningArea": "Language & Literacy", "Details": "Arranging chairs, fetching water", "TLM": null, "Remarks": null },
        { "TimePeriod": "L7 (2:50-3:30)", "Activity": "Closing", "LearningArea": null, "Details": null, "TLM": null, "Remarks": null }
      ]
    }
  }
};

export const DAYCARE_ACTIVITIES_LIST = [
  "Arrival & settling",
  "Circle Time",
  "Group Activity",
  "Snack Break",
  "Phonics / Language",
  "Lunch Break",
  "Learning Centres",
  "Story Time / Creative",
  "Nap Time",
  "Closing"
];

export const DAYCARE_LEARNING_AREAS = [
  "LANGUAGE AND LITERACY",
  "NUMERACY",
  "CREATIVE ACTIVITIES",
  "OUR WORLD OUR PEOPLE"
];

export const DAYCARE_ACTIVITY_DETAILS: Record<string, string[]> = {
  "LANGUAGE AND LITERACY": [
      "Picture reading", "Story telling", "Rhymes & Poems", "Letter sounds", "Writing patterns", "Role play"
  ],
  "NUMERACY": [
      "Counting 1-10", "Counting 1-20", "Sorting objects", "Matching shapes", "Colors identification", "Puzzles"
  ],
  "CREATIVE ACTIVITIES": [
      "Scribbling", "Coloring", "Painting", "Molding/Clay work", "Dancing", "Singing"
  ],
  "OUR WORLD OUR PEOPLE": [
      "Parts of the body", "My Family", "Personal Hygiene", "Greetings", "God's Creation"
  ]
};

export const DAYCARE_RESOURCES_LIST = [
  "Crayons", "Paper", "Pencils", "Toys", "Picture Books", "Audio/Video Player", "Building Blocks", "Posters", "Natural Objects"
];

export const DAYCARE_REMARKS_LIST = [
  "Activity completed successfully",
  "Children showed interest",
  "Participation was high",
  "Needs more resources next time",
  "Some children struggled",
  "Lesson postponed"
];

export const DAYCARE_TIMETABLE_STRUCTURE = [
    { code: "L0", time: "7:30-8:30", label: "Arrival & settling" },
    { code: "L1", time: "8:30-9:15", label: "Circle Time" },
    { code: "L2", time: "9:15-10:00", label: "Group Activity" },
    { code: "B1", time: "10:00-10:30", label: "Snack Break" },
    { code: "L3", time: "10:30-11:15", label: "Phonics / Language" },
    { code: "B2", time: "11:15-12:15", label: "Lunch Break" },
    { code: "L4", time: "12:15-1:00", label: "Learning Centres" },
    { code: "L5", time: "1:00-2:00", label: "Nap Time" },
    { code: "L6", time: "2:00-2:45", label: "Story Time / Creative" },
    { code: "L7", time: "2:45-3:30", label: "Closing" }
];

// Raw data parsed from the user prompt
export const RAW_STUDENTS: StudentData[] = [
  { id: 1, name: "MASOUD HARUNA", scores: { "English Language": 73, "Mathematics": 70, "Science": 84, "Social Studies": 86, "Career Technology": 84, "Creative Arts and Designing": 80, "Ghana Language (Twi)": 72, "Religious and Moral Education": 100, "Computing": 71, "French": 88 } },
  { id: 2, name: "OFFEI OSEI EDMUND", scores: { "English Language": 76, "Mathematics": 69, "Science": 79, "Social Studies": 84, "Career Technology": 76, "Creative Arts and Designing": 81, "Ghana Language (Twi)": 90, "Religious and Moral Education": 97, "Computing": 73, "French": 71 } },
  { id: 3, name: "FRIMPONG CHARLES", scores: { "English Language": 71, "Mathematics": 75, "Science": 81, "Social Studies": 90, "Career Technology": 81, "Creative Arts and Designing": 82, "Ghana Language (Twi)": 85, "Religious and Moral Education": 91, "Computing": 72, "French": 65 } },
  { id: 4, name: "ADDY GODWILL", scores: { "English Language": 64, "Mathematics": 63, "Science": 89, "Social Studies": 85, "Career Technology": 80, "Creative Arts and Designing": 82, "Ghana Language (Twi)": 69, "Religious and Moral Education": 88, "Computing": 67, "French": 64 } },
  { id: 5, name: "SEDOFIA HEPHZIBA", scores: { "English Language": 68, "Mathematics": 63, "Science": 66, "Social Studies": 84, "Career Technology": 91, "Creative Arts and Designing": 77, "Ghana Language (Twi)": 68, "Religious and Moral Education": 98, "Computing": 61, "French": 79 } },
  { id: 6, name: "HAMMOND EMMANUELLA", scores: { "English Language": 65, "Mathematics": 60, "Science": 69, "Social Studies": 84, "Career Technology": 84, "Creative Arts and Designing": 83, "Ghana Language (Twi)": 81, "Religious and Moral Education": 96, "Computing": 63, "French": 60 } },
  { id: 7, name: "AGYEMANG DANIEL", scores: { "English Language": 56, "Mathematics": 66, "Science": 72, "Social Studies": 91, "Career Technology": 88, "Creative Arts and Designing": 72, "Ghana Language (Twi)": 71, "Religious and Moral Education": 93, "Computing": 65, "French": 69 } },
  { id: 8, name: "ADAMS LATIFA", scores: { "English Language": 61, "Mathematics": 55, "Science": 73, "Social Studies": 70, "Career Technology": 91, "Creative Arts and Designing": 79, "Ghana Language (Twi)": 78, "Religious and Moral Education": 99, "Computing": 64, "French": 69 } },
  { id: 9, name: "NAZAR REGINA", scores: { "English Language": 63, "Mathematics": 47, "Science": 66, "Social Studies": 84, "Career Technology": 82, "Creative Arts and Designing": 78, "Ghana Language (Twi)": 83, "Religious and Moral Education": 92, "Computing": 56, "French": 58 } },
  { id: 10, name: "EUGEINA MILLS", scores: { "English Language": 67, "Mathematics": 54, "Science": 64, "Social Studies": 82, "Career Technology": 84, "Creative Arts and Designing": 72, "Ghana Language (Twi)": 70, "Religious and Moral Education": 96, "Computing": 56, "French": 65 } },
  { id: 11, name: "BENTIL BAABA", scores: { "English Language": 64, "Mathematics": 53, "Science": 64, "Social Studies": 80, "Career Technology": 90, "Creative Arts and Designing": 74, "Ghana Language (Twi)": 69, "Religious and Moral Education": 94, "Computing": 53, "French": 64 } },
  { id: 12, name: "KPEKPO COMFORT", scores: { "English Language": 64, "Mathematics": 54, "Science": 68, "Social Studies": 73, "Career Technology": 80, "Creative Arts and Designing": 71, "Ghana Language (Twi)": 75, "Religious and Moral Education": 96, "Computing": 62, "French": 64 } },
  { id: 13, name: "KANZONI GRACIOUS", scores: { "English Language": 55, "Mathematics": 56, "Science": 72, "Social Studies": 78, "Career Technology": 84, "Creative Arts and Designing": 76, "Ghana Language (Twi)": 57, "Religious and Moral Education": 90, "Computing": 60, "French": 58 } },
  { id: 14, name: "CUDJOE FLORENCE", scores: { "English Language": 68, "Mathematics": 75, "Science": 90, "Social Studies": 80, "Career Technology": 60, "Creative Arts and Designing": 92, "Ghana Language (Twi)": 35, "Religious and Moral Education": 65, "Computing": 71, "French": 63 } },
  { id: 15, name: "ANIAPAM MARNAL", scores: { "English Language": 67, "Mathematics": 52, "Science": 91, "Social Studies": 58, "Career Technology": 57, "Creative Arts and Designing": 95, "Ghana Language (Twi)": 42, "Religious and Moral Education": 73, "Computing": 72, "French": 58 } },
  { id: 16, name: "BINMEY JOSEPHINE", scores: { "English Language": 58, "Mathematics": 61, "Science": 85, "Social Studies": 77, "Career Technology": 57, "Creative Arts and Designing": 90, "Ghana Language (Twi)": 46, "Religious and Moral Education": 77, "Computing": 76, "French": 66 } },
  { id: 17, name: "SHAIBU FARIDA", scores: { "English Language": 61, "Mathematics": 62, "Science": 74, "Social Studies": 68, "Career Technology": 57, "Creative Arts and Designing": 92, "Ghana Language (Twi)": 49, "Religious and Moral Education": 71, "Computing": 71, "French": 68 } },
  { id: 18, name: "OWUSU ISAAC", scores: { "English Language": 51, "Mathematics": 49, "Science": 81, "Social Studies": 77, "Career Technology": 50, "Creative Arts and Designing": 86, "Ghana Language (Twi)": 33, "Religious and Moral Education": 73, "Computing": 64, "French": 62 } },
  { id: 19, name: "ANANE FELICITY", scores: { "English Language": 45, "Mathematics": 45, "Science": 81, "Social Studies": 73, "Career Technology": 54, "Creative Arts and Designing": 91, "Ghana Language (Twi)": 48, "Religious and Moral Education": 62, "Computing": 70, "French": 58 } },
  { id: 20, name: "ANDANI SULLEYMAN", scores: { "English Language": 51, "Mathematics": 33, "Science": 82, "Social Studies": 63, "Career Technology": 52, "Creative Arts and Designing": 87, "Ghana Language (Twi)": 25, "Religious and Moral Education": 64, "Computing": 68, "French": 75 } },
  { id: 21, name: "ANIAPAM ALHAJI", scores: { "English Language": 47, "Mathematics": 49, "Science": 84, "Social Studies": 54, "Career Technology": 50, "Creative Arts and Designing": 94, "Ghana Language (Twi)": 42, "Religious and Moral Education": 60, "Computing": 47, "French": 43 } },
  { id: 22, name: "YELEBI ALI FAWAZ", scores: { "English Language": 39, "Mathematics": 52, "Science": 78, "Social Studies": 62, "Career Technology": 44, "Creative Arts and Designing": 94, "Ghana Language (Twi)": 41, "Religious and Moral Education": 54, "Computing": 64, "French": 60 } },
  { id: 23, name: "YAKUBU NAAHIMA", scores: { "English Language": 40, "Mathematics": 41, "Science": 73, "Social Studies": 76, "Career Technology": 40, "Creative Arts and Designing": 88, "Ghana Language (Twi)": 23, "Religious and Moral Education": 51, "Computing": 76, "French": 70 } },
  { id: 24, name: "KISSI OSEI KELVIN", scores: { "English Language": 48, "Mathematics": 45, "Science": 67, "Social Studies": 68, "Career Technology": 54, "Creative Arts and Designing": 90, "Ghana Language (Twi)": 26, "Religious and Moral Education": 56, "Computing": 64, "French": 52 } },
  { id: 25, name: "YAJUBU NIHAAD", scores: { "English Language": 44, "Mathematics": 42, "Science": 66, "Social Studies": 76, "Career Technology": 40, "Creative Arts and Designing": 93, "Ghana Language (Twi)": 25, "Religious and Moral Education": 59, "Computing": 59, "French": 68 } },
  { id: 26, name: "BOTCHWAY KATURAH", scores: { "English Language": 37, "Mathematics": 50, "Science": 72, "Social Studies": 59, "Career Technology": 35, "Creative Arts and Designing": 82, "Ghana Language (Twi)": 26, "Religious and Moral Education": 53, "Computing": 67, "French": 63 } },
];