from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import mom_g  # Importing mom_g module which contains MoM generation functions

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
        if not file:
            print("❌ Error: No file uploaded")
            return jsonify({"error": "No file uploaded"}), 400

        print("💾 Saving file...")
        try:
            audio_path = os.path.join(UPLOAD_FOLDER, file.filename)
            file.save(audio_path)
            print(f"✅ File successfully saved to {audio_path}")
        except Exception as e:
            print(f"❌ Error saving file: {str(e)}")
            raise

        print("🎯 Generating MoM from audio...")
        try:
            mom_text = mom_g.generate_mom_from_audio(audio_path)
            print("✅ MoM successfully generated")
        except Exception as e:
            print(f"❌ Error generating MoM: {str(e)}")
            raise

        print("📄 Saving MoM as PDF...")
        try:
            pdf_path = os.path.join(PDF_FOLDER, f"{file.filename}.pdf")
            mom_g.save_mom_as_pdf(mom_text)
            print(f"✅ PDF successfully saved to {pdf_path}")
        except Exception as e:
            print(f"❌ Error saving PDF: {str(e)}")
            raise

        return jsonify({"message": "MoM Generated Successfully", "pdf_path": pdf_path})

    except Exception as e:
        print(f"❌ Fatal error in process_audio: {str(e)}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=False, port=5000)