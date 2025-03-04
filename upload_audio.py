from flask import Flask, request, render_template, jsonify
from werkzeug.utils import secure_filename
from pydub import AudioSegment
import os

from pydub import AudioSegment
AudioSegment.converter = "/opt/homebrew/bin/ffmpeg"

# Flask app configuration
app = Flask(__name__)
UPLOAD_FOLDER = "uploaded_audios"
ALLOWED_EXTENSIONS = {"wav", "mp3"}

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Check if the file format is valid
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

# Preprocess the audio file (convert to mono and normalize volume)
def preprocess_audio(file_path):
    audio = AudioSegment.from_file(file_path)
    audio = audio.set_channels(1)  # Convert to mono
    audio = audio.normalize()  # Normalize volume
    preprocessed_path = os.path.splitext(file_path)[0] + "_processed.wav"
    audio.export(preprocessed_path, format="wav")  # Save as WAV
    return preprocessed_path

# Home route for file upload
@app.route("/", methods=["GET", "POST"])
def upload_file():
    if request.method == "POST":
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
            file.save(file_path)

            # Preprocess the audio file
            preprocessed_path = preprocess_audio(file_path)

            return jsonify({
                "message": "File uploaded and processed successfully",
                "original_file": file_path,
                "preprocessed_file": preprocessed_path
            })

        else:
            return jsonify({"error": "Invalid file format. Only .wav and .mp3 are allowed"}), 400

    return '''
    <!doctype html>
    <title>Upload Audio File</title>
    <h1>Upload Audio File for Processing</h1>
    <form method="post" enctype="multipart/form-data">
      <input type="file" name="file">
      <input type="submit" value="Upload">
    </form>
    '''

# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
