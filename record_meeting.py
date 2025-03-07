import sounddevice as sd
import wave
import threading
from datetime import datetime
import os
from mom_g import generate_mom_from_audio

# Global variable to control recording
is_recording = False

# Function to start recording
def start_recording(filename=None, duration=10, sample_rate=44100):
    global is_recording
    is_recording = True
    
    # Set default filename with current date and time if not provided
    if filename is None:
        current_time = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"recorded_meetings/meeting_{current_time}.wav"
    
    # Ensure the directory exists
    os.makedirs("recorded_meetings", exist_ok=True)

    # Open a wave file
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(1)  
        wf.setsampwidth(2)  
        wf.setframerate(sample_rate)

        # Callback function to write audio data to file
        def callback(indata, frames, time, status):
            if is_recording:
                wf.writeframes(indata.copy())

        # Start recording
        with sd.InputStream(samplerate=sample_rate, channels=1, callback=callback):
            print("Recording started...")
            while is_recording:
                sd.sleep(1000)  # Sleep for 1 second

    print("Recording stopped.")
    #attendees = request.form.get("attendees")

    # Pass the recorded audio to mom_g function
    #generate_mom_from_audio(filename, attendees)

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
    input("Press ENTER to stop recording...")
    stop_recording()
    recording_thread.join()