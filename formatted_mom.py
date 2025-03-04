import os
import torch
import ffmpeg
import identify_speaker
from pyannote.audio import Pipeline
from concurrent.futures import ThreadPoolExecutor  # Parallel processing
import itertools
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
import fitz  # PyMuPDF

def create_mom_pdf(data, filename="MoM_Report.pdf"):
    doc = SimpleDocTemplate(filename, pagesize=letter, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    elements = []
    
    # Create custom styles
    styles = getSampleStyleSheet()
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading1'],
        fontSize=14,
        spaceAfter=20,
        textColor=colors.white
    )
    
    # Define colors
    header_color = colors.Color(0.85, 0.85, 0.85)  # Light grey
    
    # Add sections to PDF
    for section, content in data.items():
        elements.append(Paragraph(section, header_style))
        table_data = [[i+1, item] for i, item in enumerate(content)]
        t = Table(table_data, colWidths=[0.5*inch, 5*inch])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (0, -1), header_color),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('BOX', (0, 0), (-1, -1), 2, colors.black),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 20))
    
    # Debug: Print elements to verify
    print("Building PDF with the following elements:")
    for element in elements:
        print(element)

    # Build the PDF
    doc.build(elements)
    print("✅ MoM Report generated successfully: " + filename)

def parse_mom_text(raw_text):
    sections = {}
    current_section = None
    lines = raw_text.split("\n")
    for line in lines:
        line = line.strip()
        if not line:
            continue
        if ':' in line:
            current_section = line.split(':')[0].strip()
            sections[current_section] = []
        elif current_section:
            sections[current_section].append(line)
    return sections

# Function to extract text from PDF
def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()
    return text

# Use the extracted text to create a formatted PDF
pdf_path = "MoM/MoM_2025-03-03.pdf"
raw_text = extract_text_from_pdf(pdf_path)

# Parse the raw text into sections
sections = parse_mom_text(raw_text)

# Ensure the MoM directory exists
output_folder = "MoM"
os.makedirs(output_folder, exist_ok=True)

# Create the PDF with formatted tables
output_filename = os.path.join(output_folder, "Formatted_MoM_2025-03-03.pdf")
create_mom_pdf(sections, filename=output_filename)

# Confirm file creation
if os.path.exists(output_filename):
    print(f"✅ PDF successfully created: {output_filename}")
else:
    print(f"❌ Failed to create PDF: {output_filename}")

# Create a simple PDF to test
def create_simple_pdf(filename):
    doc = SimpleDocTemplate(filename, pagesize=letter)
    elements = []

    # Add a simple paragraph
    styles = getSampleStyleSheet()
    elements.append(Paragraph("This is a test PDF.", styles['Normal']))

    # Build the PDF
    doc.build(elements)
    print(f"✅ Simple PDF generated successfully: {filename}")

# Test the simple PDF creation
test_filename = "MoM/Simple_Test.pdf"
create_simple_pdf(test_filename)
