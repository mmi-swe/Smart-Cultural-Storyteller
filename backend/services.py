"""
Gemini AI Service + Stability AI illustrations
"""
import base64
import os
from typing import List, Dict

import google.generativeai as genai
import requests
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
GEMINI_MODEL = os.getenv('GEMINI_MODEL', 'gemini-3-flash-preview')
STABILITY_API_KEY = os.getenv('STABILITY_API_KEY')
STABILITY_ENGINE = os.getenv('STABILITY_ENGINE', 'core')  # core = cheapest stable-image model

# Configure Gemini API
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)



def is_configured():
    """Check if Gemini API is properly configured"""
    return GEMINI_API_KEY is not None


def build_story_with_images(story_text: str, topic: str, genre: str, max_images: int = 3) -> List[Dict] | None:
    scenes = split_story_into_scenes(story_text, max_images=max_images)
    story_with_images: List[Dict] = []
    images_added = 0

    for chunk in scenes:
        if chunk['type'] == 'text':
            story_with_images.append({'type': 'text', 'content': chunk['content']})
        elif chunk['type'] == 'image' and images_added < max_images:
            descriptive_prompt = generate_image_prompt(
                scene_text=chunk.get('scene_text', ''),
                topic=topic,
                genre=genre
            )
            image_data = generate_stability_image(descriptive_prompt)
            if image_data:
                story_with_images.append({
                    'type': 'image',
                    'content': image_data,
                    'prompt': descriptive_prompt
                })
                images_added += 1

    return story_with_images if images_added else None


