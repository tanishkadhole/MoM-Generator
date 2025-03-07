from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import mom_g  # Importing mom_g module which contains MoM generation functions
from datetime import datetime
from flask import send_from_directory

app = Flask(__name__)
CORS(app)  # Allow frontend requests

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PDF_FOLDER = "pdfs"
os.makedirs(PDF_FOLDER, exist_ok=True)

@app.route("/process-audio", methods=["POST"])
def process_audio():
    try:
        print("🚀 Starting process_audio function...")
        
        print("📂 Checking for uploaded file...")
        file = request.files.get("audio")
        attendees = request.form.get("attendees")  # Retrieve attendees from the form data
        if not file:
            print("❌ Error: No file uploaded")
            return jsonify({"error": "No file uploaded"}), 400

        print("💾 Saving file...")
        audio_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(audio_path)
        print(f"✅ File successfully saved to {audio_path}")

        print("🎯 Generating MoM from audio...")
        try:
            mom_g.generate_mom_from_audio(audio_path, attendees)  # Pass attendees to the function
            print(f"✅ MoM successfully generated")  
        except Exception as e:
            print(f"❌ Error generating MoM: {str(e)}")
            raise

        pdf_filename = f"MoM_{datetime.now().strftime('%Y-%m-%d_%H-%M-%S')}.pdf"
        pdf_path = os.path.join("MoM", pdf_filename)

        return jsonify({"message": "MoM Generated Successfully", "pdf_url": f"/download/{pdf_filename}"})

    except Exception as e:
        print(f"❌ Fatal error in process_audio: {str(e)}")
        return jsonify({"error": str(e)}), 500


@app.route("/download/<filename>")
def download_file(filename):
    return send_from_directory("MoM", filename, as_attachment=True)

if __name__ == "__main__":
    print("✅ Flask server is running and waiting for requests...")
    app.run(debug=False, port=5001)