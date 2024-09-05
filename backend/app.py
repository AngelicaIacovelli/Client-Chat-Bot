from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, ConfigDict
import openai
import anthropic
import sqlite3
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)
 
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
              model="claude-2", 
              prompt="\n\n".join([f"{msg['role']}: {msg['content']}" for msg in conversation_history]),
              max_tokens_to_sample=1000
          )
          conversation_history.append({"role": "assistant", "content": response.completion.strip()})
          return response.completion.strip()
      except Exception as e:
          print(f"Anthropic API Error: {e}")  # Print the error to the console
          return jsonify({"error": f"Error calling Anthropic API: {str(e)}"}), 500 


# Define a function to store chat history
def store_chat_history(user_input, model_response):
    conn = sqlite3.connect('chat_history01.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history01 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_input TEXT NOT NULL,
            model_response TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        INSERT INTO chat_history01 (user_input, model_response)
        VALUES (?, ?)
    ''', (user_input, model_response))

    conn.commit()
    conn.close()

# Define API endpoint for chat
@app.route('/chat', methods=['GET'])
def chat():
    try:
        chat_request = ChatRequest(**request.args.to_dict())
        response = get_model_response(chat_request.user_input, chat_request.model_choice, chat_request.conversation_history)
        store_chat_history(chat_request.user_input, response)
        return jsonify({"response": response, "conversation_history": chat_request.conversation_history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Define API endpoint to retrieve chat history (GET method)
@app.route("/chat/history", methods=['GET'])
def get_chat_history():
    try:
        limit = int(request.args.get('limit', 10))
        conn = sqlite3.connect('chat_history01.db')
        cursor = conn.cursor()

        cursor.execute('''
            SELECT user_input, model_response FROM chat_history01
            ORDER BY id DESC
            LIMIT ?
        ''', (limit,))

        chat_history = cursor.fetchall()
        conn.close()
        
        print("Chat History:", chat_history)
        return jsonify({"chat_history01": chat_history if chat_history else []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Test API endpoint for GET method
@app.route("/")
def read_root():
    return jsonify({"message": "Welcome to the chat API!"})


# Run the Flask app
if __name__ == "__main__":
    app.run(debug=True)
