from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, ConfigDict
import nltk
from nltk.tokenize import sent_tokenize
from nltk.probability import FreqDist
from nltk.corpus import stopwords
import openai
import anthropic
import sqlite3
import os
from dotenv import load_dotenv
import json

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

nltk.download('punkt')
nltk.download('stopwords')
 
# Set up API keys
openai.api_key = os.getenv("OPENAI_API_KEY")
anthropic.api_key = os.getenv("ANTHROPIC_API_KEY")

# Define Pydantic models for input
class ChatRequest(BaseModel):
    user_input: str
    model_choice: str = "openai"
    conversation_history: list = []

    # Adjust the protected namespaces
    model_config = ConfigDict(protected_namespaces=())

# Define a function to get model response
def get_model_response(user_input, model_choice="openai", conversation_history=[]):
    if model_choice.lower() == "openai":
        conversation_history.append({"role": "user", "content": user_input})
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",  # Adjust model as needed
            messages=conversation_history
        )
        conversation_history.append({"role": "assistant", "content": response.choices[0].message.content.strip()})
        return response.choices[0].message.content.strip()

    elif model_choice.lower() == "anthropic":
      try:
          conversation_history.append({"role": "user", "content": user_input})
          response = anthropic.messages.create(
              model="claude-3-5-sonnet-20240620", 
              prompt="\n\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history]),
              max_tokens_to_sample=1000
          )

          response_text = response.completion.strip()  # Extract the response text
          conversation_history.append({"role": "assistant", "content": response.completion.strip()})
          return response_text
      except Exception as e:
          print(f"Anthropic API Error: {e}")  # Print the error to the console
          return jsonify({"error": f"Error calling Anthropic API: {str(e)}"}), 500 


# Define a function to store chat history
def store_chat_history(user_input, model_response):
    conn = sqlite3.connect('chat_history.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_input TEXT NOT NULL,
            model_response TEXT NOT NULL
        )
    ''')

    if isinstance(model_response, tuple):
        model_response = model_response[0]  # Extract the response text from the tuple

    cursor.execute('''
        INSERT INTO chat_history (user_input, model_response)
        VALUES (?, ?)
    ''', (user_input, model_response))

    conn.commit()
    conn.close()




def get_chat_history():
    conn = sqlite3.connect('chat_history.db')
    cursor = conn.cursor()

    cursor.execute("SELECT user_input, model_response FROM chat_history")
    chat_history = cursor.fetchall()

    conn.close()

    return chat_history




def summarize_chat_history(chat_history, model_choice="openai", num_sentences=3): # You can adjust num_sentences
    if not chat_history:
        return "No chat history to summarize."

    text_to_summarize = " ".join([message for _, message in chat_history])

    # Tokenize into sentences
    sentences = sent_tokenize(text_to_summarize)

    # Remove stop words and find word frequencies
    stop_words = set(stopwords.words('english'))
    word_frequencies = {}
    for sentence in sentences:
        words = nltk.word_tokenize(sentence)
        for word in words:
            if word.lower() not in stop_words:
                if word not in word_frequencies:
                    word_frequencies[word] = 0
                word_frequencies[word] += 1

    # Get most frequent words
    max_frequency = max(word_frequencies.values())
    for word in word_frequencies:
        word_frequencies[word] = word_frequencies[word]/max_frequency

    # Score sentences based on word frequencies
    sentence_scores = {}
    for sentence in sentences:
        for word in nltk.word_tokenize(sentence.lower()):
            if word in word_frequencies:
                if sentence not in sentence_scores:
                    sentence_scores[sentence] = 0
                sentence_scores[sentence] += word_frequencies[word]

    # Get the top-ranked sentences for the summary
    summary_sentences = sorted(sentence_scores, key=sentence_scores.get, reverse=True)[:num_sentences]
    summary = ' '.join(summary_sentences)
    return summary


@app.route('/summarize', methods=['GET'])
def summarize_history():
    # Get chat history from form data
    chat_history_str = request.form.get('chatHistory', '[]') 
    chat_history = json.loads(chat_history_str) # Parse the JSON string

    print("Received chat history:", chat_history)  # Add this line for debugging

    summary = summarize_chat_history(chat_history, num_sentences=3)  # Adjust num_sentences as needed
    return jsonify(summary=summary)



# Define API endpoint for chat
@app.route('/chat', methods=['GET'])
def chat():
    try:
        chat_request = ChatRequest(**request.args.to_dict())
        response = get_model_response(chat_request.user_input, chat_request.model_choice, chat_request.conversation_history)
        
        if isinstance(response, tuple):
            response_text = response[0]  # Extract the response text from the tuple
        else:
            response_text = response
        
        store_chat_history(chat_request.user_input, response_text)
        return jsonify({"response": response_text, "conversation_history": chat_request.conversation_history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# Define API endpoint to retrieve chat history (GET method)
@app.route("/chat/history", methods=['GET'])
def get_chat_history():
    try:
        limit = int(request.args.get('limit', 10))
        conn = sqlite3.connect('chat_history.db')
        cursor = conn.cursor()

        cursor.execute('''
            SELECT user_input, model_response FROM chat_history
            ORDER BY id DESC
            LIMIT ?
        ''', (limit,))

        chat_history = cursor.fetchall()
        conn.close()
        
        print("Chat History:", chat_history)
        return jsonify({"chat_history": chat_history if chat_history else []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Test API endpoint for GET method
@app.route("/")
def read_root():
    return jsonify({"message": "Welcome to the chat API!"})


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
