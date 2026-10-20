/**
 * Study & Placement Action Plan Dataset
 * Exactly matches the user's plan and words.
 */
const DEFAULT_ACADEMIC_DATA = {
  semesters: [
    { id: 'sem-current', number: 1, title: 'Current Semester & Placements' }
  ],
  subjects: [
    { id: 'sub-comm', semesterId: 'sem-current', code: 'EC', name: 'Communication' },
    { id: 'sub-micro', semesterId: 'sem-current', code: 'EC', name: 'Microwave' },
    { id: 'sub-ml', semesterId: 'sem-current', code: 'CS', name: 'Machine Learning' },
    { id: 'sub-dsor', semesterId: 'sem-current', code: 'CS', name: 'DSOR' },
    { id: 'sub-vlsi', semesterId: 'sem-current', code: 'EC', name: 'VLSI Testing' },
    { id: 'sub-placements', semesterId: 'sem-current', code: 'CAREER', name: 'Placements & OAs' },
    { id: 'sub-ai-eng', semesterId: 'sem-current', code: 'SKILLS', name: 'AI Engineer (CampusX)' }
  ],
  resources: [
    // --- Communication ---
    {
      id: 'res-comm-1',
      semesterId: 'sem-current',
      subjectId: 'sub-comm',
      type: 'doc',
      title: 'Communication Study Plan & Exam Prep (Exam on 29 Oct)',
      url: '',
      description: `1) read notes from block diagram\nPlease practise\n2) for communication lab read all lab manuals\nAtleast if experiment not complete also no problem just write properly in answer sheet diagram, discussion\nAnd also two experiments lab manuals are pending\nExam on 29 oct`,
      tags: ['Exam 29 Oct', 'Block Diagram', 'Lab Manuals', 'Practise'],
      isStarred: true,
      createdAt: '2026-10-20T10:00:00Z'
    },

    // --- Microwave ---
    {
      id: 'res-micro-1',
      semesterId: 'sem-current',
      subjectId: 'sub-micro',
      type: 'doc',
      title: 'Microwave Study Plan & Lab Status (Exam on 6 Nov)',
      url: '',
      description: `1) read notes\nPlease practise\n2) for lab read all manuals\nAtleast if experiment not complete also no problem just write properly in answer sheet diagram, discussion\nAnd also lab record and simulations also incomplete\nExam on 6th nov`,
      tags: ['Exam 6 Nov', 'Lab Record', 'Simulations', 'Practise'],
      isStarred: true,
      createdAt: '2026-10-20T10:01:00Z'
    },

    // --- Machine Learning ---
    {
      id: 'res-ml-1',
      semesterId: 'sem-current',
      subjectId: 'sub-ml',
      type: 'doc',
      title: 'Machine Learning Notes & Question Mastery',
      url: '',
      description: `1) read notes\nYou should be in such a way that you should able to complete every questions`,
      tags: ['Read Notes', 'Complete Every Question'],
      isStarred: true,
      createdAt: '2026-10-20T10:02:00Z'
    },

    // --- DSOR ---
    {
      id: 'res-dsor-1',
      semesterId: 'sem-current',
      subjectId: 'sub-dsor',
      type: 'doc',
      title: 'DSOR Preparation & Striver Videos (Exam on 14 Nov)',
      url: '',
      description: `1) read notes\nExam on nov 14\nWrite code your self\n2) watch striver videos`,
      tags: ['Exam 14 Nov', 'Write Code Yourself', 'Striver Videos'],
      isStarred: true,
      createdAt: '2026-10-20T10:03:00Z'
    },

    // --- VLSI Testing ---
    {
      id: 'res-vlsi-1',
      semesterId: 'sem-current',
      subjectId: 'sub-vlsi',
      type: 'doc',
      title: 'VLSI Testing Study Plan & CGPA Goal (> 7.5)',
      url: '',
      description: `1) read notes\nWatch youtube videos one everyday after midsem syllabus\n\nRead one page at a time\nPlease make atleast cg above 7.5`,
      tags: ['One Page at a Time', 'CGPA > 7.5', 'Midsem Syllabus'],
      isStarred: true,
      createdAt: '2026-10-20T10:04:00Z'
    },

    // --- Placements & OAs ---
    {
      id: 'res-place-1',
      semesterId: 'sem-current',
      subjectId: 'sub-placements',
      type: 'doc',
      title: 'Placement Requirements & CGPA Goal',
      url: '',
      description: `Main requirement is able to explain clearly and able to solve logical questions\nMain thing is to get cgpa above 7.5 - the most important thing`,
      tags: ['Explain Clearly', 'Logical Questions', 'CGPA > 7.5'],
      isStarred: true,
      createdAt: '2026-10-20T10:05:00Z'
    },
    {
      id: 'res-place-2',
      semesterId: 'sem-current',
      subjectId: 'sub-placements',
      type: 'doc',
      title: 'OA Preparation: Daily DSA & Core CS Subjects',
      url: '',
      description: `1) DSA - Do atleast 3 problems in a day easy,medium,hard in leetcode and saturday and sunday give leetcode and codeforces contests\n2) DBMS, SQL, Computer Networks, Operating systems, OOPS, LLD watch atleast one video a day`,
      tags: ['3 LeetCode/day', 'Contests Weekend', 'DBMS/SQL/CN/OS/OOPS/LLD'],
      isStarred: true,
      createdAt: '2026-10-20T10:06:00Z'
    },
    {
      id: 'res-place-3',
      semesterId: 'sem-current',
      subjectId: 'sub-placements',
      type: 'doc',
      title: 'CV Strategy: 1 Internship + 3 Projects',
      url: '',
      description: `1) i require one internship experience\n2) 3 projects:\n   - 1) backend project\n   - 2) gen ai project\n   - 3) agentic ai project\n\nFor internship mostly try for up to winter if not ready go for research internship`,
      tags: ['1 Internship', 'Backend Project', 'Gen AI Project', 'Agentic AI Project'],
      isStarred: true,
      createdAt: '2026-10-20T10:07:00Z'
    },

    // --- AI Engineer Roadmap (CampusX) ---
    {
      id: 'res-ai-1',
      semesterId: 'sem-current',
      subjectId: 'sub-ai-eng',
      type: 'youtube',
      title: 'Mandatory AI Engineer Roadmap (CampusX YouTube)',
      url: 'https://www.youtube.com/@CampusX-official',
      description: `Above all are mandatory so don’t neglect anything below are the ones just learn it:\n1) ML playlist\n2) deep learning playlist\n3) pytorch\n4) langchain\n5) rag\n6) Agentic AI\n7) MCP\n8) LLM evals\n\nWhat is required to become ai engineer watch all above in campusx youtube`,
      tags: ['CampusX', 'PyTorch', 'LangChain', 'RAG', 'Agentic AI', 'MCP', 'LLM Evals'],
      isStarred: true,
      createdAt: '2026-10-20T10:08:00Z'
    }
  ]
};

