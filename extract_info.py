import re
import spacy
import pdfkit
from summarizer import Summarizer
from transformers import pipeline


# Load NLP model
nlp = spacy.load("en_core_web_sm")
#summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
#bert_model = Summarizer()

def extract_participants(transcript):
    """ Extracts unique speaker names from transcript """
    speakers = set(re.findall(r"(\w+):", transcript))  
    return list(speakers)

# def extract_summary(transcript):
#     """ Uses BERT-based model to generate a summary """
#     return bert_model(transcript, ratio=0.2)

# def extract_summary(transcript):
#     return summarizer(transcript, max_length=300, min_length=100, do_sample=False)[0]['summary_text']

summarizer = pipeline("summarization", model="t5-small")

def extract_summary(transcript):
    chunks = [transcript[i:i+1024] for i in range(0, len(transcript), 1024)]  
    summary = " ".join(
        summarizer(chunk, max_length=200, min_length=80, do_sample=False)[0]['summary_text']
        for chunk in chunks
    )
    return summary.strip()

def extract_action_items(transcript):
    action_items = []
    doc = nlp(transcript)
    for sent in doc.sents:
        if any(keyword in sent.text.lower() for keyword in ["will", "should", "must", "need to"]):
            action_items.append(sent.text.strip())
    return action_items

def extract_decisions(transcript):
    decisions = []
    doc = nlp(transcript)

    for sent in doc.sents:
        if "decided" in sent.text.lower() or "agreed" in sent.text.lower():
            decisions.append(sent.text.strip())

    return decisions