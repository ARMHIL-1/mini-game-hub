from flask import Flask, jsonify, request, g, send_from_directory
import os
import sqlite3
import datetime
import random

app = Flask(__name__, static_folder=None)
DATABASE = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gamehub.db')
DIST_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'dist')

def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row
        db.set_trace_callback(lambda sql: print(f"\n[DATABASE EVENT] {sql.strip()}"))
    return db

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

def init_db():
    with app.app_context():
        db = get_db()
        # Create leaderboard table
        db.execute('''
            CREATE TABLE IF NOT EXISTS leaderboard (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                game TEXT NOT NULL,
                score TEXT NOT NULL,
                value INTEGER NOT NULL,
                difficulty TEXT,
                date TEXT NOT NULL
            )
        ''')
        # Create stats table
        db.execute('''
            CREATE TABLE IF NOT EXISTS stats (
                key TEXT PRIMARY KEY,
                value INTEGER NOT NULL
            )
        ''')
        # Create players table
        db.execute('''
            CREATE TABLE IF NOT EXISTS players (
                username TEXT PRIMARY KEY,
                registered_at TEXT NOT NULL
            )
        ''')
        
        # Initialize stats if empty
        db.execute("INSERT OR IGNORE INTO stats (key, value) VALUES ('total_games_played', 1250)")
        db.execute("INSERT OR IGNORE INTO stats (key, value) VALUES ('active_users', 45)")
        db.commit()

        # Seed players if empty
        cursor = db.execute("SELECT COUNT(*) FROM players")
        if cursor.fetchone()[0] == 0:
            now = datetime.datetime.now().isoformat()
            players_seed = [
                ('Player One', now),
                ('Speedy', now),
                ('GameMaster', now),
                ('Brainiac', now),
                ('Legend', now),
                ('TicTacKing', now),
            ]
            db.executemany('INSERT INTO players (username, registered_at) VALUES (?, ?)', players_seed)
            db.commit()

        # Seed initial leaderboard if empty
        cursor = db.execute("SELECT COUNT(*) FROM leaderboard")
        if cursor.fetchone()[0] == 0:
            now = datetime.datetime.now().isoformat()
            seed_data = [
                ('Player One', 'Reaction Timer', '210ms', 210, None, now),
                ('Speedy', 'Reaction Timer', '185ms', 185, None, now),
                ('GameMaster', 'Number Guess', '3 attempts', 3, 'Medium', now),
                ('Brainiac', 'Number Guess', '2 attempts', 2, 'Hard', now),
                ('Legend', 'Tic Tac Toe', '50 wins', 50, None, now),
                ('TicTacKing', 'Tic Tac Toe', '35 wins', 35, None, now),
            ]
            db.executemany('''
                INSERT INTO leaderboard (name, game, score, value, difficulty, date)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', seed_data)
            db.commit()

# Initialize DB on import/startup
init_db()

# CORS Middleware (Lightweight manual implementation)
@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization'
    response.headers['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,OPTIONS'
    return response

# API Routes
@app.route('/api/status', methods=['GET', 'OPTIONS'])
def status():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
    return jsonify({'status': 'online'})

@app.route('/api/register', methods=['POST', 'OPTIONS'])
def register():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
        
    data = request.get_json() or {}
    username = data.get('username', '').strip()
    
    if not username:
        return jsonify({'error': 'Username is required'}), 400
        
    if len(username) < 3 or len(username) > 15:
        return jsonify({'error': 'Username must be between 3 and 15 characters'}), 400
        
    db = get_db()
    cursor = db.execute('SELECT username FROM players WHERE username = ?', (username,))
    if cursor.fetchone():
        return jsonify({'error': 'Username already taken'}), 400
        
    now = datetime.datetime.now().isoformat()
    db.execute('INSERT INTO players (username, registered_at) VALUES (?, ?)', (username, now))
    db.commit()
    return jsonify({'success': True, 'username': username}), 201

@app.route('/api/players/check', methods=['GET', 'OPTIONS'])
def check_player():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
        
    username = request.args.get('username', '').strip()
    if not username:
        return jsonify({'registered': False})
        
    db = get_db()
    cursor = db.execute('SELECT username FROM players WHERE username = ?', (username,))
    if cursor.fetchone():
        return jsonify({'registered': True})
    return jsonify({'registered': False})

@app.route('/api/leaderboard', methods=['GET', 'POST', 'OPTIONS'])
def handle_leaderboard():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
        
    db = get_db()
    if request.method == 'POST':
        data = request.get_json() or {}
        name = data.get('name')
        game = data.get('game')
        score = data.get('score')
        value = data.get('value')
        difficulty = data.get('difficulty')
        
        if not name or not game or not score or value is None:
            return jsonify({'error': 'Missing required fields'}), 400
            
        now = datetime.datetime.now().isoformat()
        db.execute(
            'INSERT INTO leaderboard (name, game, score, value, difficulty, date) VALUES (?, ?, ?, ?, ?, ?)',
            (name, game, score, int(value), difficulty, now)
        )
        db.commit()
        return jsonify({'success': True}), 201
        
    else:
        game = request.args.get('game')
        if game:
            # Sort order: ascending for reaction speed / attempts (lower is better), descending for wins
            if game == 'Reaction Timer' or game == 'Number Guess':
                order = 'ASC'
            else:
                order = 'DESC'
            cursor = db.execute(
                f'SELECT name, game, score, value, difficulty, date FROM leaderboard WHERE game = ? ORDER BY value {order} LIMIT 50',
                (game,)
            )
        else:
            cursor = db.execute('SELECT name, game, score, value, difficulty, date FROM leaderboard ORDER BY date DESC LIMIT 50')
            
        scores = []
        for row in cursor.fetchall():
            scores.append({
                'name': row['name'],
                'game': row['game'],
                'score': row['score'],
                'value': row['value'],
                'difficulty': row['difficulty'],
                'date': row['date']
            })
        return jsonify(scores)

@app.route('/api/stats', methods=['GET', 'OPTIONS'])
def get_stats():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
        
    db = get_db()
    # Total games played
    cursor = db.execute("SELECT value FROM stats WHERE key = 'total_games_played'")
    row = cursor.fetchone()
    total_games_played = row['value'] if row else 1250
    
    # Active users
    cursor = db.execute("SELECT value FROM stats WHERE key = 'active_users'")
    row = cursor.fetchone()
    active_users = row['value'] if row else 45
    
    # Trending game
    cursor = db.execute("SELECT game, COUNT(*) as count FROM leaderboard GROUP BY game ORDER BY count DESC LIMIT 1")
    row = cursor.fetchone()
    trending_game = row['game'] if row else 'Reaction Timer'
    
    return jsonify({
        'totalGamesPlayed': total_games_played,
        'activeUsers': active_users,
        'trendingGame': trending_game
    })

@app.route('/api/stats/increment', methods=['POST', 'OPTIONS'])
def increment_stats():
    if request.method == 'OPTIONS':
        return jsonify({'status': 'ok'})
        
    db = get_db()
    db.execute("UPDATE stats SET value = value + 1 WHERE key = 'total_games_played'")
    
    # Fluctuate active users slightly (e.g. +/- 2, min 10, max 100)
    cursor = db.execute("SELECT value FROM stats WHERE key = 'active_users'")
    row = cursor.fetchone()
    active = row['value'] if row else 45
    active = max(10, min(100, active + random.randint(-2, 2)))
    db.execute("UPDATE stats SET value = ? WHERE key = 'active_users'", (active,))
    
    db.commit()
    return jsonify({'success': True})

# Serving the Vite build in production
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(os.path.join(DIST_FOLDER, path)):
        return send_from_directory(DIST_FOLDER, path)
    else:
        return send_from_directory(DIST_FOLDER, 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5001))
    # Run on 0.0.0.0 to match the Express port binding
    app.run(host='0.0.0.0', port=port, debug=True)
