import os
import torch
import ffmpeg
from pyannote.audio import Pipeline
from concurrent.futures import ThreadPoolExecutor  # Parallel processing
import itertools
from dotenv import load_dotenv
from identify_speaker import identify_speaker
import json
import torchaudio

# Load environment variables from .env file
load_dotenv()

# Get the Hugging Face auth token from environment variable
auth_token = os.getenv("HUGGING_FACE_AUTH_TOKEN")

print("🔍 Checking GPU acceleration...")
use_mps = torch.backends.mps.is_available()
print(f"✅ MPS (GPU Acceleration) Available: {use_mps}")


print("🔄 Loading Pyannote diarization model...")
model = Pipeline.from_pretrained(
    "pyannote/speaker-diarization@2.1",
    use_auth_token=auth_token
)
#device = torch.device("mps") if use_mps else torch.device("cpu")
# Determine the device to use: MPS, CUDA, or CPU
if torch.backends.mps.is_available():
    device = torch.device("mps")
elif torch.cuda.is_available():
    device = torch.device("cuda")
else:
    device = torch.device("cpu")
model.to(device)
print("✅ Pyannote model loaded!")


def extract_audio_segment(audio_path, start_time, end_time, output_path="temp_segment.wav"):
    """
    Extracts a segment of audio from start_time to end_time and saves it as a separate file.
    """
    waveform, sample_rate = torchaudio.load(audio_path)

    # Resample to 16kHz for consistency
    if sample_rate != 16000:
        waveform = torchaudio.transforms.Resample(orig_freq=sample_rate, new_freq=16000)(waveform)
        sample_rate = 16000  # Update sample rate
    
    # Convert start and end time to sample indices
    start_sample = int(start_time * sample_rate)
    end_sample = int(end_time * sample_rate)

    # Extract the segment
    segment_waveform = waveform[:, start_sample:end_sample]

    # Save the extracted segment
    torchaudio.save(output_path, segment_waveform, sample_rate)
    
    return output_path


def convert_to_wav(input_path, output_path="uploads/converted_audio.wav"):
    print("🔄 Converting audio to PCM WAV (16-bit, 16kHz, mono)...")
    try:
        ffmpeg.input(input_path).output(output_path, acodec="pcm_s16le", ar=16000, ac=1).run(overwrite_output=True, quiet=True)
        print(f"✅ Conversion complete: {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Error converting audio: {e}")
        return None


def split_audio(file_path, chunk_length=30, overlap=10):
    print(f"✂️ Splitting audio into {chunk_length}s chunks with {overlap}s overlap...")
    
    os.makedirs("chunks", exist_ok=True)
    
    # Load the full audio
    waveform, sample_rate = torchaudio.load(file_path)
    
    # Convert chunk & overlap duration to samples
    chunk_size = chunk_length * sample_rate
    overlap_size = overlap * sample_rate
    step_size = chunk_size - overlap_size  # Step size to move the window
    
    total_samples = waveform.shape[1]
    
    chunk_files = []
    start_sample = 0
    chunk_index = 0

    while start_sample < total_samples:
        end_sample = min(start_sample + chunk_size, total_samples)

        # Extract segment
        chunk_waveform = waveform[:, start_sample:end_sample]

        # Save chunk
        chunk_path = f"chunks/chunk_{chunk_index:03d}.wav"
        torchaudio.save(chunk_path, chunk_waveform, sample_rate)
        chunk_files.append(chunk_path)

        # Move to the next chunk position
        start_sample += step_size
        chunk_index += 1

    print(f"✅ {len(chunk_files)} overlapping chunks created!")
    return chunk_files


def diarize_chunk(chunk_path, file_path, embeddings_path="./speaker_embeddings.npy"):
    print(f"🎵 Processing chunk: {chunk_path}")

    try:
        diarization = model(chunk_path)
        probe = ffmpeg.probe(file_path)
        print(f"🧐 ffmpeg.probe output: {json.dumps(probe, indent=2)}")

        audio_length = float(probe["format"].get("duration", 0))
        if audio_length == 0:
            raise ValueError("Audio duration is 0, possible invalid file.")
        
    except Exception as e:
        print(f"❌ Error processing {chunk_path}: {e}")
        return []

    updated_segments = []

    chunk_number = int(os.path.basename(chunk_path).split("_")[-1].split(".")[0])  
    chunk_offset = chunk_number * 30  

    for turn, _, speaker in diarization.itertracks(yield_label=True):
        start = min(turn.start + chunk_offset, audio_length)
        end = min(turn.end + chunk_offset, audio_length)

        if start < end:  # Ensure valid segments
            segment_audio = extract_audio_segment(chunk_path, turn.start, turn.end)  # Extract only the speaker's part
            speaker_name = identify_speaker(segment_audio, embeddings_path)  # Identify each speaker separately
            
            updated_segments.append((start, end, speaker_name))

    return updated_segments


def merge_overlapping_segments(diarization_result):
    
    diarization_result.sort(key=lambda x: x[0])

    merged_segments = []
    
    for key, group in itertools.groupby(diarization_result, key=lambda x: x[2]):  
        grouped_segments = list(group)
        
        merged_start, merged_end = grouped_segments[0][0], grouped_segments[0][1]
        
        for i in range(1, len(grouped_segments)):
            start, end, current_speaker = grouped_segments[i]  

            # ✅ Prevent merging different speakers
            if key != current_speaker or start > merged_end + 0.5:
                merged_segments.append((merged_start, merged_end, key))  
                merged_start, merged_end = start, end  
            else:
                merged_end = max(merged_end, end)  

        if not merged_segments or merged_segments[-1] != (merged_start, merged_end, key):
            merged_segments.append((merged_start, merged_end, key))

    return merged_segments


def diarize_audio(file_path, embeddings_path='./speaker_embeddings.npy'):
    print("🎤 Running diarization on all chunks in parallel...")

    file_path = convert_to_wav(file_path)
    chunk_paths = split_audio(file_path, chunk_length=30, overlap=10)

    print("🔍 Processing these chunks:")
    for chunk in chunk_paths:
        print(chunk)

    results = []
    with ThreadPoolExecutor(max_workers=2) as executor:
        chunk_results = list(executor.map(lambda chunk: diarize_chunk(chunk, file_path, embeddings_path), chunk_paths))
        results.extend(chunk_results)

    final_segments = sorted([seg for res in results for seg in res])
    cleaned_segments = merge_overlapping_segments(final_segments)

    # Print the final speaker diarization results
    print("\n🎤 **Final Speaker Diarization Results (Merged & Cleaned):**")
    for start, end, speaker in sorted(cleaned_segments):
        if speaker != "Unknown Speaker":
            print(f"{speaker} spoke from {start:.1f} to {end:.1f}")

    return cleaned_segments