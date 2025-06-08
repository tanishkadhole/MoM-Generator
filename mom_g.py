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

def generate_mom_from_audio_manual(audio_path, attendees, meeting_title, meeting_head, meeting_date, meeting_time):
    # Step 1: Transcription with Diarization
    print("Running transcription with speaker diarization...")
    transcription_result = transcribe_with_speakers(audio_path)
    transcription_text = "\n".join(transcription_result)

    # Step 2: Generate MoM
    mom_text = generate_mom_manual(transcription_text, attendees, meeting_title, meeting_head, meeting_date, meeting_time)

    # Step 3: Save the final document
    pdf_filename = save_mom_as_pdf(mom_text)
    return pdf_filename

def generate_mom_manual(transcription_text, attendees, meeting_title, meeting_head, meeting_date, meeting_time):
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are an AI assistant that generates well-structured Minutes of the Meeting (MoM). Don't include speaker names in the Action Items."},
            {"role": "user", "content": f"Generate minutes of the meeting in the following format:\n\n"
                                         f"Meeting Title: {meeting_title}\n"
                                         f"Meeting Head: {meeting_head}\n"
                                         f"Meeting Date: {meeting_date}\n"
                                         f"Meeting Time: {meeting_time}\n"
                                         f"Attendees: {attendees}\n"
                                         "Key Discussions: \n"
                                         "Decisions Made: \n"
                                         "Action Items: \n"
                                         f"Here is the meeting transcript:\n{transcription_text}"}
        ],
        max_tokens=1024,
        temperature=0.5
    )

    return response.choices[0].message.content

def generate_mom_from_audio_automated(audio_path, attendees, meeting_head):
    # Step 1: Transcription with Diarization
    print("Running transcription with speaker diarization...")
    transcription_result = transcribe_with_speakers(audio_path)
    transcription_text = "\n".join(transcription_result)

    # Use current system date and time
    now = datetime.now()
    meeting_date = now.strftime("%Y-%m-%d")
    meeting_time = now.strftime("%H:%M")

    # Step 2: Generate MoM
    mom_text = generate_mom_automated(transcription_text, attendees, meeting_head, meeting_date, meeting_time)

    # Step 3: Save the final document
    pdf_filename = save_mom_as_pdf(mom_text)
    return pdf_filename

def generate_mom_automated(transcription_text, attendees, meeting_head, meeting_date, meeting_time):
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {"role": "system", "content": "You are an AI assistant that generates well-structured Minutes of the Meeting (MoM). Don't include speaker names in the Action Items."},
            {"role": "user", "content": f"Generate minutes of the meeting in the following format:\n\n"
                                         "Meeting Title: \n"
                                         f"Meeting Head: {meeting_head}\n"
                                         f"Meeting Date: {meeting_date}\n"
                                         f"Meeting Time: {meeting_time}\n"
                                         f"Attendees: {attendees}\n"
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
    pdf_filename = f"MoM_{current_date}.pdf"
    folder_path = "MoM"
    os.makedirs(folder_path, exist_ok=True) 

    filename = os.path.join(folder_path, pdf_filename)

    pdf = FPDF(format='A4', unit='mm')
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()

    # pdf.add_font("ArialUnicode", "", "/System/Library/Fonts/Supplemental/Arial Unicode.ttf", uni=True)  
    # pdf.set_font("ArialUnicode", size=12)
    pdf.set_font("Helvetica", size=12)

    pdf.cell(200, 10, "Minutes of the Meeting", ln=True, align='C')
    pdf.cell(200, 10, f"Date: {datetime.now().strftime('%Y-%m-%d')}", ln=True, align='C')
    pdf.ln(10)

    sections = [
        "Meeting Title:", "Meeting Head:", "Meeting Date:", "Meeting Time:", "Attendees:", "Key Discussions:", "Decisions Made:",
        "Action Items:", "Next Steps:"
    ]

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

    # Add signature placeholders at the bottom
    pdf.set_y(-30)  # Position 30mm from the bottom of the page

    pdf.set_font("Arial", size=12)
    pdf.cell(95, 10, "The Co-ordinator", align='L')
    pdf.cell(0, 10, "Head of the Department", align='R')

    pdf.output(filename)

    print(f"PDF saved as {filename}")

    return pdf_filename
