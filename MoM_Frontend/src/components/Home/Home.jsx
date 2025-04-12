import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [attendees, setAttendees] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [pdfURL, setPdfURL] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showAudioList, setShowAudioList] = useState(false);
    const [audioFiles, setAudioFiles] = useState([]);
    const [showSpeakerInput, setShowSpeakerInput] = useState(false);
    const [speakerName, setSpeakerName] = useState("");
    const [isRecording, setIsRecording] = useState(false);
    const [countdown, setCountdown] = useState(null);
    const [showLogin, setShowLogin] = useState(true);
    const [showRegister, setShowRegister] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [authError, setAuthError] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const navigate = useNavigate();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setAuthError("");
        
        if (!email.endsWith('dypit.edu.in')) {
            setAuthError('Only dypit.edu.in email addresses are allowed');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setIsAuthenticated(true);
                setShowLogin(false);
            } else {
                setAuthError(data.message);
            }
        } catch (error) {
            setAuthError('An error occurred. Please try again.');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setAuthError("");

        if (!email.endsWith('dypit.edu.in')) {
            setAuthError('Only dypit.edu.in email addresses are allowed');
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                setIsAuthenticated(true);
                setShowRegister(false);
            } else {
                setAuthError(data.message);
            }
        } catch (error) {
            setAuthError('An error occurred. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setShowLogin(true);
    };

    const handleFileUpload = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const startRecording = async () => {
        setRecording(true);
        setAudioBlob(null);
        setAudioURL(null);

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" });
            const audioURL = URL.createObjectURL(audioBlob);
            setAudioBlob(audioBlob);
            setAudioURL(audioURL);
        };

        mediaRecorderRef.current = mediaRecorder;
        mediaRecorder.start();
    };

    const stopRecording = () => {
        setRecording(false);
        mediaRecorderRef.current.stop();
    };

    const handleGenerateMoM = async () => {
        if (!selectedFile && !audioBlob) {
            alert("Please select a file or record audio!");
            return;
        }

        setLoading(true);
        setMessage("");

        const formData = new FormData();
        if (selectedFile) {
            formData.append("audio", selectedFile);
        } else if (audioBlob) {
            const file = new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" });
            console.log("📤 Sending file:", file);
            formData.append("audio", file);
        }
        formData.append("attendees", attendees);

        try {
            const response = await fetch("http://localhost:5001/process-audio", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            console.log("✅ Response from Flask:", data);

            if (data.pdf_url) {
                setPdfURL(`http://localhost:5001${data.pdf_url}`);
            }
        } catch (error) {
            console.error("❌ Fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    const openPreview = () => {
        if (!pdfURL) {
            alert("No PDF available. Please generate the MoM first.");
            return;
        }
        setShowModal(true);
    };

    const closePreview = () => {
        setShowModal(false);
    };

    const fetchAudioFiles = async () => {
        try {
            const response = await fetch("http://localhost:5001/list-audio-files");
            const data = await response.json();
            setAudioFiles(data.audios);
            setShowAudioList(true);
        } catch (error) {
            console.error("❌ Error fetching audio files:", error);
        }
    };

    const addNewSpeaker = async () => {
        if (!showSpeakerInput) {
            setShowSpeakerInput(true);
            setMessage("5-second audio will be recorded after clicking Add.");
            return;
        }
    
        if (!speakerName) {
            alert("Please enter a speaker name.");
            return;
        }
    
        setIsRecording(true);
        setMessage(""); // Remove instruction message
        setCountdown(3);
    
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    
        try {
            const response = await fetch("http://localhost:5001/add-speaker", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ speaker_name: speakerName }),
            });
    
            const data = await response.json();
            if (response.ok) {
                setMessage("✅ Successfully saved!");
            } else {
                setMessage(`❌ Error: ${data.error || "Failed to add speaker."}`);
            }
        } catch (error) {
            console.error("❌ Error:", error);
            setMessage("❌ Failed to connect to server.");
        }
    
        setTimeout(() => {
            setMessage("");
            setShowSpeakerInput(false);
            setSpeakerName("");
            setIsRecording(false);
        }, 3000);
    };
    
    const deleteAudioFile = async (filename) => {
        const confirmDelete = window.confirm(`Are you sure you want to delete "${filename}"?`);
        if (!confirmDelete) return;

        try {
            const response = await fetch(`http://localhost:5001/delete-audio/${filename}`, { method: "DELETE" });
            if (response.ok) {
                setAudioFiles(audioFiles.filter(file => file !== filename)); // Remove from UI
            } else {
                alert("❌ Failed to delete the file.");
            }
        } catch (error) {
            console.error("❌ Error deleting audio file:", error);
        }
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-xl w-96">
                    {showLogin ? (
                        <>
                            <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                            <form onSubmit={handleLogin}>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        placeholder="Email (@dypit.edu.in)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Login
                                </button>
                            </form>
                            <p className="mt-4 text-center">
                                Don't have an account?{" "}
                                <button
                                    onClick={() => {
                                        setShowLogin(false);
                                        setShowRegister(true);
                                        setAuthError("");
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    Register
                                </button>
                            </p>
                        </>
                    ) : (
                        <>
                            <h2 className="text-2xl font-semibold text-center mb-6">Register</h2>
                            <form onSubmit={handleRegister}>
                                <div className="mb-4">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-4">
                                    <input
                                        type="email"
                                        placeholder="Email (@dypit.edu.in)"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                <div className="mb-6">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                </div>
                                {authError && <p className="text-red-500 text-sm mb-4">{authError}</p>}
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
                                >
                                    Register
                                </button>
                            </form>
                            <p className="mt-4 text-center">
                                Already have an account?{" "}
                                <button
                                    onClick={() => {
                                        setShowRegister(false);
                                        setShowLogin(true);
                                        setAuthError("");
                                    }}
                                    className="text-blue-600 hover:underline"
                                >
                                    Login
                                </button>
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="absolute top-4 right-4">
                <button
                    onClick={handleLogout}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                >
                    Logout
                </button>
            </div>
            <div>
                <img src="./public/mom_final.png" alt="MoM_Image" />
            </div>


            <div className="mt-8 flex justify-center space-x-4">
                    <button
                        onClick={() => {
                            if (!showAudioList) {
                                fetchAudioFiles();  // ✅ Fetch when list is going to be shown
                            }
                            setShowAudioList(!showAudioList);
                        }}
                        className="bg-purple-600 text-white py-3 px-8 rounded-lg shadow-md hover:bg-purple-700 transition text-lg"
                    >
                        {showAudioList ? "Hide Pre-recorded Audios" : "List Pre-recorded Audios"}
                    </button>
                    <button
                        onClick={() => setShowSpeakerInput(!showSpeakerInput)}
                        className="bg-indigo-600 text-white py-3 px-8 rounded-lg shadow-md hover:bg-indigo-700 transition text-lg"
                    >
                        Add New Speaker
                    </button>
                </div>

            <div className="max-w-6xl mx-auto px-6 mt-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                    <div className="bg-white p-8 rounded-lg shadow-xl text-center flex flex-col items-center w-full h-60">
                        <h2 className="text-2xl font-semibold text-[#152c39] mb-4">Upload Your File</h2>
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-8 rounded-lg transition text-lg">
                            Select File
                            <input type="file" onChange={handleFileUpload} className="hidden" />
                        </label>
                        {selectedFile && <p className="text-gray-600 mt-3 text-lg">📄 {selectedFile.name}</p>}
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-xl text-center flex flex-col items-center w-full h-60">
                        <h2 className="text-2xl font-semibold text-[#152c39] mb-4">Record Audio</h2>
                        {recording ? (
                            <button onClick={stopRecording} className="bg-red-500 text-white py-3 px-8 rounded-lg shadow-md hover:bg-red-600 transition text-lg">
                                Stop Recording
                            </button>
                        ) : (
                            <button onClick={startRecording} className="bg-green-500 text-white py-3 px-8 rounded-lg shadow-md hover:bg-green-600 transition text-lg">
                                Start Recording
                            </button>
                        )}
                        {audioURL && (
                            <audio controls className="mt-3 w-full">
                                <source src={audioURL} type="audio/wav" />
                                Your browser does not support the audio element.
                            </audio>
                        )}
                    </div>

                    <div className="bg-white p-8 rounded-lg shadow-xl text-center flex flex-col items-center w-full h-60">
                        <h2 className="text-2xl font-semibold text-[#152c39] mb-4">Enter Attendees</h2>
                        <input 
                            type="text" 
                            value={attendees} 
                            onChange={(e) => setAttendees(e.target.value)} 
                            placeholder="Enter attendee names (comma-separated)" 
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-md focus:ring focus:ring-blue-300 text-lg"
                        />
                    </div>
                </div>

                

                {showSpeakerInput && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
                        <div className="flex flex-col space-y-4">
                            <input
                                type="text"
                                value={speakerName}
                                onChange={(e) => setSpeakerName(e.target.value)}
                                placeholder="Enter speaker name"
                                className="px-4 py-2 border-2 border-gray-300 rounded-md focus:ring focus:ring-blue-300"
                            />
                            <button
                                onClick={addNewSpeaker}
                                className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
                                disabled={isRecording}
                            >
                                {isRecording ? `Recording in ${countdown}...` : "Start Recording"}
                            </button>
                        </div>
                    </div>
                )}

                {showAudioList && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-xl max-w-2xl mx-auto">
                        <h3 className="text-xl font-semibold mb-4">Pre-recorded Audio Files</h3>
                        <div className="space-y-2">
                            {audioFiles.map((file, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                                    <span>{file}</span>
                                    <button
                                        onClick={() => deleteAudioFile(file)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-10 flex justify-center space-x-4">
                    <button onClick={handleGenerateMoM} className="bg-blue-600 text-white py-4 px-12 rounded-lg shadow-lg text-xl font-semibold hover:bg-blue-700 transform transition hover:scale-110 hover:shadow-xl" disabled={loading}>
                        {loading ? "Generating..." : "Generate MoM"}
                    </button>
                    <button onClick={openPreview} className="bg-green-600 text-white py-4 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-green-700 transition">Preview</button>
                    {pdfURL && (
                        <a href={pdfURL} download className="bg-gray-600 text-white py-4 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-gray-700 transition">
                            Download
                        </a>
                    )}
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white p-6 rounded-lg w-4/5 h-4/5 relative">
                        <button onClick={closePreview} className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded">
                            ✖ Close
                        </button>
                        <iframe src={pdfURL} className="w-full h-full"></iframe>
                    </div>
                </div>
            )}
        </>
    );
}