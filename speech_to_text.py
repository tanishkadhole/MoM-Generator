import speech_recognition as sr
import pyttsx3

recognizer = sr.Recognizer()

def record_text():
    while(1):
        try:
            with sr.Microphone() as source2:
                recognizer.adjust_for_ambient_noise(source2, duration=0.2)

                audio2 = recognizer.listen(source2)

                MyText = recognizer.recognize_google(audio2)

                return MyText

        except sr.RequestError as e:
            print("Could Not Request Results : {0}".format(e))
        
        except sr.UnknownValueError:
            print("Unknown Error Occurred")
    return

def output_text(text):
    f = open("output.txt", "a")
    f.write(text)
    f.write("\n")
    f.close()
    return

while(1):
    text = record_text()
    output_text(text)

    print("Wrote Text")