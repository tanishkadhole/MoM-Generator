import React, { useState } from "react";

export default function Home() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleFileUpload = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleGenerateMoM = async () => {
        if (!selectedFile) {
            alert("Please select a file first!");
            return;
        }

        setLoading(true);
        setMessage("");

        const formData = new FormData();
        formData.append("audio", selectedFile);

        try {

            const response = await fetch("http://localhost:5001/process-audio", {
                method: "POST",
                body: formData
            });

            const data = await response.json();
            if (response.ok) {
                console.log("✅ MoM Generated Successfully", data.pdf_url);

                // Trigger automatic download
                const downloadLink = document.createElement("a");
                downloadLink.href = `http://localhost:5001${data.pdf_url}`;
                downloadLink.setAttribute("download", ""); // Hint to browser to download
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
        <div className="mx-auto w-full max-w-7xl p-6">
            {/* Hero Section */}
            <div className="bg-white">
                <img src="./public/mom_final.png" alt="MoM_Image" />
            </div>

            {/* Upload & Generate Section */}
            <div className="h-screen flex items-center justify-center bg-gray-100">
                <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-6">Upload Your File</h2>

                    {/* Custom File Upload Button */}
                    <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 text-gray-700 py-3 px-6 rounded-lg inline-block transition">
                        Select File
                        <input 
                            type="file" 
                            onChange={handleFileUpload} 
                            className="hidden"
                        />
                    </label>

                    {/* Show Selected File Name */}
                    {selectedFile && (
                        <p className="text-gray-600 mt-3 text-sm">📄 {selectedFile.name}</p>
                    )}

                    {/* Generate MoM Button */}
                    <button 
                        onClick={handleGenerateMoM}
                        className="mt-6 bg-blue-600 text-white py-3 px-10 rounded-lg shadow-md hover:bg-blue-700 transition-all"
                        disabled={loading}
                    >
                        {loading ? "Generating..." : "Generate MoM"}
                    </button>

                    {/* Display message */}
                    {message && <p className="mt-4 text-gray-700">{message}</p>}
                </div>
            </div>
        </div>
    );
}