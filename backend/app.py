"""
AI Story Generator Flask Backend
Main application entry point
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from services import generate_story, generate_fairytale

app = Flask(__name__)
CORS(app)


# ============== Basic Routes ==============

@app.route('/')
def home():
    """Welcome endpoint"""
    return jsonify({
        'message': 'Welcome to the AI Story Generator API',
        'status': 'success',
        'version': '1.0.0'
    })


@app.route('/api/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'AI Story Generator Backend'
    })


# ============== Story Generation Routes ==============

@app.route('/api/generate-story', methods=['POST'])
def api_generate_story():
    """
    Generate a story with local flavor
    
    Request body:
    {
        "topic": "string (required)",
        "genre": "string (optional, default: 'any')",
        "length": "string (optional, default: 'short')",
        "region": "string (optional, default: 'universal')",
        "includeImages": "boolean (optional, default: false)"
    }
    """
    try:
        data = request.get_json()
        
        # Validate request
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        topic = data.get('topic', '').strip()
        genre = data.get('genre', 'any')
        length = data.get('length', 'short')
        region = data.get('region', 'universal')
        include_images = data.get('includeImages', False)
        
        if not topic:
            return jsonify({'error': 'Topic is required'}), 400
        
        # Call service
        result = generate_story(topic, genre, length, region, include_images)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


@app.route('/api/generate-fairytale', methods=['POST'])
def api_generate_fairytale():
    """
    Generate a localized version of a classic fairy tale
    
    Request body:
    {
        "tale": "string (required)",
        "region": "string (optional, default: 'universal')",
        "includeImages": "boolean (optional, default: false)"
    }
    """
    try:
        data = request.get_json()
        
        # Validate request
        if not data:
            return jsonify({'error': 'Request body is required'}), 400
        
        tale = data.get('tale', '').strip()
        region = data.get('region', 'universal')
        include_images = data.get('includeImages', False)
        
        if not tale:
            return jsonify({'error': 'Fairy tale selection is required'}), 400
        
        # Call service
        result = generate_fairytale(tale, region, include_images)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 400
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Internal server error: {str(e)}'
        }), 500


# ============== Error Handlers ==============

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'error': 'Endpoint not found',
        'path': request.path
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'error': 'Internal server error'
    }), 500


# ============== Main ==============

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
