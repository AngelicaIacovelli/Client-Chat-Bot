from flask import Flask, request, jsonify
from flask_cors import CORS
from pydantic import BaseModel, ConfigDict
import openai
import anthropic
import sqlite3
import os
from dotenv import load_dotenv
import json
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate


# This is for the chat history summarization
chat_history_summary = []

# Create a global memory object
memory = ConversationBufferMemory()

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

app.config['JSON_SORT_KEYS'] = False

# Set up API keys
openai.api_key = os.getenv("OPENAI_API_KEY")
client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

# Define Pydantic models for input
class ChatRequest(BaseModel):
    user_input: str
    model_choice: str = "openai"
    conversation_history: list = []

    # Adjust the protected namespaces
    model_config = ConfigDict(protected_namespaces=())

# Define a function to get model response
def get_model_response(user_input, model_choice="openai", conversation_history=[]):
    global chat_history_summary, memory
    
    if model_choice.lower() == "openai":
        llm = ChatOpenAI(model_name="gpt-4-0613", temperature=0)
        
        # Check if the input is setting the name
        if "my name is" in user_input.lower():
            name = user_input.lower().split("my name is")[-1].strip()
            memory.save_context({"input": f"Remember that my name is {name}"}, {"output": f"Certainly, I'll remember that your name is {name}."})
        
        # Create a custom prompt template
        template = """You are a helpful AI assistant with a good memory. You remember details about the user from previous interactions.

Current conversation:
{history}
Human: {input}
AI: """

        prompt = PromptTemplate(input_variables=["history", "input"], template=template)
        
        # Use the global memory object with the custom prompt
        chain = ConversationChain(
            llm=llm,
            memory=memory,
            prompt=prompt,
            verbose=True
        )
        
        response = chain.predict(input=user_input)
        response_text = response
    
    elif model_choice.lower() == "anthropic":
        # Existing Anthropic implementation
        messages = [{"role": "user" if msg['role'] == 'user' else "assistant", "content": msg['content']} for msg in conversation_history]
        messages.append({"role": "user", "content": user_input})

        response = client.messages.create(
            model="claude-3-5-sonnet-20240620",
            max_tokens=1000,
            messages=messages
        )
        response_text = response.content[0].text

    chat_history_summary.append({"user": user_input, "assistant": response_text})
    store_chat_history(user_input, response_text)
    return response_text






# Define API endpoint for chat
@app.route('/chat', methods=['GET'])
def chat():
    try:
        user_input = request.args.get('user_input')
        model_choice = request.args.get('model_choice', 'openai')
        conversation_history = json.loads(request.args.get('conversation_history', '[]'))

        response = get_model_response(user_input, model_choice, conversation_history)
        
        updated_history = conversation_history + [{"role": "user", "content": user_input}, {"role": "assistant", "content": response}]
        
        return jsonify({"response": response, "conversation_history": updated_history})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# Function to store chat history
def store_chat_history(user_input, model_response):
    conn = sqlite3.connect('chat_history.db')
    cursor = conn.cursor()
    
    # Create table if it doesn't exist
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS chat_history
        (id INTEGER PRIMARY KEY AUTOINCREMENT,
         user_input TEXT,
         model_response TEXT,
         timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
    ''')
    
    # Insert the new chat entry
    cursor.execute('''
        INSERT INTO chat_history (user_input, model_response)
        VALUES (?, ?)
    ''', (user_input, model_response))
    
    conn.commit()
    conn.close()

def get_chat_history(limit=None):
    conn = sqlite3.connect('chat_history.db')
    cursor = conn.cursor()
    
    if limit is None:
        cursor.execute('''
            SELECT user_input, model_response FROM chat_history
            ORDER BY id DESC
        ''')
    else:
        cursor.execute('''
            SELECT user_input, model_response FROM chat_history
            ORDER BY id DESC
            LIMIT ?
        ''', (limit,))
    
    chat_history = cursor.fetchall()
    conn.close()
    return chat_history


def summarize_chat_history(limit=None):
    global chat_history_summary
    recent_history = chat_history_summary[-limit:]
    formatted_history = "\n".join([f"User: {msg['user']}\nAssistant: {msg['assistant']}" for msg in recent_history])

    try:
        response = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that summarizes conversations."},
                {"role": "user", "content": f"Please summarize the following conversation:\n\n{formatted_history}"}
            ],
            temperature=0.5,
            max_tokens=300
        )
        
        if response.choices and len(response.choices) > 0:
            summary = response.choices[0].message.content.strip()
            return summary
        else:
            return "Unable to generate summary."
    except Exception as e:
        print(f"Error in summarizing chat history: {e}")
        return None


@app.route("/chat/summary", methods=['GET'])
def get_chat_summary():
    try:
        limit = int(request.args.get('limit', 50))
        summary = summarize_chat_history(limit)
        if summary:
            return jsonify({
                "summary": summary,
                "chat_history": chat_history_summary[-limit:]
            })
        else:
            return jsonify({"error": "Failed to generate summary"}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500





# Define API endpoint to retrieve chat history (GET method)
@app.route("/chat/history", methods=['GET'])
def get_chat_history_endpoint():
    try:
        limit = int(request.args.get('limit', 10))
        chat_history = get_chat_history(limit)
        
        print("Chat History:", chat_history)
        return jsonify({"chat_history": chat_history if chat_history else []})
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# clearing the chat history
@app.route("/clear-history", methods=['POST'])
def clear_history():
    global chat_history_summary
    chat_history_summary = []
    
    # Clear the database
    conn = sqlite3.connect('chat_history.db')
    cursor = conn.cursor()
    cursor.execute("DELETE FROM chat_history")
    conn.commit()
    conn.close()
    
    return jsonify({"message": "Chat history cleared successfully"})


# Test API endpoint for GET method
@app.route("/")
def read_root():
    return jsonify({"message": "Welcome to the chat API!"})


# Run the Flask app
if __name__ == "__main__":
    app.run()
