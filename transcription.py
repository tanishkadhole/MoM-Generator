import whisper
import ffmpeg
import os
from speaker_diariazation import diarize_audio  
from datetime import datetime

# ✅ Load Whisper Model
print("🔄 Loading Whisper model...")
whisper_model = whisper.load_model("base")  
print("✅ Whisper model loaded!")


def transcribe_segment(audio_path, start, end):
    segment_audio = f"temp_segment_{start:.2f}_{end:.2f}.wav"

    try:
        
        ffmpeg.input(audio_path, ss=start, to=end).output(segment_audio, acodec="copy").run(overwrite_output=True, quiet=True)

        
        transcription = whisper_model.transcribe(segment_audio)["text"]
        return transcription

    except Exception as e:
        print(f"❌ Error processing segment ({start:.2f}-{end:.2f}): {e}")
        return "[ERROR]"

    finally:
        # ✅ Cleanup temp file
        if os.path.exists(segment_audio):
            os.remove(segment_audio)

# ✅ Function to Transcribe Full Audio Using Diarization Results
# def transcribe_with_diarization(audio_path):
#     # Step 1: Call the diarization function from the imported script
#     speaker_segments = diarize_audio(audio_path)

#     # Step 2: Process each speaker segment
#     transcript = []
#     for start, end, speaker in speaker_segments:
#         transcribed_text = transcribe_segment(audio_path, start, end)
#         transcript.append(f"{speaker}: {transcribed_text}")

#     return "\n".join(transcript)

def transcribe_with_speakers(audio_path):
    # Step 1: Diarization
    print("Running speaker diarization...")
    diarization_result = diarize_audio(audio_path)

    # Step 2: Transcription
    transcript = []
    for start, end, speaker in diarization_result:
        transcribed_text = transcribe_segment(audio_path, start, end)
        transcript.append(f"{speaker} spoke from {start:.1f} to {end:.1f}: {transcribed_text}")

    return transcript
