# Steps to run Context:



Frontend: 
0) Open a terminal
1) Clone the repo-> run this command: git clone https://github.com/Abhishekingle662/context-frontend.git
2) cd into "my-chatbot-frontend"
3) run this command: npm install (This installs all the required packages and dependencies)
4) run this command: npm run dev (This runs the app on a localhost:3000)
5) To check if the app is running: open a browser and go to: http://localhost:3000


Also, add a .env file with your respective openai and anthropic api keys in the root directory of the project


Backend:
1) open a terminal
2) Clone this repo: run this command: git clone https://github.com/AngelicaIacovelli/Client-Chat-Bot.git
3) cd into "Client-Chat-Bot"
4) cd into "backend"
5) Check if there's a requirements.txt file (requirements.txt file contains all the dependencies for running the backend code)
6) activate virtual environment so that there are no conflicts with any of the dependencies. Check if there's a .env folder inside the directory.
7) if venv folder is present: run this command: venv\Scripts\activate (This activates the virtual environment)
8) if venv folder is missing: run this command: python -m venv venv (This creates a new virtual environment)
8.5) Now that venv is created, follow step 7
9) install the dependencies inside the activated venv: run this command: pip install -r requirements.txt 
10) Now that the dependencies are installed: run this command: python app.py (This starts the backend server on localhost:5000)
11) To check the server: open a browser and go to: http://localhost:5000
