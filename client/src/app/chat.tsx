"use client";
import { useState } from "react";
import Image from "next/image";
import { useAuth, UserButton } from "@clerk/nextjs";
import axios from "axios";

export default function Chat() {
    const { getToken } = useAuth()
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([]);
    const [messageInput, setMessageInput] = useState<string>("");
    const [isUploading, setIsUploading] = useState<boolean>(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Improved function for handling PDF upload with error handling
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
            const formData = new FormData();
            formData.append("file", file);

            await axios.post('http://localhost:3001/upload-file', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });

            setPdfFile(file);
            // Add initial message from assistant
            setMessages([
                { role: 'assistant', content: `PDF "${file.name}" has been uploaded. How can I help you with this document?` }
            ]);
        } catch (error) {
            let errorMessage = "Failed to upload the file.";
            
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Server responded with an error status
                    errorMessage = `Upload failed: ${error.response.data?.message || error.response.statusText || error.message}`;
                } else if (error.request) {
                    // Request was made but no response received
                    errorMessage = "Server did not respond. Please check your connection and try again.";
                }
            }
            
            setUploadError(errorMessage);
            setPdfFile(null);
        } finally {
            setIsUploading(false);
        }
    };

    // Function to reset the error state
    const resetError = () => {
        setUploadError(null);
    };

    // Placeholder function for sending a message
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim() || !pdfFile) return;

        // Add user message
        const newMessages = [...messages, { role: 'user', content: messageInput }];
        // @ts-ignore
        setMessages(newMessages);
        setMessageInput("");

        // Simulate assistant response
        setTimeout(() => {
            setMessages([
                // @ts-ignore
                ...newMessages,
                {
                    // @ts-ignore
                    role: 'assistant',
                    content: `This is a placeholder response. In the full implementation, I would analyze "${pdfFile.name}" to answer your question.`
                }
            ]);
        }, 1000);
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 shadow-sm px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3"> 
                        <h1 className="text-xl font-bold text-gray-800 dark:text-white">Chat with PDF</h1>
                    </div>
                    <div className="flex flex-row-reverse p-2">
                        <UserButton />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row gap-6">
                    {/* PDF Upload Section */}
                    <section className="w-full lg:w-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Upload PDF</h2>
                        </div>

                        <div className="p-5">
                            {!pdfFile ? (
                                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 h-64 bg-gray-50 dark:bg-gray-900/50">
                                    <input
                                        type="file"
                                        id="pdf-upload"
                                        accept="application/pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    {isUploading ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                                            <p className="text-gray-600 dark:text-gray-300">Uploading...</p>
                                        </div>
                                    ) : (
                                        <>
                                            {uploadError ? (
                                                <div className="flex flex-col items-center gap-3 text-center">
                                                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-red-600 font-medium">{uploadError}</p>
                                                    <button
                                                        onClick={resetError}
                                                        className="mt-2 px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium text-sm"
                                                    >
                                                        Try Again
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <Image
                                                        src="/file.svg"
                                                        alt="Upload icon"
                                                        width={56}
                                                        height={56}
                                                        className="mb-5 opacity-60 dark:opacity-40"
                                                    />
                                                    <label
                                                        htmlFor="pdf-upload"
                                                        className="px-5 py-2.5 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors font-medium text-sm md:text-base shadow-sm"
                                                    >
                                                        Select PDF
                                                    </label>
                                                    <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">PDF files only</p>
                                                </>
                                            )}
                                        </>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                                        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                            <Image
                                                src="/file.svg"
                                                alt="PDF icon"
                                                width={24}
                                                height={24}
                                                className="text-blue-600"
                                            />
                                        </div>
                                        <div className="flex-1 overflow-hidden">
                                            <p className="font-medium truncate text-gray-800 dark:text-white">{pdfFile.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {(pdfFile.size / (1024 * 1024)).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setPdfFile(null)}
                                        className="px-4 py-2.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors text-gray-700 dark:text-gray-200 font-medium text-sm"
                                    >
                                        Upload different file
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Chat Section */}
                    <section className="w-full lg:w-2/3 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
                        {/* Chat Messages */}
                        <div className="flex-1 p-5 overflow-y-auto min-h-[400px] max-h-[600px] bg-gray-50 dark:bg-gray-900/30">
                            {!pdfFile ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
                                        <Image
                                            src="/globe.svg"
                                            alt="Chat icon"
                                            width={32}
                                            height={32}
                                            className="opacity-60 dark:opacity-40"
                                        />
                                    </div>
                                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Upload a PDF to start</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-md">
                                        Once you upload a document, you can ask questions about its content
                                    </p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-6">
                                    <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-medium mb-2 text-gray-800 dark:text-white">Start your conversation</h3>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        Ask questions about "<span className="font-medium text-blue-600 dark:text-blue-400">{pdfFile.name}</span>"
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {messages.map((message, index) => (
                                        <div
                                            key={index}
                                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-[85%] md:max-w-[75%] p-4 rounded-2xl shadow-sm ${message.role === 'user'
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 border border-gray-100 dark:border-gray-600'
                                                    }`}
                                            >
                                                {message.content}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Message Input */}
                        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                            <form
                                onSubmit={handleSendMessage}
                                className="flex gap-2"
                            >
                                <input
                                    type="text"
                                    placeholder={pdfFile ? "Ask a question about your PDF..." : "Upload a PDF to start chatting"}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value)}
                                    disabled={!pdfFile}
                                    className="flex-grow p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:cursor-not-allowed transition-colors text-sm md:text-base"
                                />
                                <button
                                    type="submit"
                                    disabled={!pdfFile || !messageInput.trim()}
                                    className="p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center justify-center min-w-[44px]"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-auto py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500 dark:text-gray-400">
                    <p>Chat with PDF - Powered by showoff.today</p>
                </div>
            </footer>
        </div>
    );
}