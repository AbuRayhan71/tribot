"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Tribot, your medical triage assistant. How can I help you today?",
      sender: "bot",
      timestamp: ""
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Helper function to get clean timestamp
  const getCleanTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Fix hydration issue by only generating timestamps on client
  useEffect(() => {
    setIsClient(true);
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Tribot, your medical triage assistant. How can I help you today?",
        sender: "bot",
        timestamp: getCleanTimestamp()
      }
    ]);
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return;

    // Add user message
    const userMessage = {
      id: messages.length + 1,
      text: inputText,
      sender: "user",
      timestamp: getCleanTimestamp()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");
    setIsLoading(true);

    try {
      // Call your API endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();

      if (response.ok) {
        const botResponse = {
          id: messages.length + 2,
          text: data.response, // Real AI response!
          sender: "bot",
          timestamp: getCleanTimestamp()
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      const errorMessage = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting right now. Please try again.",
        sender: "bot",
        timestamp: getCleanTimestamp()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-xl font-bold">T</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">Tribot</h1>
            <p className="text-blue-100 text-sm">AI Medical Triage Assistant</p>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-4 overflow-y-auto">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow ${
                  message.sender === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-800 border"
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={`text-xs mt-1 ${
                  message.sender === "user" ? "text-blue-100" : "text-gray-500"
                }`}>
                  {message.timestamp}
                </p>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg shadow">
                <p className="text-sm">Tribot is thinking...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t p-4">
        <div className="max-w-4xl mx-auto flex space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Describe your symptoms or ask a question..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black placeholder-gray-400"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || inputText.trim() === ""}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            {isLoading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
