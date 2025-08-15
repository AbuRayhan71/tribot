"use client";

import { useState, useEffect, useRef } from "react";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          text: data.response,
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
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 shadow-xl border-b border-blue-500">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white border-opacity-30">
              <span className="text-2xl font-bold">🏥</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Tribot</h1>
              <p className="text-blue-100 text-sm flex items-center space-x-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span>AI Medical Triage Assistant</span>
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4 text-sm">
            <div className="bg-white bg-opacity-10 px-3 py-1 rounded-full">
              <span className="text-blue-100">24/7 Available</span>
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full p-6 overflow-y-auto">
        <div className="space-y-6">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
              style={{
                animationDelay: `${index * 0.1}s`
              }}
            >
              <div className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""
              }`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  message.sender === "user" 
                    ? "bg-blue-600 text-white" 
                    : "bg-gradient-to-br from-green-500 to-blue-600 text-white"
                }`}>
                  {message.sender === "user" ? "U" : "🏥"}
                </div>
                
                {/* Message Bubble */}
                <div
                  className={`px-4 py-3 rounded-2xl shadow-lg transform transition-all hover:scale-105 ${
                    message.sender === "user"
                      ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-br-md"
                      : "bg-white text-gray-800 border border-gray-100 rounded-bl-md"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.text}</p>
                  <p className={`text-xs mt-2 ${
                    message.sender === "user" ? "text-blue-100" : "text-gray-500"
                  }`}>
                    {message.timestamp}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Enhanced Loading indicator */}
          {isLoading && (
            <div className="flex justify-start animate-fadeIn">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 text-white flex items-center justify-center text-sm">
                  🏥
                </div>
                <div className="bg-white text-gray-800 border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-md shadow-lg">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <p className="text-sm text-gray-600">Tribot is analyzing...</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Enhanced Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex space-x-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms or ask a medical question..."
                className="w-full border border-gray-300 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 shadow-sm transition-all resize-none"
                disabled={isLoading}
              />
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h3a1 1 0 011 1v2h4a1 1 0 011 1v3H6V5a1 1 0 011-1h1z" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={sendMessage}
              disabled={isLoading || inputText.trim() === ""}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none flex items-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Sending</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <span>Send</span>
                </>
              )}
            </button>
          </div>
          
          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2 mt-3">
            <button 
              onClick={() => setInputText("I have a headache")}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
            >
              💊 Headache
            </button>
            <button 
              onClick={() => setInputText("I have chest pain")}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
            >
              💓 Chest Pain
            </button>
            <button 
              onClick={() => setInputText("I have a fever")}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm transition-colors"
            >
              🌡️ Fever
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
