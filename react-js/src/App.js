import React, { useState } from 'react';
import './App.css';
import StoryGenerator from './components/StoryGenerator';
import FairyTaleSelector from './components/FairyTaleSelector';

function App() {
  const [activeTab, setActiveTab] = useState('create');

  return (
    <div className="App">
      <div className="atmosphere">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
      </div>

      <header className="hero">
        <div className="hero-text">
          <p className="eyebrow">AI x CULTURE x IMAGINATION</p>
          <h1>Smart Cultural Storyteller</h1>
          <p className="hero-tagline">
            Craft new legends or revive timeless tales with Google Gemini narration and
            Stability AI imagery—designed for every region, dialect, and dreamer.
          </p>
          <div className="hero-pills">
            <span>🌍 11+ cultural presets</span>
            <span>🎨 Optional illustrated scenes</span>
            <span>⚡️ Latest Gemini Model</span>
          </div>
        </div>
        <div className="hero-card">
          <p className="card-label">Live Preview</p>
          <h2>{activeTab === 'create' ? 'Custom Story Lab' : 'Fairy Tale Vault'}</h2>
          <p className="card-copy">
            {activeTab === 'create'
              ? 'Describe any topic or imaginative genre, add local flair, and let Gemini weave something entirely new.'
              : 'Pick a beloved classic, infuse it with your region’s customs, and layer in modern visuals.'}
          </p>
          <div className="card-stats">
            <div>
              <span className="stat-value">Gemini</span>
              <span className="stat-label">Narrative core</span>
            </div>
            <div>
              <span className="stat-value">Stability</span>
              <span className="stat-label">Illustration engine</span>
            </div>
          </div>
        </div>
      </header>

      <section className="workspace">
        <div className="tabs">
          <button
            className={`tab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            Create New Story
          </button>
          <button
            className={`tab ${activeTab === 'fairytales' ? 'active' : ''}`}
            onClick={() => setActiveTab('fairytales')}
          >
            Classic Fairy Tales
          </button>
        </div>

        <div className="content">
          {activeTab === 'create' ? <StoryGenerator /> : <FairyTaleSelector />}
        </div>
      </section>

      <footer className="App-footer">
        <p>Built with React & Flask • Powered by Gemini AI & Stability AI</p>
      </footer>
    </div>
  );
}

export default App;
