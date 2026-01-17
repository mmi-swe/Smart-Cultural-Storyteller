# Story Generator Frontend

A React-based frontend for the AI Story Generator powered by Google Gemini.

## Features

- **Story Generator**: Create custom stories with topic, genre, and length options
- **Content Generator**: Generate any type of content with custom prompts
- Beautiful, responsive UI with gradient backgrounds
- Real-time interaction with Flask backend

## Setup

1. Install dependencies:
```bash
npm install
```

2. Make sure the Flask backend is running on `http://localhost:5000`

## Running the App

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm start` - Run the development server
- `npm build` - Build for production
- `npm test` - Run tests

## Backend Integration

The app connects to the Flask backend API running on `localhost:5000`. Make sure to:

1. Start the backend server first
2. Configure CORS in the Flask app (already included in backend)
3. Ensure your Gemini API key is configured in the backend

## Usage

### Story Generator
1. Enter a story topic
2. Select genre and length
3. Click "Generate Story"
4. Copy or read your generated story

### Content Generator
1. Enter any prompt
2. Or click an example prompt
3. Click "Generate Content"
4. Get AI-powered responses
