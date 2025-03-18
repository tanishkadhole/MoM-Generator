from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import mom_g  # Importing mom_g module which contains MoM generation functions
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Allow frontend requests

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PDF_FOLDER = "MoM"  # Keep PDFs in the "MoM" folder
os.makedirs(PDF_FOLDER, exist_ok=True)

@app.route("/process-audio", methods=["POST"])
def process_audio():
    try:
        print("🚀 Starting process_audio function...")

        file = request.files.get("audio")
        attendees = request.form.get("attendees")

        if not file:
            print("❌ Error: No file uploaded")
            return jsonify({"error": "No file uploaded"}), 400

        audio_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(audio_path)
        print(f"✅ File successfully saved to {audio_path}")

        print("🎯 Generating MoM from audio...")
        try:
            pdf_filename = mom_g.generate_mom_from_audio(audio_path, attendees)
            pdf_path = os.path.join(PDF_FOLDER, pdf_filename)

            print(f"✅ MoM successfully generated: {pdf_path}")

            return jsonify({
                "message": "MoM Generated Successfully",
                "pdf_url": f"/preview/{pdf_filename}"  # preview endpoint
            })

        except Exception as e:
            print(f"❌ Error generating MoM: {str(e)}")
            return jsonify({"error": str(e)}), 500

    except Exception as e:
        print(f"❌ Fatal error in process_audio: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/preview/<filename>")
def preview_file(filename):
    """Serve the PDF for preview in the browser."""
    return send_from_directory(PDF_FOLDER, filename)  # Opens PDF in browser


@app.route("/download/<filename>")
def download_file(filename):
    """Force the PDF to download."""
    return send_from_directory(PDF_FOLDER, filename, as_attachment=True)


if __name__ == "__main__":
    print("✅ Flask server is running and waiting for requests...")
    app.run(debug=False, port=5001)
