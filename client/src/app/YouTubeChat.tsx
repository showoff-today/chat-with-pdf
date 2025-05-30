"use client";
import { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@clerk/nextjs";
import { Upload, MessageCircle, Send, AlertCircle, RefreshCw, Sparkles, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function YouTubeChat() {
  const { getToken, userId } = useAuth();
  const [youtubeUrl, setYoutubeUrl] = useState<string>("");
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to the bottom of the chat container when messages or isSendingMessage changes
  useEffect(() => {
    if (messagesEndRef.current) {
      const chatContainer = messagesEndRef.current.parentElement;
      if (chatContainer) {
        chatContainer.scrollTo({
          top: chatContainer.scrollHeight,
          behavior: "smooth",
        });
      }
    }
  }, [messages, isSendingMessage]);

  // Handle YouTube URL submission
  const handleYoutubeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) return;

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    if (!youtubeRegex.test(youtubeUrl)) {
      setError("Please enter a valid YouTube URL.");
      return;
    }

    try {
      setIsProcessing(true);
      setError(null);

      const token = await getToken();
      if (!token) throw new Error("Authentication token is missing.");

      const uuid = uuidv4();
      const response = await axios.post(
        "http://localhost:3001/youtube-upload",
        { url: youtubeUrl, id: uuid },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setYoutubeId(uuid);
      setMessages([
        { role: "assistant", content: `YouTube video has been processed. How can I help you with this video?` },
      ]);
    } catch (error) {
      let errorMessage = "Failed to process YouTube URL.";
      if (error instanceof AxiosError) {
        errorMessage = error.response
          ? `Error: ${error.response.data?.message || error.response.statusText || error.message}`
          : "Server did not respond. Please check your connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setError(errorMessage);
      setYoutubeId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset error state
  const resetError = () => {
    setError(null);
  };

  // Handle message sending
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim() || !youtubeId || !userId) return;

    const newMessages: Message[] = [...messages, { role: "user", content: messageInput }];
    setMessages(newMessages);
    setMessageInput("");
    setIsSendingMessage(true);

    try {
      const token = await getToken();
      if (!token) throw new Error("Authentication token is missing.");

      const response = await axios.post<{ role: "assistant"; content: string }>(
        "http://localhost:3001/youtube-chat",
        { question: messageInput, userId, id: youtubeId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setMessages([...newMessages, response.data]);
    } catch (error) {
      let errorMessage = "Failed to get response. Please try again.";
      if (error instanceof AxiosError) {
        errorMessage = error.response
          ? `Error: ${error.response.data?.message || error.response.statusText || error.message}`
          : "Server did not respond. Please check your connection and try again.";
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      setMessages([...newMessages, { role: "assistant", content: errorMessage }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Reset YouTube URL and messages
  const handleUseDifferentVideo = () => {
    setYoutubeUrl("");
    setYoutubeId(null);
    setMessages([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* YouTube URL Input Section */}
      <section className="w-full lg:w-2/5 xl:w-1/3">
        <div className="sticky top-6 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border-b border-blue-100/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.2A1 1 0 0010 9.768v4.464a1 1 0 001.555.832l3.197-2.2a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">YouTube Video</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Enter a YouTube URL to start chatting</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {!youtubeId ? (
              <div className="relative group">
                {isProcessing ? (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 rounded-full"></div>
                      <div className="absolute top-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">Processing your YouTube video...</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-red-300 dark:border-red-600 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 dark:text-red-400 font-medium text-center mb-4">{error}</p>
                    <button
                      onClick={resetError}
                      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-red-600 dark:text-red-400 font-medium shadow-sm hover:shadow-md"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleYoutubeSubmit}
                    className="flex flex-col items-center gap-4 p-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/30 transition-all duration-300 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:shadow-lg"
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    <input
                      type="text"
                      placeholder="Enter YouTube URL"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 shadow-sm placeholder-gray-500 dark:placeholder-gray-400"
                    />
                    <button
                      type="submit"
                      disabled={!youtubeUrl.trim()}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.2A1 1 0 0010 9.768v4.464a1 1 0 001.555.832l3.197-2.2a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Process YouTube Video
                    </button>
                  </form>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.2A1 1 0 0010 9.768v4.464a1 1 0 001.555.832l3.197-2.2a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">YouTube Video</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{youtubeUrl}</p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <button
                  onClick={handleUseDifferentVideo}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 text-gray-700 dark:text-gray-200 font-medium shadow-sm hover:shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  Use Different Video
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="w-full lg:w-3/5 xl:w-2/3 flex flex-col">
        <div className="flex-1 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden flex flex-col">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 p-6 border-b border-indigo-100/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">AI Assistant</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {youtubeId ? `Chatting about YouTube video` : "Enter a YouTube URL to start chatting"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto min-h-[400px] max-h-[600px] bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/30 dark:to-blue-900/10">
            {!youtubeId ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/50 rounded-3xl flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 text-gray-400 dark:text-gray-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.752 11.168l-3.197-2.2A1 1 0 0010 9.768v4.464a1 1 0 001.555.832l3.197-2.2a1 1 0 000-1.664z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Ready to Analyze</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                  Enter a YouTube video URL and I'll help you understand, summarize, and answer questions about its content using advanced AI.
                </p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-3xl flex items-center justify-center">
                    <Bot className="w-10 h-10 text-blue-500" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-3 h-3 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Let's Chat!</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                  Your YouTube video is ready! Ask me anything about
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mt-1 truncate">
                    "{youtubeUrl}"
                  </span>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-purple-600"
                          : "bg-gradient-to-br from-indigo-500 to-purple-600"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`max-w-[85%] md:max-w-[75%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div
                        className={`p-4 rounded-2xl shadow-sm border ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-200/50"
                            : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-200/50 dark:border-gray-600/50"
                        }`}
                      >
                        <p className="leading-relaxed">{message.content}</p>
                      </div>
                      <p
                        className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                          message.role === "user" ? "text-right" : ""
                        }`}
                      >
                        {message.role === "user" ? "You" : "AI Assistant"}
                      </p>
                    </div>
                  </div>
                ))}
                {isSendingMessage && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="max-w-[85%] md:max-w-[75%]">
                      <div className="p-4 rounded-2xl bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-200/50 dark:border-gray-600/50 shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100"></div>
                            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-200"></div>
                          </div>
                          <span className="text-gray-600 dark:text-gray-300">AI is thinking...</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">AI Assistant</p>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-6 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <form onSubmit={handleSendMessage} className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder={youtubeId ? "Ask anything about your YouTube video..." : "Enter a YouTube URL to start chatting"}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={!youtubeId || isSendingMessage}
                  className="w-full p-4 pr-12 rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-all duration-200 shadow-sm placeholder-gray-500 dark:placeholder-gray-400"
                />
                {messageInput && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!youtubeId || !messageInput.trim() || isSendingMessage || !userId}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center min-w-[60px] font-medium"
              >
                {isSendingMessage ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
            {youtubeId && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                Press Enter to send • AI-powered by advanced language models
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}