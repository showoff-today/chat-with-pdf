"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import axios, { AxiosError } from "axios";
import { v4 as uuidv4 } from "uuid";
import { useAuth } from "@clerk/nextjs";
import { Upload, FileText, MessageCircle, Send, AlertCircle, RefreshCw, Sparkles, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const { getToken, userId } = useAuth();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [fileId, setFileId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState<string>("");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSendingMessage, setIsSendingMessage] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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

  // Handle PDF upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed.");
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const formData = new FormData();
      formData.append("file", file);
      const uuid = uuidv4();
      formData.append("id", uuid);

      await axios.post("http://localhost:3001/upload-file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      setPdfFile(file);
      setFileId(uuid);
      setMessages([
        { role: "assistant", content: `PDF "${file.name}" has been uploaded successfully! I'm ready to help you explore its content. What would you like to know?` },
      ]);
    } catch (error) {
      let errorMessage = "Failed to upload the file.";

      if (error instanceof AxiosError) {
        if (error.response) {
          errorMessage = `Upload failed: ${error.response.data?.message || error.response.statusText || error.message}`;
        } else if (error.request) {
          errorMessage = "Server did not respond. Please check your connection and try again.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setUploadError(errorMessage);
      setPdfFile(null);
      setFileId(null);
    } finally {
      setIsUploading(false);
    }
  };

  // Reset error state
  const resetError = () => {
    setUploadError(null);
  };

  // Send message and call chat API
  const handleSendMessage = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!messageInput.trim() || !pdfFile || !userId || !fileId) return;

    const newMessages: Message[] = [...messages, { role: "user", content: messageInput }];
    setMessages(newMessages);
    setMessageInput("");
    setIsSendingMessage(true);

    try {
      const token = await getToken();
      if (!token) {
        throw new Error("Authentication token is missing.");
      }

      const response = await axios.post<{ role: "assistant"; content: string }>(
        "http://localhost:3001/chat",
        {
          question: messageInput,
          userId,
          id: fileId,
        },
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
        if (error.response) {
          errorMessage = `Error: ${error.response.data?.message || error.response.statusText || error.message}`;
        } else if (error.request) {
          errorMessage = "Server did not respond. Please check your connection and try again.";
        }
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setMessages([...newMessages, { role: "assistant", content: errorMessage }]);
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Reset pdfFile and fileId when uploading a different file
  const handleUploadDifferentFile = () => {
    setPdfFile(null);
    setFileId(null);
    setMessages([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* PDF Upload Section */}
      <section className="w-full lg:w-2/5 xl:w-1/3">
        <div className="sticky top-6 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 rounded-3xl shadow-xl border border-white/20 dark:border-gray-700/50 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 p-6 border-b border-blue-100/50 dark:border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white">Document Upload</h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">Upload your PDF to start chatting</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {!pdfFile ? (
              <div className="relative group">
                <input
                  type="file"
                  id="pdf-upload"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                
                {isUploading ? (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
                    <div className="relative">
                      <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-700 rounded-full"></div>
                      <div className="absolute top-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium">Processing your PDF...</p>
                    <div className="flex items-center gap-1 mt-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                  </div>
                ) : uploadError ? (
                  <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-red-300 dark:border-red-600 rounded-2xl bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <p className="text-red-600 dark:text-red-400 font-medium text-center mb-4">{uploadError}</p>
                    <button
                      onClick={resetError}
                      className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-700 border border-red-200 dark:border-red-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 text-red-600 dark:text-red-400 font-medium shadow-sm hover:shadow-md"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <label
                    htmlFor="pdf-upload"
                    className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-2xl cursor-pointer bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 hover:from-blue-50 hover:to-indigo-50 dark:hover:from-blue-900/20 dark:hover:to-indigo-900/30 transition-all duration-300 group-hover:border-blue-400 dark:group-hover:border-blue-500 group-hover:shadow-lg"
                  >
                    <div className="relative mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/50 dark:to-indigo-900/50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-8 h-8 text-blue-500 group-hover:text-blue-600 transition-colors duration-300" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                        <Sparkles className="w-3 h-3 text-white" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-semibold text-gray-800 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300">
                        Drop your PDF here
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        or click to browse files
                      </p>
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                        <FileText className="w-4 h-4" />
                        Select PDF File
                      </div>
                    </div>
                  </label>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200/50 dark:border-green-700/50">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 dark:text-white truncate">{pdfFile.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB • Ready to chat
                    </p>
                  </div>
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                
                <button
                  onClick={handleUploadDifferentFile}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-600 transition-all duration-200 text-gray-700 dark:text-gray-200 font-medium shadow-sm hover:shadow-md"
                >
                  <Upload className="w-4 h-4" />
                  Upload Different File
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
                  {pdfFile ? `Chatting about ${pdfFile.name}` : "Upload a PDF to start chatting"}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-6 overflow-y-auto min-h-[400px] max-h-[600px] bg-gradient-to-br from-gray-50/50 to-blue-50/30 dark:from-gray-900/30 dark:to-blue-900/10">
            {!pdfFile ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-blue-100 dark:from-gray-700 dark:to-blue-900/50 rounded-3xl flex items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400 dark:text-gray-500" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center animate-bounce">
                    <Upload className="w-4 h-4 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-800 dark:text-white">Ready to Analyze</h3>
                <p className="text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
                  Upload a PDF document and I'll help you understand, summarize, and answer questions about its content using advanced AI.
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
                  Your PDF is ready! Ask me anything about 
                  <span className="font-semibold text-blue-600 dark:text-blue-400 block mt-1">"{pdfFile.name}"</span>
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 ${message.role === "user" ? "flex-row-reverse" : ""}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === "user" 
                        ? "bg-gradient-to-br from-blue-500 to-purple-600" 
                        : "bg-gradient-to-br from-indigo-500 to-purple-600"
                    }`}>
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    
                    <div className={`max-w-[85%] md:max-w-[75%] ${message.role === "user" ? "text-right" : ""}`}>
                      <div className={`p-4 rounded-2xl shadow-sm border ${
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white border-blue-200/50"
                          : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border-gray-200/50 dark:border-gray-600/50"
                      }`}>
                        <p className="leading-relaxed">{message.content}</p>
                      </div>
                      <p className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                        message.role === "user" ? "text-right" : ""
                      }`}>
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
                  placeholder={pdfFile ? "Ask anything about your PDF..." : "Upload a PDF to start chatting"}
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  disabled={!pdfFile || isSendingMessage}
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
                disabled={!pdfFile || !messageInput.trim() || isSendingMessage || !userId || !fileId}
                className="px-6 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:from-gray-300 disabled:to-gray-400 dark:disabled:from-gray-700 dark:disabled:to-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none flex items-center justify-center min-w-[60px] font-medium"
              >
                {isSendingMessage ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
            
            {pdfFile && (
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