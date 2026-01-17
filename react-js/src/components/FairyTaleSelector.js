import React, { useState } from 'react';
import axios from 'axios';
import './FairyTaleSelector.css';

const API_URL = 'http://localhost:5000';

// Helper function to render markdown formatting
const renderMarkdown = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  
  lines.forEach((line, index) => {
    if (line.trim() === '') {
      return;
    }
    
    let processedLine = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    processedLine = processedLine.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
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

function FairyTaleSelector() {
  const [selectedTale, setSelectedTale] = useState('');
  const [region, setRegion] = useState('universal');
  const [includeImages, setIncludeImages] = useState(false);
  const [story, setStory] = useState('');
  const [storyWithImages, setStoryWithImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fairyTales = [
    { id: 'sinbad', name: 'Adventures of Sinbad', description: 'A sailor embarks on magical voyages' },
    { id: 'alice', name: 'Alice in Wonderland', description: 'A girl falls into a magical rabbit hole' },
    { id: 'aladdin', name: 'Aladdin and Wonderful Lamp', description: 'A boy finds a magical lamp with a genie' },
    { id: 'beauty-beast', name: 'Beauty and Beast', description: 'Love transforms a cursed prince' },
    { id: 'cinderella', name: 'Cinderella', description: 'A young girl finds her happily ever after' },
    { id: 'dog-elixir', name: 'Dog of Elixir', description: 'A faithful dog guards a magical potion' },
    { id: 'golden-goose', name: 'Golden Goose', description: 'A magical goose brings fortune' },
    { id: 'hansel-gretel', name: 'Hansel & Gretel', description: 'Two siblings lost in the forest' },
    { id: 'iron-hans', name: 'Iron Hans', description: 'A wild man helps a young prince' },
    { id: 'jack-beanstalk', name: 'Jack and Beanstalk', description: 'A boy climbs a magical beanstalk' },
    { id: 'jeanne-darc', name: "Jeanne d'Arc", description: 'A brave maiden leads her people' },
    { id: 'donkey-ears', name: 'King with Donkey Ears', description: 'A king hides a mysterious secret' },
    { id: 'new-clothes', name: "King's New Clothes", description: 'A vain emperor is tricked by weavers' },
    { id: 'knight-armor', name: 'Knight in Armor', description: 'A brave knight on a noble quest' },
    { id: 'match-girl', name: 'Little Match Girl', description: 'A poor girl dreams on a cold night' },
    { id: 'little-mermaid', name: 'Little Mermaid', description: 'A mermaid dreams of the human world' },
    { id: 'little-red', name: 'Little Red Riding Hood', description: 'A girl encounters a wolf in the woods' },
    { id: 'musicians', name: 'Musicians of Bremen', description: 'Four animals become unlikely friends' },
    { id: 'north-wind', name: 'North Wind and Sun', description: 'Gentle persuasion wins over force' },
    { id: 'peter-pan', name: 'Peter Pan', description: 'A boy who never grows up' },
    { id: 'pied-piper', name: 'Pied Piper of Elixir', description: 'A mysterious musician leads rats away' },
    { id: 'pinocchio', name: 'Pinocchio', description: 'A wooden puppet dreams of being real' },
    { id: 'princess-frog', name: 'Princess Frog', description: 'A princess kisses an enchanted frog' },
    { id: 'queen-elisabeth', name: 'Queen Elisabeth', description: 'A wise and noble queen' },
    { id: 'rapunzel', name: 'Rapunzel', description: 'A girl with long magical hair in a tower' },
    { id: 'saint-alexandria', name: 'Saint of Alexandria', description: 'A saint of great wisdom and faith' },
    { id: 'singing-bone', name: 'Singing Bone', description: 'A bone reveals the truth' },
    { id: 'snow-white', name: 'Snow White', description: 'A princess and seven dwarfs' },
    { id: 'three-pigs', name: 'Three Little Pigs', description: 'Three pigs build houses to escape the wolf' },
    { id: 'tortoise-hare', name: 'Tortoise and Hare', description: 'Slow and steady wins the race' },
    { id: 'ugly-duckling', name: 'Ugly Duckling', description: 'A duckling transforms into a swan' },
    { id: 'wizard-oz', name: 'Wizard of Oz', description: 'A girl journeys to a magical land' }
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    
    if (!selectedTale) {
      setError('Please select a fairy tale');
      return;
    }

    setLoading(true);
    setError('');
    setStory('');
    setStoryWithImages([]);

    try {
      const response = await axios.post(`${API_URL}/api/generate-fairytale`, {
        tale: selectedTale,
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

  const selectedTaleObj = fairyTales.find(t => t.id === selectedTale);

  return (
    <div className="fairytale-selector">
      <div className="generator-card">
        <h2>📚 Classic Fairy Tales</h2>
        <p className="subtitle">Select a beloved fairy tale and customize it for your region</p>
        
        <form onSubmit={handleGenerate}>
          <div className="form-group">
            <label htmlFor="tale">Choose a Fairy Tale</label>
            <select
              id="tale"
              value={selectedTale}
              onChange={(e) => setSelectedTale(e.target.value)}
              disabled={loading}
              className="tale-select"
            >
              <option value="">-- Select a Fairy Tale --</option>
              {fairyTales.map(tale => (
                <option key={tale.id} value={tale.id}>
                  {tale.name}
                </option>
              ))}
            </select>
            {selectedTaleObj && (
              <p className="tale-description">{selectedTaleObj.description}</p>
            )}
          </div>

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

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                disabled={loading}
              />
              <span>🎨 Add Stability AI illustrations</span>
            </label>
            <p className="checkbox-hint">Slots 3 scenes between paragraphs using the low-cost stable-image-core engine.</p>
          </div>

          <button type="submit" className="generate-btn" disabled={loading}>
            {loading ? '✨ Generating...' : '🎭 Generate Fairy Tale'}
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
              <h3>Your Fairy Tale</h3>
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

export default FairyTaleSelector;
