import React, { useState, useRef } from "react";

export default function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [audioURL, setAudioURL] = useState(null);
    const [attendees, setAttendees] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // Handle File Upload
    const handleFileUpload = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    // Start Recording
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

    // Stop Recording
    const stopRecording = () => {
        setRecording(false);
        mediaRecorderRef.current.stop();
    };

    // Handle Generate MoM
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
            formData.append("audio", audioBlob, "recorded_audio.wav");
        }
        formData.append("attendees", attendees); // This line is already correct

        try {
            const response = await fetch("http://localhost:5001/process-audio", {
                method: "POST",
                body: formData
            });

            const data = await response.json();

            if (response.ok) {
                console.log("✅ MoM Generated Successfully", data.pdf_url);

                // Auto-download MoM PDF
                const downloadLink = document.createElement("a");
                downloadLink.href = `http://localhost:5001${data.pdf_url}`;
                downloadLink.setAttribute("download", "");
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            }
            setMessage(data.message || "Error generating MoM");
        } catch (error) {
            console.error("Error:", error);
            setMessage("Failed to generate MoM");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Hero Section */}
            <div>
                <img src="./public/mom_final.png" alt="MoM_Image" />
            </div>

            {/* Content Section */}
            <div className="max-w-6xl mx-auto px-6 mt-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10">
                {/* Upload File */}
                <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 text-center flex flex-col items-center w-full h-60">
                    <h2 className="text-2xl font-semibold text-[#152c39] mb-4">Upload Your File</h2>
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-8 rounded-lg transition text-lg">
                        Select File
                        <input type="file" onChange={handleFileUpload} className="hidden" />
                    </label>
                    {selectedFile && <p className="text-gray-600 mt-3 text-lg">📄 {selectedFile.name}</p>}
                </div>

                {/* Record Audio */}
                <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 text-center flex flex-col items-center w-full h-60">
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

                {/* Enter Attendee Names */}
                <div className="bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition transform hover:-translate-y-2 text-center flex flex-col items-center w-full h-60">
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

            {/* Generate MoM Button */}
            <div className="mt-10 flex justify-center">
    <button 
        onClick={handleGenerateMoM}
        className="bg-blue-600 text-white py-4 px-12 my-7 rounded-lg shadow-lg text-xl font-semibold hover:bg-blue-700 transform transition hover:scale-110 hover:shadow-xl"
        disabled={loading}
    >
        {loading ? "Generating..." : "Generate MoM"}
    </button>
</div>


            {/* Display message */}
            {message && <p className="text-gray-700 mt-6 text-center text-lg">{message}</p>}
        </>
    )};