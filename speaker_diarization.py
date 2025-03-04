from pyannote.audio import Pipeline
import identify_speaker
import os
import torch
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the Hugging Face auth token from environment variable
auth_token = os.getenv("HUGGING_FACE_AUTH_TOKEN")

print(torch.backends.mps.is_available())

model = Pipeline.from_pretrained(
    "pyannote/speaker-diarization@2.1",
    use_auth_token=auth_token
)

#model = torch.compile(model)

def diarize_audio(file_path, embeddings_path):
    diarization = model(file_path)

    # Map generic speaker IDs to actual names
    speaker_mapping = {}
    updated_segments = []

    for turn, _, speaker in diarization.itertracks(yield_label=True):
        #start, end = turn.start, turn.end
        start, end = max(0, turn.start - 0.5), turn.end + 0.5  # Add buffer
        segment_audio = f"temp_segment_{start:.2f}_{end:.2f}.wav"

        # Extract segment audio for speaker identification
        os.system(f"ffmpeg -i {file_path} -ss {start} -to {end} -c copy {segment_audio}")

        if speaker not in speaker_mapping:
            speaker_mapping[speaker] = identify_speaker.identify_speaker(segment_audio, embeddings_path)

        actual_speaker = speaker_mapping[speaker]
        updated_segments.append((start, end, actual_speaker))

        os.remove(segment_audio)  # Cleanup extracted audio

    return updated_segments

file_path = "test.wav" 
embeddings_path = "speaker_embeddings.npy"
diarization = diarize_audio(file_path, embeddings_path)

for start, end, speaker in diarization:
    print(f"{speaker} spoke from {start:.1f} to {end:.1f}")