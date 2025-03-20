import os
import sounddevice as sd
import soundfile as sf
from scipy.io.wavfile import write
from pyannote.audio.pipelines.speaker_verification import PretrainedSpeakerEmbedding
import pickle
import torch
import numpy as np
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get the Hugging Face auth token from environment variable
auth_token = os.getenv("HUGGING_FACE_AUTH_TOKEN")

model = PretrainedSpeakerEmbedding(
    "pyannote/embedding", use_auth_token=auth_token
)


RECORDED_DIR = "real_time_recordings"
os.makedirs(RECORDED_DIR, exist_ok=True)


EMBEDDINGS_FILE = "speaker_embeddings.npy"


model = PretrainedSpeakerEmbedding(
    "pyannote/embedding", device="cuda" if torch.cuda.is_available() else "cpu"
)

def record_audio(file_path, duration=5, sample_rate=16000):
    
    print(f"Recording for {duration} seconds...")
    audio = sd.rec(int(duration * sample_rate), samplerate=sample_rate, channels=1, dtype="int16")
    sd.wait()  
    write(file_path, sample_rate, audio)
    print(f"Recording saved to {file_path}")


def extract_embedding(audio_file):
    
    waveform, sample_rate = sf.read(audio_file)

    
    waveform_tensor = torch.tensor(waveform, dtype=torch.float32).unsqueeze(0)

    
    waveform_tensor = waveform_tensor.to(model.device)

    
    embedding = model(waveform_tensor)

    
    if isinstance(embedding, torch.Tensor):
        
        return embedding.detach().cpu().numpy()
    elif isinstance(embedding, np.ndarray):
        return embedding
    else:
        raise ValueError("Unexpected embedding type: {}".format(type(embedding)))


def save_speaker_embedding(speaker_name, embedding):
    """Saves speaker embeddings safely."""
    
    # Check if embeddings file exists
    if os.path.exists(EMBEDDINGS_FILE):
        try:
            with open(EMBEDDINGS_FILE, "rb") as f:
                embeddings = pickle.load(f)
        except (EOFError, pickle.UnpicklingError):  # Handle empty/corrupt files
            print("Warning: Embeddings file is corrupted. Resetting it.")
            embeddings = {}
    else:
        embeddings = {}

    # Add new speaker embedding
    embeddings[speaker_name] = embedding

    # Save back safely
    with open(EMBEDDINGS_FILE, "wb") as f:
        pickle.dump(embeddings, f)

    print(f"Saved embedding for speaker: {speaker_name}")




def add_new_speaker(speaker_name, duration=5):
    """Record audio for a new speaker and save their embedding."""
    audio_file = os.path.join(RECORDED_DIR, f"{speaker_name}.wav")
    record_audio(audio_file, duration=duration)
    save_speaker_embedding(speaker_name, audio_file)



if __name__ == "__main__":
    speaker_name = input("Enter the name of the speaker: ")
    add_new_speaker(speaker_name)
