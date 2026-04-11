import { useState, type ChangeEvent, type KeyboardEvent } from "react";


interface Message {
  role: "user" | "bot";
  content: string;
}

interface ChatResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const sendMessage = async (): Promise<void> => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { content: input, role: "user" };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5050/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });

      if (!res.ok) throw new Error("Network response was not ok");

      const data: ChatResponse = await res.json();
      const reply = data.choices[0].message.content;

      setMessages((prev) => [...prev, { content: reply, role: "bot" }]);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "auto", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>Gemini Assistant</h2>

      <div
        style={{
          border: "1px solid #ddd",
          minHeight: "450px",
          maxHeight: "650px",
          overflowY: "auto",
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "#fff",
          boxShadow: "inset 0 2px 4px rgba(0,0,0,0.05)"
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: "20px",
              display: "flex",
              justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                padding: "12px 18px",
                borderRadius: "18px",
                background: msg.role === "user" ? "#007bff" : "#f0f2f5",
                color: msg.role === "user" ? "#fff" : "#1c1e21",
                maxWidth: "80%",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                fontSize: "15px",
                lineHeight: "1.5"
              }}
            >
     
              
            </div>
          </div>
        ))}
        {loading && <div style={{ fontSize: "13px", color: "#65676b", fontStyle: "italic" }}>Gemini is typing...</div>}
      </div>

      <div style={{ marginTop: "20px", display: "flex", gap: "12px" }}>
        <input
          style={{ 
            flex: 1, 
            padding: "14px", 
            borderRadius: "25px", 
            border: "1px solid #ddd",
            outline: "none",
            fontSize: "15px"
          }}
          value={input}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything..."
          disabled={loading}
        />
        <button 
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "0 25px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "25px",
            cursor: loading ? "not-allowed" : "pointer",
            fontWeight: "bold",
            transition: "background 0.2s"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;