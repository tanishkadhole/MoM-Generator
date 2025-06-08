from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import sys
import mom_g
from datetime import datetime
import subprocess
from new_speaker import add_new_speaker

app = Flask(__name__)
CORS(app)  # Allow frontend requests

UPLOAD_FOLDER = "uploads"
AUDIO_FOLDER = "real_time_recordings"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PDF_FOLDER = "MoM"  # Keep PDFs in the "MoM" folder
os.makedirs(PDF_FOLDER, exist_ok=True)

@app.route("/process-audio-manual", methods=["POST"])
def process_audio_manual():
    try:
        print("🚀 Starting process_audio function...")

        file = request.files.get("audio")
        attendees = request.form.get("attendees")
        meeting_title = request.form.get("meetingTitle", "")
        meeting_head = request.form.get("meetingHead", "")
        meeting_date = request.form.get("meetingDate", "")
        meeting_time = request.form.get("meetingTime", "")

        if not file:
            print("❌ Error: No file uploaded")
            return jsonify({"error": "No file uploaded"}), 400

        audio_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(audio_path)
        print(f"✅ File successfully saved to {audio_path}")

        print("🎯 Generating MoM from audio...")
        try:
            pdf_filename = mom_g.generate_mom_from_audio_manual(audio_path, attendees, meeting_title, meeting_head, meeting_date, meeting_time)
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
    
@app.route("/process-audio-automated", methods=["POST"])
def process_audio_automated():
    try:
        print("🚀 Starting process_audio function...")

        file = request.files.get("audio")
        attendees = request.form.get("attendees")
        meeting_head = request.form.get("meetingHead", "")

        if not file:
            print("❌ Error: No file uploaded")
            return jsonify({"error": "No file uploaded"}), 400

        audio_path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(audio_path)
        print(f"✅ File successfully saved to {audio_path}")

        print("🎯 Generating MoM from audio...")
        try:
            pdf_filename = mom_g.generate_mom_from_audio_automated(audio_path, attendees, meeting_head)
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

@app.route("/list-audio-files", methods=["GET"])
def list_audios():
    try:
        files = [f for f in os.listdir(AUDIO_FOLDER) if f.endswith(".wav")]
        return jsonify({"audios": files})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/get-audio/<filename>")
def get_audio(filename):
    return send_from_directory(AUDIO_FOLDER, filename)

@app.route("/add-speaker", methods=["POST"])
def add_speaker():
    try:
        data = request.get_json()
        speaker_name = data.get("speaker_name")

        if not speaker_name:
            return jsonify({"error": "Speaker name is required"}), 400

        # Call new_speaker.py script with the speaker name
        python_exec = sys.executable  # Uses the correct Python interpreter path
        subprocess.run([python_exec, "new_speaker.py", speaker_name], check=True)

        return jsonify({"message": f"Speaker '{speaker_name}' added successfully!"})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/delete-audio/<filename>", methods=["DELETE"])
def delete_audio(filename):
    file_path = os.path.join(AUDIO_FOLDER, filename)

    if os.path.exists(file_path):
        os.remove(file_path)
        return jsonify({"message": f"{filename} deleted successfully."}), 200
    else:
        return jsonify({"error": "File not found."}), 404
    
if __name__ == "__main__":
    print("✅ Flask server is running and waiting for requests...")
    app.run(debug=False, port=5001)
