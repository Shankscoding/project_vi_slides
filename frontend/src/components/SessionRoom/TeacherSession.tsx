import { Navigate } from "react-router-dom";
import { useState } from "react";

function TeacherSession({ session, questions, setQuestions }: any) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    if (!currentUser || currentUser.role !== "teacher") {
        return <Navigate to="/login" />;
    }

    const [reply, setReply] = useState<{[key: number]: string}>({});

    const handlereply=(id:number)=>{
        if(!reply[id]?.trim()) {
            alert("Answer cannot be empty");
            return;
        }
        const updatedQuestions = questions.map((q: any) => {
            if(q.id === id) {
                return {...q, answers: reply[id] };
            }
            return q;
        });

        setQuestions(updatedQuestions);

        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");

        const updatedSessions = sessions.map((s: any) => {
            if(s.id === session.id) {
                return {...s, questions: updatedQuestions };
            }
            return s;
        });

        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
        setReply((prev) => ({ ...prev, [id]: "" }));
    }   

    return (
        <div>
            <h2>Teacher Session</h2>
            <h3>Questions:</h3>
            <ul>
                {questions.map((q: any) => (
                    <li key={q.id}>
                        <p>{q.text} - <i>asked by {q.askedBy}</i></p>
                        {q.answers ? (
                            <p>
                                <b>Answer:</b> {q.answers.map((line: string, index: number) => (
                                    <span key={index}>{line}<br/></span>
                                ))}
                            </p>
                        ) : (
                            <div>
                                <input type="text" value={reply[q.id] || ""} onChange={(e) => setReply((prev) => ({ ...prev, [q.id]: e.target.value }))} placeholder="Type your answer..." />
                                <button onClick={() => handlereply(q.id)} disabled={!reply[q.id]?.trim()}>Submit Answer</button>   
                            </div>
                        )}
                    </li>
                ))} 
            </ul>
        </div>
    );
}
export default TeacherSession;