// Full Master Plan text for the dedicated Plan viewer modal
const MASTER_PLAN_RAW_TEXT = `Communication:-
1) read notes from block diagram
Please practise 
2) for communication lab read all lab manuals
Atleast if experiment not complete also no problem just write properly in answer sheet diagram, discussion
And also two experiments lab manuals are pending
Exam on 29 oct

Microwave:
1) read notes
Please practise
2) for lab read all manuals
Atleast if experiment not complete also no problem just write properly in answer sheet diagram, discussion
And also lab record and simulations also incomplete
Exam on 6th nov

Machine Learning:
1) read notes
You should be in such a way that you should able to complete every questions 

DSOR:
1) read notes
Exam on nov 14
Write code your self
2) watch striver videos

VLSI testing:
1) read notes
Watch youtube videos one everyday after midsem syllabus

Read one page at a time 
Please make atleast cg above 7.5

--------------------------------------------------

Placements:
Main requirement is able to explain clearly and able to solve logical questions
Main thing is to get cgpa above 7.5-the most important thing 

OA’s:
1) DSA - Do atleast 3 problems in a day easy,medium,hard in leetcode and saturday and sunday give leetcode and codeforces contests
2) DBMS, SQL, Computer Networks, Operating systems, OOPS, LLD watch atleast one video a day

CV:
1) i require one internship experience
2) 3 projects – 1) backend project
                 2) gen ai project 
                 3) agentic ai project 

For internship mostly try for up to winter if not ready go for research internship 

--------------------------------------------------

Above all are mandatory so don’t neglect anything below are the ones just learn it:
1) ML playlist 
2) deep learning playlist
3) pytorch
4) langchain
5) rag
6) Agentic AI
7) MCP
8) LLM evals 

What is required to become ai engineer watch all above in campusx youtube`;

if (typeof window !== 'undefined') {
  window.DEFAULT_ACADEMIC_DATA = DEFAULT_ACADEMIC_DATA;
  window.MASTER_PLAN_RAW_TEXT = MASTER_PLAN_RAW_TEXT;
}
