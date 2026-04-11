import { Navigate } from "react-router-dom";
import { useState } from "react";

function TeacherSession({ session, questions, setQuestions }: any) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    if (!currentUser || currentUser.role !== "teacher") {
        return <Navigate to="/login" />;
    }


    const totalParticipants = session.participants ? session.participants.length : 0;

    const [reply, setReply] = useState<{[key: number]: string}>({});

    const handlereply=(id:number)=>{
        if(!reply[id]?.trim()) {
            alert("Answer cannot be empty");
            return;
        }
        const updatedQuestions = questions.map((q: any) => {
            if(q.id === id) {
                return { ...q, answers: [...(q.answers || []), reply[id].trim()] };
            }
            return q;
        });

        setQuestions(updatedQuestions);
        setReply((prev) => ({ ...prev, [id]: "" }));
    }   

    return (
        <div className="panel stack">
            <h2>Teacher Session</h2>
            <h2>Room ID: {session.id}</h2>
            <h3>Total Participants: {totalParticipants}</h3>
            <h3>Questions:</h3>
            <ul className="list">
                {questions.map((q: any) => (
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
                        <div className="stack" style={{ marginTop: "8px" }}>
                            <input
                                type="text"
                                value={reply[q.id] || ""}
                                onChange={(e) => setReply((prev) => ({ ...prev, [q.id]: e.target.value }))}
                                placeholder="Type your answer..."
                            />
                            <button onClick={() => handlereply(q.id)} disabled={!reply[q.id]?.trim()}>Reply</button>
                        </div>
                    </li>
                ))} 
            </ul>
        </div>
    );
}
export default TeacherSession;