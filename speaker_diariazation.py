import os
import torch
import ffmpeg
from pyannote.audio import Pipeline
from concurrent.futures import ThreadPoolExecutor  # Parallel processing
import itertools
from dotenv import load_dotenv
import json

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


def convert_to_wav(input_path, output_path="uploads/converted_audio.wav"):
    print("🔄 Converting audio to PCM WAV (16-bit, 16kHz, mono)...")
    try:
        ffmpeg.input(input_path).output(output_path, acodec="pcm_s16le", ar=16000, ac=1).run(overwrite_output=True, quiet=True)
        print(f"✅ Conversion complete: {output_path}")
        return output_path
    except Exception as e:
        print(f"❌ Error converting audio: {e}")
        return None


def split_audio(file_path, chunk_length=30):
    print("✂️ Splitting audio into 30s chunks...")
    os.makedirs("chunks", exist_ok=True)
    os.system(f"ffmpeg -i {file_path} -f segment -segment_time {chunk_length} -c copy chunks/chunk_%03d.wav")
    chunk_files = sorted([os.path.join("chunks", f) for f in os.listdir("chunks") if f.endswith(".wav")])
    if not chunk_files:
        print("❌ No chunks were created! Check audio file format.")
    print(f"✅ {len(chunk_files)} chunks created!")
    return chunk_files
    #return sorted([os.path.join("chunks", f) for f in os.listdir("chunks") if f.endswith(".wav")])


import ffmpeg

def diarize_chunk(chunk_path, file_path):
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

    # Extract chunk number from file name to calculate actual start time
    chunk_number = int(os.path.basename(chunk_path).split("_")[-1].split(".")[0])  # Extract chunk number
    chunk_offset = chunk_number * 30  # Each chunk is 30s long

    # for turn, _, speaker in diarization.itertracks(yield_label=True):
    #     start = turn.start + chunk_offset  # Adjust start time with chunk offset
    #     end = turn.end + chunk_offset  # Adjust end time with chunk offset
    #     print(f"🔍 {speaker} spoke from {start:.1f} to {end:.1f}")  # Debugging

    #     updated_segments.append((start, end, speaker))
    
    for turn, _, speaker in diarization.itertracks(yield_label=True):
        start = min(turn.start + chunk_offset, audio_length)  # ✅ Trim to max audio length
        end = min(turn.end + chunk_offset, audio_length)  # ✅ Trim to max audio length
        
        if start < end:  # Ensure valid segments
            updated_segments.append((start, end, speaker))

    return updated_segments


def merge_overlapping_segments(diarization_result):
    
    diarization_result.sort(key=lambda x: x[0])

    merged_segments = []
    
    for key, group in itertools.groupby(diarization_result, key=lambda x: x[2]):  
        grouped_segments = list(group)

        
        merged_start, merged_end = grouped_segments[0][0], grouped_segments[0][1]
        
        for i in range(1, len(grouped_segments)):
            start, end = grouped_segments[i][0], grouped_segments[i][1]

            
            if start <= merged_end + 0.5:  
                merged_end = max(merged_end, end) 
            else:
                merged_segments.append((merged_start, merged_end, key))  
                merged_start, merged_end = start, end  


        merged_segments.append((merged_start, merged_end, key))

    return merged_segments


def diarize_audio(file_path):
    print("🎤 Running diarization on all chunks in parallel...")

    file_path = convert_to_wav(file_path)
    chunk_paths = split_audio(file_path)

    print("🔍 Processing these chunks:")
    for chunk in chunk_paths:
        print(chunk)

    results = []
    with ThreadPoolExecutor(max_workers=2) as executor:
        chunk_results = list(executor.map(lambda chunk: diarize_chunk(chunk, file_path), chunk_paths))
        results.extend(chunk_results)

    final_segments = sorted([seg for res in results for seg in res])
    cleaned_segments = merge_overlapping_segments(final_segments)

    # Print the final speaker diarization results
    print("\n🎤 **Final Speaker Diarization Results (Merged & Cleaned):**")
    for start, end, speaker in sorted(cleaned_segments):
        print(f"{speaker} spoke from {start:.1f} to {end:.1f}")

    return cleaned_segments

