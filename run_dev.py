import subprocess
import sys
import threading
import time

def run_flask():
    print("Starting Flask server on port 5001...")
    subprocess.run([sys.executable, "server.py"])

def run_vite():
    print("Starting Vite dev server...")
    # Use shell=True to support windows npx execution
    subprocess.run("npx vite", shell=True)

if __name__ == "__main__":
    flask_thread = threading.Thread(target=run_flask, daemon=True)
    flask_thread.start()
    
    # Wait for the Flask server to spin up
    time.sleep(1)
    
    # Start the Vite development server
    try:
        run_vite()
    except KeyboardInterrupt:
        print("\nShutting down dev servers...")
