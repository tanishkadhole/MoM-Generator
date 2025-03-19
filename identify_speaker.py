import numpy as np
import torchaudio
from pyannote.audio import Inference
from scipy.spatial.distance import cosine
import torch
import embeddings
import os

# pyannote embedding model
embedding_model = Inference("pyannote/embedding", device="cuda" if torch.cuda.is_available() else "cpu")

from scipy.spatial.distance import cosine
import numpy as np

def identify_speaker(audio_segment, embeddings_path, confidence_threshold=0.5):
    """Identifies the speaker by comparing the extracted embedding with stored embeddings."""

    # Load stored speaker embeddings
    try:
        saved_embeddings = np.load(embeddings_path, allow_pickle=True).item()
    except Exception as e:
        print(f"❌ Error loading embeddings: {e}")
        return "Unknown"

    unknown_embedding = embeddings.extract_speaker_embedding(audio_segment)

    if unknown_embedding.shape[0] != 512:
        print(f"⚠️ Warning: Extracted embedding has shape {unknown_embedding.shape}, fixing...")
        unknown_embedding = unknown_embedding[:512]  # Trim if needed

    best_match = None
    best_score = float("inf")

    for speaker, ref_embedding in saved_embeddings.items():
        if ref_embedding.shape[0] != 512:
            print(f"⚠️ Warning: {speaker}'s stored embedding shape {ref_embedding.shape}, fixing...")
            ref_embedding = ref_embedding[:512]  # Trim if needed

        score = cosine(unknown_embedding, ref_embedding)

        if score < best_score:
            best_match = speaker
            best_score = score

    print(f"🔍 Best match: {best_match} (Score: {best_score:.2f})")

    # ✅ Keep only **high-confidence** speakers
    return best_match if best_score <= confidence_threshold else "Unknown Speaker"

