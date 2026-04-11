import { Navigate } from "react-router-dom";
import { useState } from "react";

function StudentSession({session, questions,setQuestions}: any) {
    const currentUser = JSON.parse(sessionStorage.getItem("currentUser") || "null");
    if (!currentUser || currentUser.role !== "student") {
        return <Navigate to="/login" />;
    }



    const [question,setquestion] = useState("");

    const handleAskQuestion = async () => {
  if (!question.trim()) return;

  try {
    const res = await fetch("http://localhost:5050/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [{ content: question }],
      }),
    });

    const data = await res.json();
    const aiAnswer = data.choices[0].message.content;

    const newQuestion = {
      text: question,
      askedBy: currentUser.name,
      id: Date.now(),
      answers: [aiAnswer], 
    };

    const updatedQuestions = [...questions, newQuestion];
    setQuestions(updatedQuestions);

    setquestion("");

  } catch (err) {
    console.error("Error:", err);
  }
};
    const time= new Date().toLocaleTimeString();
    return (
        <div className="panel stack">
            <h2>Good {time < "12:00:00" ? "Morning" : time < "18:00:00" ? "Afternoon" : "Evening"}, {currentUser.name}</h2>
            <h2>Student Session</h2>
            <h3>Room ID: {session.id}</h3>
            <div className="stack">
                <input type="text" value={question} onChange={(e) => setquestion(e.target.value)} placeholder="Ask a question..." />
                <button onClick={handleAskQuestion} disabled={!question.trim()}>Ask Question</button>
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
                    </li>
                ))}
            </ul>
        </div>
    );
}
export default StudentSession;