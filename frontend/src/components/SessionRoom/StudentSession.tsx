import { Navigate } from "react-router-dom";
import { useState } from "react";

function StudentSession({session, questions,setQuestions}: any) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    if (!currentUser || currentUser.role !== "student") {
        return <Navigate to="/login" />;
    }

    const [question,setquestion] = useState("");

    const handleAskQuestion = () => {
        if(!question) return;
        const newQuestion = {
            text:question,
            askedBy: currentUser.name,
            id: Date.now(),
            answers: ""
        }

        setQuestions([...questions, newQuestion]);

        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const updatedSessions = sessions.map((s: any) => {
            if(s.id === session.id) {
                return {
                    ...s,
                    questions: [...(s.questions || []), newQuestion]
                }
            }
            return s;
        });
        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
        setquestion("");
    }   

    return (
        <div>
            <h2>Student Session</h2>
            <input type="text" value={question} onChange={(e) => setquestion(e.target.value)} placeholder="Ask a question..." />
            <button onClick={handleAskQuestion} disabled={!question.trim()}>Ask Question</button>
            <h3>Questions:</h3>
            <ul>
                {questions.map((q: any) => (    
                    <li key={q.id}>
                        <p>{q.text} - <i>asked by {q.askedBy}</i></p>
                        {q.answers && (
                            <p>
                                <b>Answer:</b> {q.answers.split("\n").map((line: string, index: number) => (
                                    <span key={index}>{line}<br/></span>
                                ))}
                            </p>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default StudentSession;