def split_story_into_scenes(story_text: str, max_images: int = 3) -> List[Dict]:
    paragraphs = [p.strip() for p in story_text.split('\n') if p.strip()]
    if not paragraphs:
        return [{'type': 'text', 'content': story_text}]

    total = len(paragraphs)
    slots = min(max_images, total)
    result: List[Dict] = []
    buffer: List[str] = []

    if slots == 0:
        return [{'type': 'text', 'content': story_text}]

    step = max(1, total // (slots + 1))
    image_positions = {min(total - 1, step * i) for i in range(1, slots + 1)}

    for idx, para in enumerate(paragraphs):
        buffer.append(para)
        if idx in image_positions:
            text_chunk = '\n\n'.join(buffer).strip()
            if text_chunk:
                result.append({'type': 'text', 'content': text_chunk})
            excerpt = '\n\n'.join(buffer[-2:]) if len(buffer) >= 2 else buffer[-1]
            result.append({'type': 'image', 'scene_text': excerpt})
            buffer = []

    if buffer:
        result.append({'type': 'text', 'content': '\n\n'.join(buffer)})

    return result


def generate_image_prompt(scene_text: str, topic: str, genre: str) -> str:
    try:
        model = genai.GenerativeModel(model_name=GEMINI_MODEL)
        directive = f"""Describe a vibrant illustration for a {genre} story about {topic} in <=45 words.
Focus on characters, key action, setting, lighting, and mood.
Avoid mentioning text overlays or camera jargon.

Scene:
{scene_text}

Return only the visual description."""
        response = model.generate_content(directive)
        if response.text and response.text.strip():
            return response.text.strip()
    except Exception as exc:
        print(f"Gemini image prompt error: {exc}")
    summary = scene_text.strip()[:180] if scene_text.strip() else f"A {genre} scene about {topic}"
    return summary


def generate_stability_image(prompt: str) -> str | None:
    if not STABILITY_API_KEY:
        return None

    engine = STABILITY_ENGINE.lower()
    endpoint = f"https://api.stability.ai/v2beta/stable-image/generate/{engine}"
    headers = {
        'Authorization': f'Bearer {STABILITY_API_KEY}',
        'Accept': 'application/json'
    }
    files = {
        'prompt': (None, prompt),
        'output_format': (None, 'png')
    }

    try:
        response = requests.post(endpoint, headers=headers, files=files, timeout=60)
        if response.status_code == 200:
            content_type = response.headers.get('Content-Type', '')
            if 'application/json' in content_type:
                data = response.json()
                image_b64 = None
                if isinstance(data, dict):
                    image_b64 = data.get('image')
                    if not image_b64:
                        artifacts = data.get('artifacts')
                        if isinstance(artifacts, list) and artifacts:
                            artifact = artifacts[0]
                            if isinstance(artifact, dict):
                                image_b64 = artifact.get('base64') or artifact.get('b64_json')
                if image_b64:
                    return f"data:image/png;base64,{image_b64}"
                else:
                    print('Stability image error: JSON response missing base64 image data')
            else:
                encoded = base64.b64encode(response.content).decode('utf-8')
                return f"data:image/png;base64,{encoded}"
        else:
            print(f"Stability image error {response.status_code}: {response.text}")
    except Exception as exc:
        print(f"Stability request failed: {exc}")

    return None


def generate_story(topic, genre, length, region='universal', include_images=False):
    """
    Generate a story using Gemini AI
    
    Args:
        topic (str): The story topic
        genre (str): The story genre
        length (str): The story length (very short, short, medium, long)
        region (str): The region/country for local flavor
    
    Returns:
        dict: Contains success status and generated story or error message
    """
    if not is_configured():
        return {
            'success': False,
            'error': 'GEMINI_API_KEY not configured'
        }
    
    if not topic or not topic.strip():
        return {
            'success': False,
            'error': 'Topic is required'
        }
    
    try:
        # Build region context
        region_context = ""
        if region != 'universal':
            region_context = f" Set the story in or inspired by the culture, traditions, and values of {region}. Incorporate local elements, customs, or cultural nuances that resonate with audiences from that region."
        
        # Build prompt
        prompt = f"""Write a {length} {genre} story about {topic}.{region_context}
        
        Please ensure:
        1. The narrative is clear, easy to understand, and engaging
        2. Use simple, accessible language that most people can understand
        3. The story has a clear beginning, middle, and end
        4. Characters are relatable and their motivations are clear
        5. If local elements are included, they enhance the story without being overwhelming
        
        Make it creative and memorable."""
        
        # Generate content (no safety settings to allow creative freedom)
        model = genai.GenerativeModel(model_name=GEMINI_MODEL)
        response = model.generate_content(prompt)
        
        # Check finish reason first (before trying to access response.text)
        if response.candidates:
            finish_reason = response.candidates[0].finish_reason
            # 1 = SAFETY, 2 = MAX_TOKENS, 3 = STOP_SEQUENCE, etc.
            if finish_reason == 1:  # SAFETY
                pass
            elif finish_reason != 0:  # 0 = STOP (normal completion)
                return {
                    'success': False,
                    'error': 'Content generation was interrupted. Please try again.'
                }
        
        # Now safely access response.text
        story_text = response.text if response.text else None
        
        if not story_text or story_text.strip() == '':
            return {
                'success': False,
                'error': 'No content was generated. Please try again with a different topic.'
            }
        
        story_with_images = None
        if include_images and STABILITY_API_KEY:
            story_with_images = build_story_with_images(
                story_text=story_text,
                topic=topic,
                genre=genre,
                max_images=3
            )

        response_payload = {
            'success': True,
            'topic': topic,
            'genre': genre,
            'length': length,
            'region': region,
            'story': story_text
        }

        if story_with_images:
            response_payload['storyWithImages'] = story_with_images
            response_payload['hasImages'] = True

        return response_payload
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }


