# Flask Backend

A basic Flask application.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows: `venv\Scripts\activate`
- Linux/Mac: `source venv/bin/activate`

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file and add your Gemini API key:
```
GEMINI_API_KEY=your_api_key_here
```
Get your API key from: https://makersuite.google.com/app/apikey

## Running the App

```bash
python app.py
```

The app will run on http://localhost:5000

## API Endpoints

- `GET /` - Welcome message
- `GET /api/health` - Health check
- `POST /api/data` - Example POST endpoint
- `POST /api/generate` - Generate content using Gemini AI
  - Body: `{ "prompt": "your prompt here" }`
- `POST /api/generate-story` - Generate a story using Gemini AI
  - Body: `{ "topic": "story topic", "genre": "fantasy", "length": "short" }`
