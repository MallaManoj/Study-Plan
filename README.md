# 🎓 StudyHub — Academic Resource Organizer

A clean, high-performance web dashboard designed to organize all your subject **PDF notes**, **documents**, and **YouTube lecture series** by semester—slashing search time and giving you instant access before lectures and exams.

---

## ✨ Features

- **🏛️ Single Focused Semester Workspace**:
  - Keep your current semester (e.g. *Semester 1*, *Semester 3*, *Spring 2026*) clean and focused without clutter from past or future semesters.
  - 1-click **Rename Semester** button to adjust the semester name whenever you advance.
  - Quick-switch between subjects (e.g. *Data Structures*, *DBMS*, *Operating Systems*, *Computer Networks*) directly from the sidebar or top filter chips.
  - Add new subjects anytime with custom course codes (e.g. `CS201`).

- **📤 Easy PDF & Notes Uploading**:
  - Click **📤 Upload Notes** or drag and drop any file (`.pdf`, `.doc`, `.docx`, `.ppt`, `.pptx`, `.txt`).
  - Auto-fills the title from your file name so you can upload in 2 seconds.
  - Stored offline directly in browser **IndexedDB** with high-capacity storage.
  - Click **📂 Read Notes** to view PDFs inside the built-in reader with zoom and print controls, or click **⬇️** to download.

- **📑 Multi-Format Resource Management**:
  - **📄 PDF Notes**: Upload offline notes files or paste Google Drive / cloud links.
  - **📝 Docs & Cheatsheets**: Store links to Notion pages, Google Docs, and official documentation.
  - **🎥 YouTube Video & Playlist Hub**: Automatically parses YouTube URLs, fetches video thumbnails, and provides an **embedded distraction-free viewer** so you can watch tutorials without recommendations pulling you away.
  - **🔗 External Links**: Bookmarks for GitHub repositories, practice problem sets, and syllabi.

- **⚡ Instant Retrieval & Global Search**:
  - **`⌘K` or `/` Quick Finder**: Instant modal search matching any subject code, topic name, tag, or note across your *entire* academic career.
  - **Toolbar Filter**: One-click filters for **Starred**, **PDFs**, **Docs**, and **YouTube** videos.
  - **Tags**: Organize resources with tags like `#Unit2`, `#ExamPrep`, `#Midterm`, or `#CheatSheet`.
  - **⭐ Star / Pin**: Keep critical formulas and exam-day cheat sheets pinned to the top.

- **💾 Offline-Ready & Data Portability**:
  - Automatically persists all your courses and notes in your browser.
  - **Export Backup (JSON)**: 1-click download of your entire study library.
  - **Import Backup (JSON)**: Restore your notes or share a semester resource pack with friends.

- **🎨 Modern Web UI & Theming**:
  - Pure native HTML5, CSS3, and modern ES6 JavaScript.
  - Full **Dark Mode** and **Light Mode** support with smooth transitions.
  - Responsive design for laptops, iPads, tablets, and phones.

---

## 🚀 How to Run

No heavy build tools or complicated installation required. You have two easy ways to use it:

### Option 1: Direct in Browser (Fastest)
Simply double-click `index.html` or drag and drop it into Google Chrome, Safari, Edge, or Firefox.

### Option 2: Local HTTP Server
From this directory (`plan1`), run:

```bash
# Using Python
python3 -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `⌘K` or `Ctrl+K` | Open Global Quick Search |
| `/` | Focus Quick Search |
| `N` | Open "Add New Resource" modal |
| `Esc` | Close any open modal / video viewer |

---

## 📂 Project Structure

```
plan1/
├── index.html         # Main semantic HTML5 application layout & modals
├── css/
│   └── styles.css     # Modern responsive styling, dark/light theme tokens, dialog backdrops
├── js/
│   ├── db.js          # IndexedDB manager for offline PDF and document files
│   ├── sample-data.js # Preloaded college courses and reference material
│   └── app.js         # Core application logic, search, modal controllers, filters
└── README.md          # Documentation
```
