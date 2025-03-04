import pyaudio
import wave
import threading
from datetime import datetime
import os

# Global variable to control recording
is_recording = False

# Function to start recording
def start_recording(filename=None, duration=3600, sample_rate=44100, chunk_size=1024):
    global is_recording
    is_recording = True
    
    # Set default filename with current date and time if not provided
    if filename is None:
        current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"recorded_meetings/meeting_{current_time}.wav"
    
    os.makedirs("recorded_meetings", exist_ok=True)

    p = pyaudio.PyAudio()

    # Open a stream
    stream = p.open(format=pyaudio.paInt16,
                    channels=1,
                    rate=sample_rate,
                    input=True,
                    frames_per_buffer=chunk_size)

    print("Recording started...")

    frames = []

    # Record audio
    while is_recording:
        data = stream.read(chunk_size)
        frames.append(data)

    print("Recording stopped.")

    # Stop and close the stream
    stream.stop_stream()
    stream.close()
    p.terminate()

    # Save the recorded data as a WAV file
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)
        wf.setsampwidth(p.get_sample_size(pyaudio.paInt16))
        wf.setframerate(sample_rate)
        wf.writeframes(b''.join(frames))

# Function to stop recording
def stop_recording():
    global is_recording
    is_recording = False
    print("Stopping recording...")


if __name__ == "__main__":
    # Start recording in a separate thread
    recording_thread = threading.Thread(target=start_recording)
    recording_thread.start()

    # Simulate stopping the recording from the frontend
    input("Press Enter to stop recording...")
    stop_recording()
    recording_thread.join() 