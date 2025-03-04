import whisper
import os
import speaker_diarization
import diarizationcopy
from datetime import datetime
import subprocess



# Load Whisper model
model = whisper.load_model("base")

# Transcribe audio segment
def transcribe_segment(audio_path):
    result = model.transcribe(audio_path)
    return result["text"]

# Transcribe with correct speaker names
def transcribe_with_speakers(diarization_result, audio_file, output_txt):
    transcription = []

    for start, end, speaker in diarization_result:
        segment_audio = f"temp_segment_{start:.2f}_{end:.2f}.wav"

        # Extract segment audio
        os.system(f"ffmpeg -i {audio_file} -ss {start} -to {end} -c copy {segment_audio}")

        # Transcribe segment
        text = transcribe_segment(segment_audio)
        transcription.append(f"{speaker}: {text}")

        # Remove temporary file
        os.remove(segment_audio)

        # Save as plain text file
        with open(output_txt, "w") as txt_file:
            txt_file.write("\n".join(transcription))

    return transcription


# print("Loading Whisper model...")
# model = whisper.load_model("base")
# print("Whisper model loaded successfully")

# def extract_segment(audio_file, start, end, output_file):
#     """Extract audio segment using ffmpeg with proper error handling"""
#     try:
#         # Use subprocess instead of os.system for better error handling
#         command = [
#             'ffmpeg',
#             '-i', audio_file,
#             '-ss', str(start),
#             '-to', str(end),
#             '-acodec', 'pcm_s16le',  # Use PCM format for better compatibility
#             '-ar', '16000',  # Set sample rate to 16kHz for Whisper
#             '-ac', '1',      # Convert to mono
#             '-y',            # Overwrite output file if it exists
#             output_file
#         ]
        
#         # Run ffmpeg with stderr redirected to subprocess.PIPE
#         process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
#         _, stderr = process.communicate()
        
#         if process.returncode != 0:
#             print(f"FFmpeg error: {stderr.decode()}")
#             return False
#         return True
#     except Exception as e:
#         print(f"Error extracting segment: {str(e)}")
#         return False

# def transcribe_segment(audio_path):
#     """Transcribe audio segment with error handling"""
#     try:
#         result = model.transcribe(audio_path)
#         return result["text"].strip()
#     except Exception as e:
#         print(f"Error transcribing segment: {str(e)}")
#         return ""

# def transcribe_with_speakers(diarization_result, audio_file, output_txt):
#     """Transcribe audio with speaker diarization and progress tracking"""
#     transcription = []
#     total_segments = len(diarization_result)
    
#     print(f"\nStarting transcription of {total_segments} segments...")
#     start_time = datetime.now()
    
#     for idx, (start, end, speaker) in enumerate(diarization_result, 1):
#         segment_audio = f"temp_segment_{start:.2f}_{end:.2f}.wav"
        
#         # Progress update
#         print(f"\nProcessing segment {idx}/{total_segments} ({(idx/total_segments)*100:.1f}%)")
#         print(f"Speaker: {speaker}, Time: {start:.1f}s to {end:.1f}s")
        
#         # Extract segment audio
#         if not extract_segment(audio_file, start, end, segment_audio):
#             print(f"Skipping segment {idx} due to extraction error")
#             continue
        
#         # Transcribe segment
#         text = transcribe_segment(segment_audio)
#         if text:
#             transcription.append(f"{speaker} ({start:.1f}s - {end:.1f}s): {text}")
            
#             # Save progress incrementally
#             try:
#                 with open(output_txt, "w") as txt_file:
#                     txt_file.write("\n".join(transcription))
#             except Exception as e:
#                 print(f"Error saving transcription: {str(e)}")
        
#         # Clean up temporary file
#         try:
#             os.remove(segment_audio)
#         except Exception as e:
#             print(f"Error removing temporary file: {str(e)}")
        
#         # Calculate and display time remaining
#         elapsed_time = (datetime.now() - start_time).total_seconds()
#         avg_time_per_segment = elapsed_time / idx
#         remaining_segments = total_segments - idx
#         estimated_time_remaining = remaining_segments * avg_time_per_segment
        
#         print(f"Estimated time remaining: {estimated_time_remaining/60:.1f} minutes")
    
#     # Final save
#     try:
#         with open(output_txt, "w") as txt_file:
#             txt_file.write("\n".join(transcription))
#     except Exception as e:
#         print(f"Error saving final transcription: {str(e)}")
    
#     total_time = (datetime.now() - start_time).total_seconds()
#     print(f"\nTranscription completed in {total_time/60:.1f} minutes")
#     return transcription

# Run the transcription
file_path = "test.wav"
embeddings_path = "speaker_embeddings.npy"
output_txt = "transcriptions/trancription.txt"
diarization_result = diarizationcopy.diarize_audio(file_path, embeddings_path)

transcription = transcribe_with_speakers(diarization_result, file_path, output_txt)
print("\n".join(transcription))

# def main():
#     file_path = "test.wav"
#     embeddings_path = "speaker_embeddings.npy"
#     output_txt = "transcriptions/transcription.txt"
    
#     # Ensure output directory exists
#     os.makedirs(os.path.dirname(output_txt), exist_ok=True)
    
#     print("Starting diarization...")
#     diarization_result = speaker_diarization.diarize_audio(file_path, embeddings_path)
    
#     if not diarization_result:
#         print("Diarization failed or returned no results")
#         return
    
#     print(f"Diarization complete. Found {len(diarization_result)} segments")
#     transcription = transcribe_with_speakers(diarization_result, file_path, output_txt)
    
#     print("\nFinal Transcription:")
#     print("\n".join(transcription))

# if __name__ == "__main__":
#     main()