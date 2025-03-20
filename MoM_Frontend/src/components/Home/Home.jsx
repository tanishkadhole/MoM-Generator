import React, { useState, useRef } from "react";

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

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

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


    // Fetch pre-recorded audio files
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
    
        // Start Countdown
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev === 1) {
                    clearInterval(interval);
                    return null;
                }
                return prev - 1;
            });
        }, 1000);
    
        // Call Backend (new_speaker.py) Immediately
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


    return (
        <>
            <div>
                <img src="./public/mom_final.png" alt="MoM_Image" />
            </div>

            <div className="mt-10 flex justify-center space-x-4">
            <button onClick={fetchAudioFiles} className="bg-purple-600 text-white py-4 px-8 my-7 rounded-lg shadow-lg text-xl font-semibold hover:bg-purple-700 transition">
                List Pre-Recorded Audios
            </button>

            <div className="flex flex-col items-center space-y-3">
                {!showSpeakerInput ? (
                    <button
                        onClick={addNewSpeaker}
                        className="bg-orange-600 text-white py-4 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-orange-700 transition"
                    >
                        Add New Speaker
                    </button>
                ) : (
                    <>
                        <input
                            type="text"
                            value={speakerName}
                            onChange={(e) => setSpeakerName(e.target.value)}
                            placeholder="Enter speaker name"
                            className="px-4 py-3 border-2 border-gray-300 rounded-md text-lg w-72"
                        />
                        <button
                            onClick={addNewSpeaker}
                            className="bg-orange-600 text-white py-4 px-8 rounded-lg shadow-lg text-xl font-semibold hover:bg-orange-700 transition"
                            disabled={isRecording}
                        >
                            {isRecording ? "Recording..." : "Add"}
                        </button>
                    </>
                )}

                {/* Instruction Message */}
                {message && <p className="text-gray-700 mt-2 text-lg font-semibold">{message}</p>}

                {/* Show Countdown if Recording */}
                {countdown !== null && (
                    <p className="text-red-500 mt-2 text-lg font-semibold">Recording Starts in ... {countdown}s</p>
                )}
            </div>

            </div>

            {/* Display Pre-Recorded Audio List */}
            {showAudioList && (
                <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-800">Pre-Recorded Audio Files:</h3>
                        <button 
                            onClick={() => setShowAudioList(false)} 
                            className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                        >
                            ✖ Close
                        </button>
                    </div>

                    <ul className="mt-4">
                        {audioFiles.length > 0 ? (
                            audioFiles.map((file, index) => (
                                <li key={index} className="flex items-center justify-between border-b py-2">
                                    <div className="flex items-center space-x-4">
                                        <span className="text-gray-700">{file}</span>
                                        <audio controls>
                                            <source src={`http://localhost:5001/get-audio/${file}`} type="audio/wav" />
                                        </audio>
                                    </div>
                                    <button onClick={() => deleteAudioFile(file)} className="text-red-500 hover:text-red-700 transition">
                                        🗑️
                                    </button>
                                </li>
                            ))
                        ) : (
                            <p className="text-gray-500">No audio files found.</p>
                        )}
                    </ul>
                </div>
            )}



            <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
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

            <div className="mt-10 flex justify-center space-x-4">
                <button onClick={handleGenerateMoM} className="bg-blue-600 text-white py-4 px-12 my-7 rounded-lg shadow-lg text-xl font-semibold hover:bg-blue-700 transform transition hover:scale-110 hover:shadow-xl" disabled={loading}>
                    {loading ? "Generating..." : "Generate MoM"}
                </button>
                <button onClick={openPreview} className="bg-green-600 text-white py-4 px-8 my-7 rounded-lg shadow-lg text-xl font-semibold hover:bg-green-700 transition">Preview</button>
                {pdfURL && (
                    <a href={pdfURL} download className="bg-gray-600 text-white py-4 px-8 my-7 rounded-lg shadow-lg text-xl font-semibold hover:bg-gray-700 transition">
                        Download
                    </a>
                )}
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