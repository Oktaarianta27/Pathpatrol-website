from app import create_app
import os

app = create_app()

if __name__ == "__main__":
    host = os.getenv("FLASK_HOST") 
    port = int(os.getenv("FLASK_PORT"))
    app.run(host=host, port=port)