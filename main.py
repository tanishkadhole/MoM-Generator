import speaker_diariazation
import transcription
import mom_g

# Function to process video and generate MoM
def process_video(video_path):
    # Step 1: Diarization
    print("Running speaker diarization...")
    diarization_result = speaker_diariazation.diarize_audio(video_path, "speaker_embeddings.npy")

    # Step 2: Transcription
    print("Running transcription...")
    transcription_result = transcription.transcribe_with_speakers(diarization_result, video_path)

    # Step 3: Generate MoM
    print("Generating Minutes of Meeting...")
    mom_text = mom_g.generate_mom(transcription_result)

    # Save the final document
    mom_g.save_mom_as_pdf(mom_text)
    print("Minutes of Meeting document generated successfully.")

# Example usage
if __name__ == "__main__":
    video_path = "test.wav" # Replace with the path to your video file
    process_video(video_path)
