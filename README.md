 # Dream Dress-Up Room 

Welcome to **Dream Dress-Up Room**, a cute, cozy, and highly aesthetic pastel-themed fashion dollhouse web game. Built for teenagers and young adults, this application provides an immersive dressing room styling experience where you can customize, name, and collect adorable outfits!

## 🎨 Features & Highlights

1. **Rich Cozy Aesthetics**: Styled with a pastel pink and cream theme, featuring smooth transitions, 3D animated wardrobes, glowing mirrors, moving clouds, and interactive lights.
2. **Dynamic Layer-based Styling**: Character rendering uses crisp, responsive vector SVGs stacked on top of each other.
3. **Full Color Customization**: Every hair, top, bottom, dress, and accessory style can be customized dynamically using a curated fashion color swatches drawer!
4. **Interactive Dialogue Mascot**: A cute rabbit companion welcomes the player, types messages, and comments dynamically as you mix and match styles.
5. **Web Audio Sound Synthesizer**: Fully self-contained sound effects (clicks, wardrobe creaks, save success chimes) and a looping cozy arpeggiated background melody synthesized entirely on-the-fly via the browser's **Web Audio API** (no bulky audio assets required!).
6. **Fashion Diary Database**: Outfits can be saved to the database with a custom styling name, displaying as polaroid photos in a slide-out drawer, allowing you to load them back on the character or delete them.
7. **Outfit Name Generator**: Generates cute, random adjective-noun pairs (e.g. *Pastel Pixie*, *Cozy Marshmallow*, *Sweet Daisy*) for outfit labeling.
8. **High-Res Screenshot Downloads**: Compiles the character, equipped layers, and background decoration directly onto a high-quality Canvas and exports it as a PNG photo watermark card.

---

## 🛠️ Technology Stack

- **Backend**: Python 3 (Flask framework)
- **Database**: SQLite3 (lightweight, zero-config relational storage)
- **Frontend Structure**: Semantic HTML5 (organized layout, high accessibility)
- **Frontend Styling**: Vanilla CSS3 (custom CSS variables, responsive grids, 3D transforms, keyframe animations)
- **Frontend Logic**: Vanilla JavaScript (ES6+, DOM manipulation, canvas serialization, Web Audio API synth)

---

## 📂 Project Directory Structure

```text
bq-release-notes/
├── app.py                  # Flask backend server, SQLite DB, and naming API
├── database.db             # SQLite Database (auto-created on start)
├── requirements.txt        # Backend dependencies (Flask)
├── README.md               # Game documentation
├── templates/
│   └── index.html          # Main HTML game document
└── static/
    ├── css/
    │   └── styles.css      # Core design system stylesheet & animations
    ├── js/
    │   └── game.js         # Dress-up SVGs, sound engine, and client logic
    └── images/
        └── logo.png        # Generated game logo
```

---

## How to Run the Game Locally

### 1. Pre-requisites
Ensure you have Python 3 and pip installed.

### 2. Install Dependencies
Navigate to the project directory and run:
```bash
pip install -r requirements.txt
```

### 3. Launch the Server
Start the Flask application by running:
```bash
python app.py
```
This will run the server locally on **`http://127.0.0.1:5001`**.

### 4. Open in Browser
Open your browser and visit: [http://127.0.0.1:5001](http://127.0.0.1:5001)


---

## Styling Details & Controls

- **Wardrobe Drawer**: Click **Open Wardrobe** to swing open the 3D doors. Inside, click on any item to equip/de-equip it. Use the bottom drawer color palette to recolor the selected item instantly.
- **Randomize**: Click the **Randomize** button to generate a fully styled random outfit, random name, and skin tone.
- **Save Look**: Name your outfit in the bottom text bar (or click the refresh icon to generate a random name), then click **Save Look** to store it in your diary.
- **Fashion Diary**: Click the **Fashion Diary** button in the header navigation to view all saved outfits. Click **Wear** to re-equip a look, or **Trash** to delete it from the SQLite database.
- **Download**: Click **Download** to compile your current scene and download it as a PNG card directly to your computer.
