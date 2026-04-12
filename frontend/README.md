# Vi-SlideS Frontend

This frontend is a role-based classroom interface for students and teachers.
It is designed to be simple to present, easy to extend, and clear for mentor review.

## Tech Stack

- React + TypeScript
- Vite
- Vanilla CSS design system in `src/index.css`
- Browser storage for current prototype data (`sessionStorage` + `localStorage`)

## Frontend Flow

1. User signs up or logs in as `student` or `teacher`.
2. Central route guards redirect users to the correct dashboard.
3. Teacher creates a session with a unique code.
4. Student joins using the code and submits questions.
5. Teacher handles questions in two modes:
   - `Slides View`: one question at a time
   - `List View`: all questions in a list
6. Teacher controls session state:
   - `Start`
   - `Pause`
   - `End`
7. After ending, teacher sees a `Session Summary` page.

## Main Features Implemented

- Protected/public route pattern (`ProtectedRoute`, `PublicOnlyRoute`)
- Role-specific dashboards
- Student session join with validation
- Anonymous question submission option
- Teacher reply workflow with inline validation
- Session status control (live, paused, ended)
- Session history for both teacher and student
- Search, filter, and pagination in history pages
- Mentor-friendly summary page after session end
- Responsive premium UI system

## Project Structure

- `src/components/auth`: route guards
- `src/components/student`: student dashboard, history, profile
- `src/components/teacher`: teacher dashboard, history, profile
- `src/components/SessionRoom`: room, student session, teacher session, summary
- `src/lib/storage.ts`: typed browser-storage helpers
- `src/types/models.ts`: shared type model

## Run Frontend Locally

```bash
npm install
npm run dev
```

Build check:

```bash
npm run build
```

## Notes for Mentor Presentation

- Current version is frontend-first and data is stored in browser storage.
- The UI and workflows are production-style, while backend and AI integration are planned next.
- The codebase now uses shared types and centralized guards for maintainability.
