"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

export default function Home() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm Tribot, your AI medical triage assistant developed at UNSW Sydney. Please describe your symptoms and I'll help assess the urgency of your condition.",
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

  // Fix hydration issue
  useEffect(() => {
    setIsClient(true);
    setMessages([
      {
        id: 1,
        text: "Hello! I'm Tribot, your AI medical triage assistant developed at UNSW Sydney. Please describe your symptoms and I'll help assess the urgency of your condition.",
        sender: "bot",
        timestamp: getCleanTimestamp()
      }
    ]);
  }, []);

  const sendMessage = async () => {
    if (inputText.trim() === "" || isLoading) return;

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
        text: "I apologize, but I'm experiencing technical difficulties. Please try again or seek immediate medical attention if this is urgent.",
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header with Real UNSW Logo */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center space-x-6">
              {/* Real UNSW Logo */}
              <div className="flex items-center space-x-4">
                <Image
                  src="/unsw-logo.png"
                  alt="UNSW Sydney Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                  priority
                />
                
                <div className="flex items-center space-x-4">
                  <div className="h-16 w-px bg-gray-300"></div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tribot</h1>
                    <p className="text-sm text-gray-600">AI Medical Triage Assistant</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-gray-600 bg-green-50 px-3 py-1 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">Online</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100 p-6">
          <div className="text-center max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Medical Triage Assessment</h2>
            </div>
            <p className="text-gray-700 mb-2">
              Advanced AI-powered triage system developed at UNSW Sydney Faculty of Medicine & Health
            </p>
            <p className="text-sm text-gray-600">
              I will help assess your symptoms and provide guidance on the appropriate level of care needed. 
              This is not a substitute for professional medical advice.
            </p>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-2xl ${message.sender === "user" ? "order-1" : "order-2"}`}>
                  <div className={`flex items-start space-x-3 ${message.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-md ${
                      message.sender === "user" 
                        ? "bg-blue-600 text-white" 
                        : "bg-gradient-to-r from-red-600 to-red-700 text-white"
                    }`}>
                      {message.sender === "user" ? "U" : "T"}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`px-5 py-4 rounded-lg shadow-sm ${
                      message.sender === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      <p className={`text-xs mt-2 ${
                        message.sender === "user" ? "text-blue-100" : "text-gray-500"
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-2xl order-2">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-700 text-white flex items-center justify-center text-sm font-semibold shadow-md">
                      T
                    </div>
                    <div className="bg-white border border-gray-200 px-5 py-4 rounded-lg rounded-bl-sm shadow-sm">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                        <p className="text-sm text-gray-600">Analyzing symptoms with UNSW AI...</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 bg-white p-6 shadow-lg">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe your symptoms in detail..."
                className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-500 shadow-sm"
                disabled={isLoading}
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={isLoading || inputText.trim() === ""}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 shadow-lg disabled:shadow-none"
            >
              {isLoading ? "..." : "Send"}
            </button>
          </div>
          
          {/* Quick symptom buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button 
              onClick={() => setInputText("I have severe chest pain and difficulty breathing")}
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-full text-sm font-medium transition-all transform hover:scale-105 border border-red-200"
            >
              🚨 Emergency: Chest Pain
            </button>
            <button 
              onClick={() => setInputText("I have a persistent headache with nausea and sensitivity to light")}
              className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-full text-sm font-medium transition-all transform hover:scale-105 border border-yellow-200"
            >
              🤕 Severe Headache
            </button>
            <button 
              onClick={() => setInputText("I have a high fever over 38.5°C with chills and body aches")}
              className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-full text-sm font-medium transition-all transform hover:scale-105 border border-orange-200"
            >
              🌡️ High Fever
            </button>
            <button 
              onClick={() => setInputText("I injured my ankle, it's swollen and I can't walk")}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm font-medium transition-all transform hover:scale-105 border border-blue-200"
            >
              🦵 Injury/Trauma
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="text-xs text-gray-600">
                Powered by <span className="font-semibold text-gray-900">UNSW Sydney</span> Faculty of Medicine & Health
              </div>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-600">
                ⚠️ This AI assistant provides preliminary triage guidance only. 
                For emergencies, call <span className="font-semibold text-red-600">000</span> immediately. 
                Always consult healthcare professionals for definitive medical advice.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

