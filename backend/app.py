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
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

 
# Set up API keys
openai.api_key = os.getenv("OPENAI_API_KEY")
# anthropic.api_key = os.getenv("ANTHROPIC_API_KEY")
client = anthropic.Anthropic(
    # defaults to os.environ.get("ANTHROPIC_API_KEY")
    api_key="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",
)
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
          response = client.messages.create(
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
    conn = sqlite3.connect('chat_history01.db')
    cursor = conn.cursor()

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history01 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_input TEXT NOT NULL,
            model_response TEXT NOT NULL
        )
    ''')

    if isinstance(model_response, tuple):
        model_response = model_response[0]  # Extract the response text from the tuple

    cursor.execute('''
        INSERT INTO chat_history01 (user_input, model_response)
        VALUES (?, ?)
    ''', (user_input, model_response))

    conn.commit()
    conn.close()




def get_chat_history():
    conn = sqlite3.connect('chathistory01.db')
    cursor = conn.cursor()

    cursor.execute("SELECT user_input, model_response FROM chat_history01")
    chat_history = cursor.fetchall()

    conn.close()

    return chat_history




def summarize_chat_history(chat_history, model_choice="openai"):
    if model_choice.lower() == "openai":
        prompt = "Please summarize the following chat history in simple terms:\n\n"
        for user_input, model_response in chat_history:
            prompt += f"User: {user_input}\nAssistant: {model_response}\n\n"
        prompt += "Summary:"

        response = openai.Completion.create(
            engine="text-davinci-002",
            prompt=prompt,
            max_tokens=100,
            n=1,
            stop=None,
            temperature=0.7,
        )

        return response.choices[0].text.strip()

    elif model_choice.lower() == "anthropic":
        prompt = "Please summarize the following chat history in simple terms:\n\n"
        for user_input, model_response in chat_history:
            prompt += f"User: {user_input}\nAssistant: {model_response}\n\n"
        prompt += "Summary:"

        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            prompt=prompt,
            max_tokens_to_sample=100,
        )

        return response.completion.strip()

@app.route('/summarize', methods=['GET'])
def summarize_history():
    data = request.get_json()
    print("Received data:", data)  # Debug statement
    chat_history = data.get('chatHistory01', [])

    if not chat_history:
        chat_history = get_chat_history()

    model_choice = data.get('modelChoice', 'openai')
    summary = summarize_chat_history(chat_history, model_choice)

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
