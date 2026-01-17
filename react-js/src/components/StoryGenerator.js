import React, { useState } from 'react';
import axios from 'axios';
import './StoryGenerator.css';

const API_URL = 'http://localhost:5000';

// Helper function to render markdown formatting
const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  
  lines.forEach((line, index) => {
    // Skip empty lines to avoid double spacing
    if (line.trim() === '') {
      return;
    }
    
    // Convert bold **text** to <strong>
    let processedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    // Convert italic *text* to <em>
    processedLine = processedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
    // Convert headers
    if (processedLine.startsWith('### ')) {
      processedLine = `<h3>${processedLine.substring(4)}</h3>`;
    } else if (processedLine.startsWith('## ')) {
      processedLine = `<h2>${processedLine.substring(3)}</h2>`;
    } else if (processedLine.startsWith('# ')) {
      processedLine = `<h1>${processedLine.substring(2)}</h1>`;
    } else {
      processedLine = `<p>${processedLine}</p>`;
    }
    
    elements.push(
      <div key={index} dangerouslySetInnerHTML={{ __html: processedLine }} />
    );
  });
  
  return elements;
};

function StoryGenerator() {
  const [topic, setTopic] = useState('');
  const [genre, setGenre] = useState('custom');
  const [customGenre, setCustomGenre] = useState('');
  const [length, setLength] = useState('short');
  const [region, setRegion] = useState('universal');
  const [includeImages, setIncludeImages] = useState(false);
  const [story, setStory] = useState('');
  const [storyWithImages, setStoryWithImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!topic.trim()) {
      setError('Please enter a topic for your story');
      return;
    }

    if (genre === 'custom' && !customGenre.trim()) {
      setError('Please describe your custom genre');
      return;
    }

    setLoading(true);
    setError('');
    setStory('');
    setStoryWithImages([]);

    try {
      const finalGenre = genre === 'custom' ? customGenre : genre;
      
      const response = await axios.post(`${API_URL}/api/generate-story`, {
        topic,
        genre: finalGenre,
        length,
        region,
        includeImages
      });

      if (response.data.success) {
        setStory(response.data.story);
        if (response.data.storyWithImages?.length) {
          setStoryWithImages(response.data.storyWithImages);
        }
      } else {
        setError('Failed to generate story');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to connect to the server. Make sure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="story-generator">
      <div className="generator-card">
        <h2>📖 Create Your Story</h2>
        
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label htmlFor="topic">Story Topic</label>
            <input
              type="text"
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., a brave knight, a magical forest, time travel..."
              disabled={loading}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="region">Region/Country</label>
              <select
                id="region"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={loading}
              >
                <option value="universal">Universal</option>
                <option value="South Asia (India, Pakistan, Bangladesh)">South Asia (India, Pakistan, Bangladesh)</option>
                <option value="Middle East (Saudi Arabia, UAE, Egypt)">Middle East (Saudi Arabia, UAE, Egypt)</option>
                <option value="Southeast Asia (Philippines, Thailand, Indonesia)">Southeast Asia (Philippines, Thailand, Indonesia)</option>
                <option value="East Asia (Japan, China, Korea)">East Asia (Japan, China, Korea)</option>
                <option value="Africa (Nigeria, Kenya, South Africa)">Africa (Nigeria, Kenya, South Africa)</option>
                <option value="Latin America (Mexico, Brazil, Argentina)">Latin America (Mexico, Brazil, Argentina)</option>
                <option value="Europe (UK, France, Germany)">Europe (UK, France, Germany)</option>
                <option value="North America (USA, Canada)">North America (USA, Canada)</option>
                <option value="Caribbean">Caribbean</option>
                <option value="Oceania (Australia, New Zealand)">Oceania (Australia, New Zealand)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="genre">Genre</label>
              <select
                id="genre"
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                disabled={loading}
              >
                <option value="fantasy">Fantasy</option>
                <option value="sci-fi">Sci-Fi</option>
                <option value="mystery">Mystery</option>
                <option value="romance">Romance</option>
                <option value="horror">Horror</option>
                <option value="adventure">Adventure</option>
                <option value="comedy">Comedy</option>
                <option value="custom">Custom (Describe Yourself)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="length">Length</label>
              <select
                id="length"
                value={length}
                onChange={(e) => setLength(e.target.value)}
                disabled={loading}
              >
                <option value="very short">Very Short (100-150 words)</option>
                <option value="short">Short (200-300 words)</option>
                <option value="medium">Medium (400-600 words)</option>
                <option value="long">Long (800-1000 words)</option>
              </select>
            </div>
          </div>

          {genre === 'custom' && (
            <div className="form-group">
              <label htmlFor="customGenre">Describe Your Genre</label>
              <input
                type="text"
                id="customGenre"
                value={customGenre}
                onChange={(e) => setCustomGenre(e.target.value)}
                placeholder="e.g., cyberpunk noir, magical realism, steampunk adventure..."
                disabled={loading}
              />
            </div>
          )}

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                disabled={loading}
              />
              <span>🎨 Generate Stability AI images</span>
            </label>
            <p className="checkbox-hint">Adds up to 3 illustrations using the StabilityAI stable-image-core model.</p>
          </div>

          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? '✨ Generating...' : '🚀 Generate Story'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {story && (
          <div className="story-output">
            <div className="output-header">
              <h3>Your Story</h3>
              <button 
                onClick={() => navigator.clipboard.writeText(story)}
                className="copy-btn"
              >
                📋 Copy
              </button>
            </div>
            {storyWithImages.length > 0 ? (
              <div className="story-with-images">
                {storyWithImages.map((segment, index) => (
                  <div key={`${segment.type}-${index}`}>
                    {segment.type === 'text' ? (
                      <div className="story-text">
                        {renderMarkdown(segment.content)}
                      </div>
                    ) : (
                      <div className="story-image-container">
                        <img
                          src={segment.content}
                          alt={`Scene ${index + 1}`}
                          className="story-image"
                        />
                        {segment.prompt && (
                          <p className="image-caption">{segment.prompt}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="story-text">
                {renderMarkdown(story)}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StoryGenerator;
