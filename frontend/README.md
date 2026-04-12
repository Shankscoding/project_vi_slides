# Vi-SlideS Frontend

This frontend is a role-based classroom interface for students and teachers.
It is designed to be simple to present, easy to extend, and clear for mentor review.

## Tech Stack

- React + TypeScript
- Vite
- Vanilla CSS design system in `src/index.css`
- Browser storage for session/classroom state (`sessionStorage` + `localStorage`)
- Backend auth session with JWT token + `/api/auth/me`

## Frontend Flow

1. User signs up or logs in as `student` or `teacher`.
2. Central route guards redirect users to the correct dashboard.
3. Backend validates the login session and restores it on app start.
4. Teacher creates a session with a unique code.
5. Student joins using the code and submits questions.
6. Teacher handles questions in two modes:
   - `Slides View`: one question at a time
   - `List View`: all questions in a list
7. Teacher controls session state:
   - `Start`
   - `Pause`
   - `End`
8. After ending, teacher sees a `Session Summary` page.

## Main Features Implemented

- Protected/public route pattern (`ProtectedRoute`, `PublicOnlyRoute`)
- Role-specific dashboards
- Student session join with validation
- Backend-authenticated signup/login with hashed passwords
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
- `src/lib/authApi.ts`: backend auth client
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

- Authentication is backend-backed and password hashing happens in MongoDB through the backend model.
- Classroom/session data still uses browser storage for now, which keeps the prototype simple to explain.
- The codebase uses shared types, centralized guards, and a small auth API layer so the flow stays readable.
