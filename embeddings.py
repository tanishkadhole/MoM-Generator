import os
import numpy as np
import torchaudio
from pyannote.audio import Inference
from pyannote.audio import Model
import torch


device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
embedding_model = Inference("pyannote/embedding", device=device)

def extract_speaker_embedding(file_path):
    waveform, sample_rate = torchaudio.load(file_path)
    waveform = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)(waveform)

    # Convert to mono
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    # Move waveform to the correct device
    waveform = waveform.to(device)

    # Process waveform
    input_data = {"waveform": waveform, "sample_rate": sample_rate}
    embedding = embedding_model(input_data)  # Returns SlidingWindowFeature

    # ✅ Convert SlidingWindowFeature to NumPy
    embedding_array = np.array(embedding.data)  # Extract actual data

    # ✅ Ensure correct shape (512,)
    if embedding_array.ndim > 1:
        embedding_array = embedding_array.mean(axis=0)  # Average multiple embeddings

    return embedding_array[:512]  # Trim to 512 dims



def save_pre_recorded_embeddings(pre_recorded_dir, output_path):
    embeddings = {}
    for file_name in os.listdir(pre_recorded_dir):
        if file_name.endswith(".wav"):
            speaker_name = os.path.splitext(file_name)[0]
            file_path = os.path.join(pre_recorded_dir, file_name)
            
            embedding = extract_speaker_embedding(file_path)

            if embedding.shape[0] != 512:  # Ensure 512-dim embeddings
                print(f"⚠️ Warning: {speaker_name} embedding shape {embedding.shape}, fixing...")
                embedding = embedding[:512]  # Trim if needed

            embeddings[speaker_name] = embedding  # Store the corrected embedding
            print(f"✅ Extracted embedding for: {speaker_name}, shape: {embedding.shape}")

    np.save(output_path, embeddings, allow_pickle=True)
    print(f"📂 Saved embeddings to {output_path}")


pre_recorded_dir = "real_time_recordings/"
output_path = "speaker_embeddings.npy"
save_pre_recorded_embeddings(pre_recorded_dir, output_path)