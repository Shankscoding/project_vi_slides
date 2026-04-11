import { Navigate } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";



function TeacherSession({ session, questions, setQuestions }: any) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    const navigate = useNavigate();
    if (!currentUser || currentUser.role !== "teacher") {
        return <Navigate to="/login" />;
    }


    const totalEnrolledParticipants = Array.isArray(session.enrolledParticipants)
        ? session.enrolledParticipants.length
        : Array.isArray(session.participants)
        ? session.participants.length
        : 0;

    const liveJoinedParticipants = Array.isArray(session.liveParticipants)
        ? session.liveParticipants.length
        : Array.isArray(session.participants)
        ? session.participants.length
        : 0;


    const [reply, setReply] = useState<{[key: number]: string}>({});

    const handleEndSession = () => {
        const sessions = JSON.parse(localStorage.getItem("sessions") || "[]");
        const updatedSessions = sessions.map((s: any) => {
            if (String(s.id) !== String(session.id)) {
                return s;
            }

            return {
                ...s,
                status: "ended",
                liveParticipants: []
            };
        });

        localStorage.setItem("sessions", JSON.stringify(updatedSessions));
        window.dispatchEvent(new Event("sessionsUpdated"));
        navigate("/teacher");
    };

    const handleBackToDashboard = () => {
        navigate("/teacher");
    };

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
    const hour = new Date().getHours();
    return (
        <div className="panel stack">
            <h2>Good {hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening"}, {currentUser.name}</h2>
            <h2>Teacher Session</h2>
            <h2>Room ID: {session.id}</h2>
            <h3>Total Enrolled Participants: {totalEnrolledParticipants}</h3>
            <h3>Live Joined Participants: {liveJoinedParticipants}</h3>
            <div className="cta-row">
                <button onClick={handleEndSession}>End Session</button>
                <button onClick={handleBackToDashboard}>Back to Dashboard</button>
            </div>
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