def generate_fairytale(tale_id, region='universal', include_images=False):
    """
    Generate a localized version of a classic fairy tale
    
    Args:
        tale_id (str): The fairy tale identifier
        region (str): The region/country for local flavor
    
    Returns:
        dict: Contains success status and generated story or error message
    """
    if not is_configured():
        return {
            'success': False,
            'error': 'GEMINI_API_KEY not configured'
        }
    
    if not tale_id or not tale_id.strip():
        return {
            'success': False,
            'error': 'Fairy tale selection is required'
        }
    
    # Map tale IDs to their descriptions
    tale_map = {
        'sinbad': 'Adventures of Sinbad - a sailor embarks on seven magical voyages across the seas',
        'alice': 'Alice in Wonderland - a curious girl falls down a rabbit hole into a fantastical world',
        'aladdin': 'Aladdin and the Wonderful Lamp - a poor boy finds a magical lamp with a powerful genie',
        'beauty-beast': 'Beauty and the Beast - true love transforms a cursed prince',
        'cinderella': 'Cinderella - a kind girl overcomes hardship with the help of a fairy godmother',
        'dog-elixir': 'Dog of Elixir - a faithful dog guards a magical healing potion',
        'golden-goose': 'Golden Goose - a magical goose that brings fortune and sticks to greedy hands',
        'hansel-gretel': 'Hansel & Gretel - two siblings outsmart a wicked witch in the forest',
        'iron-hans': 'Iron Hans - a wild man from the forest helps a young prince find his destiny',
        'jack-beanstalk': 'Jack and the Beanstalk - a boy climbs a magical beanstalk to a giant\'s castle',
        'jeanne-darc': 'Jeanne d\'Arc - a brave maiden who leads her people with courage and faith',
        'donkey-ears': 'King with Donkey Ears - a king tries to hide his embarrassing secret',
        'new-clothes': 'The King\'s New Clothes - a vain emperor is fooled by cunning weavers',
        'knight-armor': 'Knight in Armor - a brave knight embarks on a noble quest',
        'match-girl': 'Little Match Girl - a poor girl finds comfort in her dreams on a cold winter night',
        'little-mermaid': 'Little Mermaid - a mermaid princess dreams of life on land',
        'little-red': 'Little Red Riding Hood - a girl encounters a cunning wolf on her way to grandmother\'s house',
        'musicians': 'Musicians of Bremen - four aging animals become unlikely friends and musicians',
        'north-wind': 'North Wind and Sun - gentle persuasion proves stronger than force',
        'peter-pan': 'Peter Pan - the boy who never grows up and his adventures in Neverland',
        'pied-piper': 'Pied Piper of Elixir - a mysterious musician leads the rats away with his magical tune',
        'pinocchio': 'Pinocchio - a wooden puppet who dreams of becoming a real boy',
        'princess-frog': 'Princess and the Frog - a princess befriends an enchanted frog prince',
        'queen-elisabeth': 'Queen Elisabeth - the story of a wise and noble queen',
        'rapunzel': 'Rapunzel - a girl with magical long hair trapped in a tower',
        'saint-alexandria': 'Saint of Alexandria - a tale of great wisdom and unwavering faith',
        'singing-bone': 'The Singing Bone - a magical bone that reveals hidden truths',
        'snow-white': 'Snow White - a beautiful princess, an evil queen, and seven kind dwarfs',
        'three-pigs': 'Three Little Pigs - three pigs build houses to protect themselves from the big bad wolf',
        'tortoise-hare': 'The Tortoise and the Hare - slow and steady wins the race',
        'ugly-duckling': 'The Ugly Duckling - a duckling who discovers he is really a beautiful swan',
        'wizard-oz': 'Wizard of Oz - Dorothy\'s magical journey to the land of Oz'
    }
    
    tale_description = tale_map.get(tale_id)
    if not tale_description:
        return {
            'success': False,
            'error': 'Invalid fairy tale selection'
        }
    tale_title = tale_description.split(' - ')[0] if ' - ' in tale_description else tale_description
    
    try:
        # Build region context
        region_context = ""
        if region != 'universal':
            region_context = f" Adapt the story to {region}, incorporating local cultural elements, traditions, names, settings, and values that resonate with audiences from that region. Make it feel authentic to the culture while preserving the core fairy tale message."
        
        # Build prompt
        prompt = f"""Retell the classic fairy tale: {tale_description}.{region_context}
        
        Please ensure:
        1. Keep the core moral and message of the original fairy tale
        2. Make it engaging and accessible for all ages
        3. Use vivid descriptions and relatable characters
        4. Include a clear beginning, middle, and end
        5. If adapting to a specific region, weave in authentic cultural elements naturally
        6. Write in a storytelling style that's warm and captivating
        7. Length should be medium (around 400-600 words)
        
        Make it magical and memorable."""
        
        # Generate content
        model = genai.GenerativeModel(model_name=GEMINI_MODEL)
        response = model.generate_content(prompt)
        
        # Check finish reason first
        if response.candidates:
            finish_reason = response.candidates[0].finish_reason
            if finish_reason == 1:  # SAFETY
                pass
            elif finish_reason != 0:
                return {
                    'success': False,
                    'error': 'Content generation was interrupted. Please try again.'
                }
        
        # Safely access response.text
        story_text = response.text if response.text else None
        
        if not story_text or story_text.strip() == '':
            return {
                'success': False,
                'error': 'No content was generated. Please try again.'
            }
        
        story_with_images = None
        if include_images and STABILITY_API_KEY:
            story_with_images = build_story_with_images(
                story_text=story_text,
                topic=tale_title,
                genre='fairy tale',
                max_images=3
            )

        response_payload = {
            'success': True,
            'tale': tale_id,
            'region': region,
            'story': story_text
        }

        if story_with_images:
            response_payload['storyWithImages'] = story_with_images
            response_payload['hasImages'] = True

        return response_payload
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
