"use client";
import { useState } from "react";
import { FileText, Video, Sparkles, MessageCircle, ArrowRight, Star } from "lucide-react";
import Chat from "./chat";
import YouTubeChat from "./YouTubeChat";
import { UserButton } from "@clerk/nextjs";

// // Mock components - replace with your actual components
// const Chat = () => (
//   <div className="flex items-center justify-center h-64 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
//     <div className="text-center">
//       <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
//       <p className="text-gray-600 dark:text-gray-300">PDF Chat Component</p>
//     </div>
//   </div>
// );

// const YouTubeChat = () => (
//   <div className="flex items-center justify-center h-64 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-100 dark:border-red-800">
//     <div className="text-center">
//       <Video className="w-12 h-12 text-red-500 mx-auto mb-3" />
//       <p className="text-gray-600 dark:text-gray-300">YouTube Chat Component</p>
//     </div>
//   </div>
// );

// const UserButton = () => (
//   <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
//     U
//   </div>
// );

export default function Home() {
  const [activeTab, setActiveTab] = useState("pdf");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-white/20 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Sparkles className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full animate-ping"></div>
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ResoTalk
                </h1>
              </div>
              <div className="hidden md:flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-full border border-indigo-200/50 dark:border-indigo-700/50">
                <Star className="w-3 h-3 text-yellow-500" />
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">AI Powered</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200/50 dark:border-green-700/50">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Online</span>
              </div>
              <UserButton />
            </div>
          </div>

          {/* Enhanced Tab Navigation */}
          <div className="mt-6">
            <div className="flex p-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 dark:border-gray-700/50">
              <button
                onClick={() => setActiveTab("pdf")}
                className={`group relative flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "pdf"
                    ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 transform scale-[1.02]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                <FileText className={`w-5 h-5 transition-transform duration-300 ${activeTab === "pdf" ? "scale-110" : "group-hover:scale-105"}`} />
                <span className="font-medium">Chat with PDF</span>
                {activeTab === "pdf" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                )}
              </button>
              
              <button
                onClick={() => setActiveTab("youtube")}
                className={`group relative flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                  activeTab === "youtube"
                    ? "bg-gradient-to-r from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/25 transform scale-[1.02]"
                    : "text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-700/50 hover:text-gray-800 dark:hover:text-white"
                }`}
              >
                <Video className={`w-5 h-5 transition-transform duration-300 ${activeTab === "youtube" ? "scale-110" : "group-hover:scale-105"}`} />
                <span className="font-medium">Chat with YouTube</span>
                {activeTab === "youtube" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-700 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative flex-1 max-w-7xl mx-auto p-6 lg:p-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-full border border-indigo-200/50 dark:border-indigo-700/50 mb-6">
            <MessageCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-sm font-medium text-indigo-700 dark:text-indigo-300">Intelligent Conversations</span>
            <ArrowRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          {/* <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-gray-800 via-gray-900 to-black dark:from-white dark:via-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
              Transform Your
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Learning Experience
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Engage in intelligent conversations with your PDFs and YouTube videos. 
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Powered by AI</span>
          </p> */}
        </div>

        {/* Enhanced Content Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-3xl"></div>
          <div className="relative backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 rounded-3xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 lg:p-12">
            <div className="transition-all duration-500 ease-in-out">
              {activeTab === "pdf" ? <Chat /> : <YouTubeChat />}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        {/* <div className="grid md:grid-cols-2 gap-6 mt-12">
          <div className="group p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-100 dark:border-blue-800 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1">
            <FileText className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">PDF Intelligence</h3>
            <p className="text-gray-600 dark:text-gray-300">Upload and chat with your PDF documents using advanced AI understanding.</p>
          </div>
          
          <div className="group p-6 bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-2xl border border-red-100 dark:border-red-800 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 hover:-translate-y-1">
            <Video className="w-8 h-8 text-red-500 mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">Video Insights</h3>
            <p className="text-gray-600 dark:text-gray-300">Analyze and discuss YouTube video content with AI-powered conversations.</p>
          </div>
        </div> */}
      </main>

      {/* Enhanced Footer */}
      <footer className="relative mt-16 py-8 backdrop-blur-md bg-white/60 dark:bg-gray-900/60 border-t border-white/20 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span className="font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              ResoTalk
            </span>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Powered by <span className="font-medium text-indigo-600 dark:text-indigo-400">showoff.today</span>
          </p>
        </div>
      </footer>
    </div>
  );
}