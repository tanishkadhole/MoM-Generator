import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Manual() {
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
    const [meetingTitle, setMeetingTitle] = useState("");
    const [meetingHead, setMeetingHead] = useState("");
    const [meetingDate, setMeetingDate] = useState("");
    const [meetingTime, setMeetingTime] = useState("");
    const [shareMessage, setShareMessage] = useState("");

    const navigate = useNavigate();
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const handleFileUpload = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

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
                setRecording(false);
            };

            mediaRecorder.start();
            setRecording(true);
            setAudioBlob(null);
            setAudioURL(null);
        } catch (error) {
            console.error("Error accessing microphone:", error);
            setMessage("Error accessing microphone. Please check permissions.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }
    };

    const handleGenerateMoM = async () => {
        if (!selectedFile && !audioBlob) {
            setMessage("Please select a file or record audio!");
            return;
        }

        if (!meetingTitle || !meetingHead || !meetingDate || !meetingTime) {
            setMessage("Please fill in all meeting details!");
            return;
        }

        setLoading(true);
        setMessage("");

        const formData = new FormData();
        if (selectedFile) {
            formData.append("audio", selectedFile);
        } else if (audioBlob) {
            const file = new File([audioBlob], "recorded_audio.wav", { type: "audio/wav" });
            formData.append("audio", file);
        }
        formData.append("attendees", attendees);
        formData.append("meetingTitle", meetingTitle);
        formData.append("meetingHead", meetingHead);
        formData.append("meetingDate", meetingDate);
        formData.append("meetingTime", meetingTime);

        try {
            const response = await fetch("http://localhost:5001/process-audio-manual", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (data.pdf_url) {
                setPdfURL(`http://localhost:5001${data.pdf_url}`);
            }
        } catch (error) {
            console.error("Error:", error);
            setMessage("An error occurred while generating the MoM.");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!pdfURL) return;

        try {
            // Fetch the PDF file
            const response = await fetch(pdfURL);
            const blob = await response.blob();
            const file = new File([blob], 'meeting_minutes.pdf', { type: 'application/pdf' });

            if (navigator.share) {
                await navigator.share({
                    title: 'Meeting Minutes',
                    text: 'Check out these meeting minutes!',
                    files: [file]
                });
            } else {
                // Fallback for browsers that don't support sharing files
                const downloadLink = document.createElement('a');
                downloadLink.href = pdfURL;
                downloadLink.download = 'meeting_minutes.pdf';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                setShareMessage('PDF downloaded!');
                setTimeout(() => setShareMessage(''), 3000);
            }
        } catch (error) {
            console.error('Error sharing:', error);
            setShareMessage('Failed to share. Please try again.');
            setTimeout(() => setShareMessage(''), 3000);
        }
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

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Manual Meeting Minutes</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                    >
                        Back to Home
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column - Meeting Details */}
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Meeting Details</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Meeting Title
                                </label>
                                <input
                                    type="text"
                                    value={meetingTitle}
                                    onChange={(e) => setMeetingTitle(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter meeting title"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Meeting Head
                                </label>
                                <input
                                    type="text"
                                    value={meetingHead}
                                    onChange={(e) => setMeetingHead(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter meeting head name"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={meetingDate}
                                        onChange={(e) => setMeetingDate(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={meetingTime}
                                        onChange={(e) => setMeetingTime(e.target.value)}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Audio Input */}
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Audio Input</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Upload Audio File
                                </label>
                                <input
                                    type="file"
                                    onChange={handleFileUpload}
                                    accept="audio/*"
                                    className="w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Record Audio
                                </label>
                                <button
                                    onClick={recording ? stopRecording : startRecording}
                                    className={`w-full py-2 px-4 rounded-lg ${
                                        recording
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    } text-white transition`}
                                >
                                    {recording ? 'Stop Recording' : 'Start Recording'}
                                </button>
                            </div>
                            {audioURL && (
                                <div>
                                    <label className="block text-gray-700 text-sm font-bold mb-2">
                                        Recorded Audio
                                    </label>
                                    <audio controls className="w-full">
                                        <source src={audioURL} type="audio/wav" />
                                        Your browser does not support the audio element.
                                    </audio>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Additional Options */}
                <div className="mt-8 flex justify-center space-x-4">
                    <button
                        onClick={() => {
                            if (!showAudioList) {
                                fetchAudioFiles();
                            }
                            setShowAudioList(!showAudioList);
                        }}
                        className="bg-purple-600 text-white py-3 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-purple-700 transition"
                    >
                        {showAudioList ? "Hide Pre-recorded Audios" : "List Pre-recorded Audios"}
                    </button>
                    <button
                        onClick={() => setShowSpeakerInput(!showSpeakerInput)}
                        className="bg-indigo-600 text-white py-3 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-indigo-700 transition"
                    >
                        Add New Speaker
                    </button>
                </div>

                {showSpeakerInput && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-xl">
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
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-xl">
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

                {/* Bottom Section - Generate and Actions */}
                <div className="mt-8 bg-white p-6 rounded-lg shadow-xl">
                    <div className="space-y-4">
                        {(recording || audioURL) && (
                            <div>
                                <label className="block text-gray-700 text-sm font-bold mb-2">
                                    Attendees (comma-separated)
                                </label>
                                <input
                                    type="text"
                                    value={attendees}
                                    onChange={(e) => setAttendees(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter attendee names"
                                />
                            </div>
                        )}
                        <div className="flex justify-center space-x-4">
                            <button
                                onClick={handleGenerateMoM}
                                disabled={loading}
                                className="bg-blue-600 text-white py-3 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50"
                            >
                                {loading ? 'Generating...' : 'Generate MoM'}
                            </button>
                            {pdfURL && (
                                <>
                                    <button
                                        onClick={openPreview}
                                        className="bg-green-600 text-white py-3 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-green-700 transition"
                                    >
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => window.open(pdfURL, '_blank')}
                                        className="bg-gray-600 text-white py-3 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-gray-700 transition"
                                    >
                                        Download
                                    </button>
                                    <button
                                        onClick={handleShare}
                                        className="bg-purple-600 text-white py-3 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-purple-700 transition"
                                    >
                                        Share
                                    </button>
                                </>
                            )}
                        </div>
                        {message && (
                            <p className="text-center text-red-600 font-semibold">{message}</p>
                        )}
                        {shareMessage && (
                            <p className="text-center text-green-600 font-semibold">{shareMessage}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg w-4/5 h-4/5 relative">
                        <button 
                            onClick={closePreview} 
                            className="absolute top-2 right-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition"
                        >
                            ✖ Close
                        </button>
                        <iframe 
                            src={pdfURL} 
                            className="w-full h-full rounded"
                            title="PDF Preview"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
