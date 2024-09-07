# Client-Chat-Bot
Abhishek, Allison &lt;> Nucleo Client Project

## Instructions
### 1. Install IDE
- Example: [Visual Studio Code](https://code.visualstudio.com/)

### 2. Open Up Terminal in IDE
- Example: In Visual Studio Code, click View -> Terminal

### 3. Clone GitHub Repository
- In terminal: git clone https://github.com/TishaMazumdar/Client-Chat-Bot.git
- Open up folder for Client-Chat-Bot

### 4. Install Python
- Download: [Python](https://www.python.org/downloads/)

### 5. Install Node.js
- Download: [Node.js](https://nodejs.org/en)

### 6. Set Up Backend
- Python extension in Visual Studio Code
    - On the left side, click "Extensions"
    - Search for "Python"
- In terminal: pip install anthropic Flask Flask-CORS nltk openai pydantic python-dotenv

### 7. API Keys
- Create Anthropic API key
    - Go to https://console.anthropic.com/settings/keys
    - Click "Create key"
    - Copy key
- Create OpenAI API key
    - Go to https://platform.openai.com/api-keys
    - Click "Create new secret key"
    - Copy key
- Create file called .env
- Ensure .env is listed under .gitignore
- In .env file, put the following, with the copied API keys:
    ANTHROPIC_API_KEY=put_anthropic_api_key_here
    OPENAI_API_KEY=put_openai_api_key_here
- Create 

### 8. Run Backend
- In terminal:
    - cd backend
    - python app.py
- Open http://localhost:5000

### 9. Set Up Frontend
- In terminal: npm install

### 10. Run Frontend
- In terminal: npm run dev
- Open http://localhost:3000