import groq
import json
from datetime import datetime
from fpdf import FPDF
import os
from dotenv import load_dotenv
from transcription import transcribe_with_speakers

# Load environment variables from .env file
load_dotenv()

# Get the API key from environment variable
api_key = os.getenv("GROQ_API_KEY")

client = groq.Client(api_key=api_key)

def generate_mom_from_audio(audio_path):
    # Step 1: Transcription with Diarization
    print("Running transcription with speaker diarization...")
    transcription_result = transcribe_with_speakers(audio_path)
    transcription_text = "\n".join(transcription_result)

    # Step 2: Generate MoM
    mom_text = generate_mom(transcription_text)

    # Step 3: Save the final document
    save_mom_as_pdf(mom_text)

def generate_mom(transcription_text):
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are an AI assistant that generates well-structured Minutes of the Meeting (MoM).Dont include speaker names in the Action Items."},
            {"role": "user", "content": f"Generate minutes of the meeting in the following format:\n\n"
                                         "Meeting Title: \n"
                                         "Agenda: \n"
                                         "Key Discussions: \n"
                                         "Decisions Made: \n"
                                         "Action Items: \n"
                                         f"Here is the meeting transcript:\n{transcription_text}"}
        ],
        max_tokens=1024,
        temperature=0.5
    )

    return response.choices[0].message.content

def save_mom_as_pdf(mom_text):
    current_date = datetime.now().strftime('%Y-%m-%d_%H-%M-%S')
    folder_path = "MoM"
    os.makedirs(folder_path, exist_ok=True) 

    filename = os.path.join(folder_path, f"MoM_{current_date}.pdf")

    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, "Minutes of the Meeting", ln=True, align='C')
    pdf.cell(200, 10, f"Date: {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='C')
    pdf.ln(10)

    sections = ["Meeting Title:", "Agenda:", "Key Discussions:", "Decisions Made:", "Action Items:", "Next Steps:"]
    lines = mom_text.split("\n")

    for line in lines:
        # Remove asterisks from the line
        line = line.replace('*', '')
        if any(line.startswith(section) for section in sections):
            pdf.set_font("Arial", style="B", size=12)  # Bold for headings
        else:
            pdf.set_font("Arial", size=12)  # Regular text
        pdf.multi_cell(0, 10, line)
        pdf.ln(2)

    pdf.output(filename)
    print(f"PDF saved as {filename}")

    return filename