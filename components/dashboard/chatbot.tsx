"use client";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatbotHighlight } from "@/components/dashboard/chatbot-highlight";

interface ChatbotProps {
  paperFiles: { id: string; name: string; path: string }[];
}

export function Chatbot({ paperFiles }: ChatbotProps) {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [references, setReferences] = useState<{ [ref: number]: string }>({});

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((msgs) => [...msgs, { role: "user", content: input }]);
    setLoading(true);
    // Prepare paperFiles for backend
    const paper_files: { [id: string]: string } = {};
    paperFiles.forEach((f) => (paper_files[f.id] = f.path));
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat-with-papers/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user_query: input, paper_files }),
    });
    const data = await res.json();
  setMessages((msgs) => [...msgs, { role: "assistant", content: data.answer }]);
  setReferences(data.references || {});
    setInput("");
    setLoading(false);
  };

  // Highlight logic would be handled in parent component

  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {messages.map((msg, i) => (
            <div key={i} className={msg.role === "user" ? "text-right" : "text-left"}>
              {msg.role === "assistant" ? (
                <ChatbotHighlight
                  answer={msg.content}
                  references={references}
                  onReferenceClick={(fileId) => {
                    // For now, emit a console log; parent can implement navigation/highlight
                    console.log("Reference clicked:", fileId);
                  }}
                />
              ) : (
                <span className="font-semibold">{msg.content}</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about the papers..."
            disabled={loading}
          />
          <Button onClick={handleSend} disabled={loading || !input.trim()}>
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
