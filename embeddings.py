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

    # Mono audio
    if waveform.shape[0] > 1:
        waveform = waveform.mean(dim=0, keepdim=True)

    # Move waveform to the correct device (same as the model)
    waveform = waveform.to(device)

    input_data = {"waveform": waveform, "sample_rate": sample_rate}

    embedding = embedding_model(input_data)

    return embedding.data.flatten()


# def extract_speaker_embedding(file_path):
#     """Extract a 512-dimensional speaker embedding from an audio file."""
#     waveform, sample_rate = torchaudio.load(file_path)
    
#     # Convert to mono if necessary
#     if waveform.shape[0] > 1:
#         waveform = waveform.mean(dim=0, keepdim=True)
    
#     # Move to correct device
#     waveform = waveform.to(device)
    
#     # Create input dictionary
#     input_data = {"waveform": waveform, "sample_rate": sample_rate}
    
#     # Get embedding
#     embedding = embedding_model(input_data)
    
#     # Convert SlidingWindowFeature to numpy array
#     embedding_np = embedding.data
    
#     # If we have multiple segments, take the mean
#     if len(embedding_np.shape) > 1:
#         embedding_np = np.mean(embedding_np, axis=0)
    
#     # Ensure we have a 512-dimensional vector
#     if embedding_np.size != 512:
#         raise ValueError(f"Expected 512-dimensional embedding, got {embedding_np.size}")
    
#     return embedding_np.flatten()


def save_pre_recorded_embeddings(pre_recorded_dir, output_path):
    embeddings = {}
    for file_name in os.listdir(pre_recorded_dir):
        if file_name.endswith(".wav"):
            speaker_name = os.path.splitext(file_name)[0]
            file_path = os.path.join(pre_recorded_dir, file_name)
            embedding = extract_speaker_embedding(file_path)
            embeddings[speaker_name] = np.array(embedding).flatten()  # Ensure (512,) shape
            
            #embeddings[speaker_name] = extract_speaker_embedding(file_path)
            print(f"Extracted embedding for: {speaker_name}, shape: {embeddings[speaker_name].shape}")

    np.save(output_path, embeddings, allow_pickle=True)
    print(f"Saved embeddings to {output_path}")

# def save_pre_recorded_embeddings(pre_recorded_dir, output_path):
#     """Save embeddings for pre-recorded speaker samples."""
#     embeddings = {}
#     for file_name in os.listdir(pre_recorded_dir):
#         if file_name.endswith(".wav"):
#             speaker_name = os.path.splitext(file_name)[0]
#             file_path = os.path.join(pre_recorded_dir, file_name)
#             try:
#                 embedding = extract_speaker_embedding(file_path)
#                 embeddings[speaker_name] = embedding
#                 print(f"Extracted embedding for: {speaker_name}, shape: {embedding.shape}")
#             except Exception as e:
#                 print(f"Error processing {speaker_name}: {str(e)}")
#                 continue
    
#     if embeddings:
#         np.save(output_path, embeddings, allow_pickle=True)
#         print(f"Saved embeddings to {output_path}")
#     else:
#         print("No embeddings were successfully extracted")


pre_recorded_dir = "real_time_recordings/"
output_path = "speaker_embeddings.npy"
save_pre_recorded_embeddings(pre_recorded_dir, output_path)
