import React, { useState } from 'react';
import axios from 'axios';
import './ContentGenerator.css';

const API_URL = 'http://localhost:5000';

function ContentGenerator() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const result = await axios.post(`${API_URL}/api/generate`, {
        prompt
      });

      if (result.data.success) {
        setResponse(result.data.response);
      } else {
        setError('Failed to generate content');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    'Write a haiku about coding',
    'Explain quantum computing in simple terms',
    'Give me 5 creative writing prompts',
    'Write a motivational quote',
    'Suggest a healthy breakfast recipe'
  ];

  // Populate the prompt with a sample entry
  const handleExampleClick = (example) => {
    setPrompt(example);
  };

  return (
    <div className="content-generator">
      <div className="generator-card">
        <h2>💡 Generate Content</h2>
        
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label htmlFor="prompt">Your Prompt</label>
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here... Ask anything!"
              rows="5"
              disabled={loading}
            />
          </div>

          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? '⚡ Generating...' : '✨ Generate Content'}
          </button>
        </form>

        <div className="examples">
          <p className="examples-title">Try these examples:</p>
          <div className="example-chips">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                className="example-chip"
                onClick={() => handleExampleClick(example)}
                disabled={loading}
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {response && (
          <div className="content-output">
            <div className="output-header">
              <h3>Response</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(response)}
                className="copy-btn"
              >
                📋 Copy
              </button>
            </div>
            <div className="response-text">
              {response}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ContentGenerator;
