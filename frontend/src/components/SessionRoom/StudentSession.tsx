import { Navigate, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getCurrentUser } from "../../lib/storage";
import type { SessionQuestion, SessionRecord } from "../../types/models";

interface StudentSessionProps {
    session: SessionRecord;
    questions: SessionQuestion[];
    setQuestions: (updatedQuestions: SessionQuestion[]) => void;
}

function StudentSession({session, questions,setQuestions}: StudentSessionProps) {
    const currentUser = getCurrentUser();
    if (!currentUser || currentUser.role !== "student") {
        return <Navigate to="/login" />;
    }

    const navigate = useNavigate();

    const [question,setquestion] = useState("");
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [questionError, setQuestionError] = useState("");
    const isSessionEnded = session?.status === "ended";
    const isSessionPaused = session?.status === "paused";

    const handleAskQuestion = () => {
        setQuestionError("");
        if (isSessionEnded || isSessionPaused) {
            return;
        }
        if(!question.trim()) {
            setQuestionError("Question cannot be empty.");
            return;
        }
        const newQuestion = {
            text:question.trim(),
            askedBy: isAnonymous ? "Anonymous Student" : currentUser.name,
            isAnonymous,
            source: "student" as const,
            needsTeacher: true,
            id: Date.now(),
            answers: []
        };

        const updatedQuestions = [...questions, newQuestion];
        setQuestions(updatedQuestions);
        setquestion("");
        setIsAnonymous(false);
        
    };

    const hour = new Date().getHours();
    return (
        <div className="panel stack">
            <h2>Good {hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening"}, {currentUser.name}</h2>
            <h2>Student Session</h2>
            <h3>Room ID: {session.id}</h3>
            {isSessionEnded && <p className="muted">This session has ended. New questions are disabled.</p>}
            {isSessionPaused && <p className="muted">This session is paused. Please wait for the teacher to resume.</p>}
            <div className="stack">
                <input type="text" value={question} onChange={(e) => setquestion(e.target.value)} placeholder="Ask a question..." aria-label="Question input" />
                <label className="toggle-row">
                    <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        disabled={isSessionEnded || isSessionPaused}
                    />
                    Submit as anonymous
                </label>
                {questionError && <p className="field-error">{questionError}</p>}
                <button onClick={handleAskQuestion} disabled={!question.trim() || isSessionEnded || isSessionPaused}>Ask Question</button>
            </div>
            <h3>Questions:</h3>
            <ul className="list">
                {questions.map((q) => (    
                    <li className="list-item" key={q.id}>
                        <p>{q.text} - <i>asked by {q.askedBy}</i></p>
                        {q.answers && q.answers.length > 0 && (
                            <div className="panel" style={{ marginTop: "8px" }}>
                                <b>Answers:</b>
                                {q.answers.map((answer: string, index: number) => (
                                    <p key={index}>{answer}</p>
                                ))}
                            </div>
                        )}
                    </li>
                ))}
            </ul>
            <div className="cta-row">
                <button className="ghost-btn" onClick={() => navigate("/student")}>Leave Session</button>
            </div>
        </div>
    );
}
export default StudentSession;