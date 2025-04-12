from flask import Flask, render_template, request, jsonify
import pyttsx3
import google.generativeai as genai
import os
  # Text-to-speech library

app = Flask(__name__)

# Set your Google API key
os.environ["GOOGLE_API_KEY"] = "AIzaSyCSF9aNnlD5Ab0coBGfDLgEmSqQcdFoCfw"  # Replace with your actual API key
genai.configure(api_key=os.environ["GOOGLE_API_KEY"])

model = genai.GenerativeModel("models/gemini-1.5-pro")

# Initialize the text-to-speech engine globally
engine = pyttsx3.init()

# Global variables to store conversation history and context
conversation_history = []

# Function to speak text
def speak(text):
    """Converts text to speech using pyttsx3."""
    print(f"Speaking: {text}")  # Debugging
    try:
        engine.say(text)
        engine.runAndWait()
    except RuntimeError as e:
        print(f"Error in speak function: {e}")

# Voice assistance function with enhanced topic management
def voice_assistance(user_input):
    global conversation_history

    # Improved prompt with focus on concise and direct answers
    prompt = f"""
    You are an AI assistant in an engaging conversation with a user. The user just asked the following question:
    '{user_input}'
    Provide a direct and informative answer, focusing on the exact details the user is asking for. Avoid unnecessary elaboration or asking follow-up questions unless essential to the user’s inquiry. Keep the response clear, concise, and to the point. If the topic is complex, briefly summarize the key aspects.
    """

    try:
        response = model.generate_content(prompt).text
    except Exception as e:
        response = f"An error occurred: {e}"

    # Update conversation history
    conversation_history.append({
        'user': user_input,
        'ai': response
    })

    # Speak the AI's response
    speak(response)

    return response


# Route to render the main page
@app.route('/')
def index():
    return render_template('index.html')


# Route to handle voice input and return model response with conversation history
@app.route('/process_voice', methods=['POST'])
def process_voice():
    try:
        # Ensure JSON data is received
        if not request.json or 'user_input' not in request.json:
            return jsonify({'error': 'Invalid request data'}), 400

        user_input = request.json.get("user_input")
        print(f"Received user input: {user_input}")  # Debugging

        # Call the voice_assistance function
        response = voice_assistance(user_input)
        print(f"Generated response: {response}")  # Debugging

        # Return the updated conversation history
        return jsonify({
            'response': response,
            'conversation_history': conversation_history
        })
    except Exception as e:
        print(f"Error in process_voice: {e}")  # Debugging
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)
