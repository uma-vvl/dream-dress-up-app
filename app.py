import os
import random
import sqlite3
import json
from flask import Flask, render_template, jsonify, request

app = Flask(__name__)
DATABASE = os.path.join(app.root_path, 'database.db')

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS outfits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                configuration TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        conn.commit()

# Initialize database on startup
init_db()

# Adjectives and Nouns for generating cute outfit names
NAME_ADJECTIVES = [
    "Pastel", "Cozy", "Strawberry", "Dreamy", "Marshmallow", 
    "Bubblegum", "Lavender", "Peach", "Sugar", "Chic", 
    "Golden", "Midnight", "Sparkly", "Vintage", "Fairy",
    "Cotton Candy", "Daisy", "Fluffy", "Velvet", "Sweet"
]

NAME_NOUNS = [
    "Princess", "Angel", "Breeze", "Lover", "Pixie", 
    "Blossom", "Dolly", "Glow", "Cutie", "Wanderer", 
    "Starlight", "Honey", "Cloud", "Charm", "Babe", 
    "Petal", "Mallow", "Pudding", "Bunny", "Muse"
]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/outfits', methods=['GET'])
def get_outfits():
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM outfits ORDER BY created_at DESC")
        rows = cursor.fetchall()
        
        outfits = []
        for row in rows:
            outfits.append({
                'id': row['id'],
                'name': row['name'],
                'configuration': json.loads(row['configuration']),
                'created_at': row['created_at']
            })
        conn.close()
        return jsonify(outfits), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/outfits', methods=['POST'])
def save_outfit():
    try:
        data = request.get_json()
        if not data or 'name' not in data or 'configuration' not in data:
            return jsonify({'error': 'Missing name or configuration'}), 400
        
        name = data['name'].strip()
        if not name:
            name = "Unnamed Style"
            
        configuration = json.dumps(data['configuration'])
        
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO outfits (name, configuration) VALUES (?, ?)",
            (name, configuration)
        )
        conn.commit()
        new_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'message': 'Outfit saved successfully!',
            'id': new_id,
            'name': name,
            'configuration': data['configuration']
        }), 201
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/outfits/<int:outfit_id>', methods=['DELETE'])
def delete_outfit(outfit_id):
    try:
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM outfits WHERE id = ?", (outfit_id,))
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({'error': 'Outfit not found'}), 404
            
        cursor.execute("DELETE FROM outfits WHERE id = ?", (outfit_id,))
        conn.commit()
        conn.close()
        return jsonify({'message': 'Outfit deleted successfully!'}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate_name', methods=['GET'])
def generate_name():
    adj = random.choice(NAME_ADJECTIVES)
    noun = random.choice(NAME_NOUNS)
    return jsonify({'name': f"{adj} {noun}"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5001)
