import numpy as np
import torchaudio
from pyannote.audio import Inference
from scipy.spatial.distance import cosine
import torch
import embeddings
import os

# pyannote embedding model
embedding_model = Inference("pyannote/embedding", device="cuda" if torch.cuda.is_available() else "cpu")

def identify_speaker(unknown_audio_path, embeddings_path):
    pre_recorded_embeddings = np.load(embeddings_path, allow_pickle=True).item()

    unknown_embedding = embeddings.extract_speaker_embedding(unknown_audio_path)

    # Aggregate embeddings for better accuracy
    num_segments = len(unknown_embedding) // 512  # Divide into 512-dim chunks
    avg_embedding = np.mean(unknown_embedding.reshape(num_segments, 512), axis=0)

    # Closest match using cosine similarity
    closest_speaker = None
    min_distance = float("inf")
    for speaker_name, embedding in pre_recorded_embeddings.items():
        print(f"Unknown embedding shape: {unknown_embedding.shape}")
        print(f"Stored embedding shape: {embedding.shape}")

        distance = cosine(unknown_embedding, embedding)
        if distance < min_distance:
            min_distance = distance
            closest_speaker = speaker_name

    print(f"Identified speaker: {closest_speaker} (distance: {min_distance:.4f})")
    return closest_speaker


# def identify_speaker(unknown_audio_path, embeddings_path, threshold=0.8):
#     """Identify speaker from unknown audio using pre-recorded embeddings."""
#     try:
#         pre_recorded_embeddings = np.load(embeddings_path, allow_pickle=True).item()
#         unknown_embedding = embeddings.extract_speaker_embedding(unknown_audio_path)
        
#         closest_speaker = None
#         min_distance = float("inf")
        
#         for speaker_name, embedding in pre_recorded_embeddings.items():
#             distance = cosine(unknown_embedding, embedding)
#             print(f"Distance from {speaker_name}: {distance:.4f}")
            
#             if distance < min_distance:
#                 min_distance = distance
#                 closest_speaker = speaker_name
        
#         # Only return a speaker if the confidence is high enough
#         if min_distance < threshold:
#             print(f"Identified speaker: {closest_speaker} (distance: {min_distance:.4f})")
#             return closest_speaker
#         else:
#             print(f"No speaker identified with confidence (min distance: {min_distance:.4f})")
#             return "unknown_speaker"
            
#     except Exception as e:
#         print(f"Error in speaker identification: {str(e)}")
#         return "unknown_speaker"

unknown_audio_path = "unknown.wav"
embeddings_path = "speaker_embeddings.npy"
identify_speaker(unknown_audio_path, embeddings_path)
