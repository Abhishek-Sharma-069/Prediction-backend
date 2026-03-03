# How to start
#
# 1. Activate the environment
#
#     $ cd ml_service
#     $ conda activate predict_env
#     $ pip install -r requirements.txt
#
# 2. Run the ML HTTP service
#
#     $ python main.py
#
#   Uses PORT and HOST from environment (defaults: port 8000, host 0.0.0.0).
#   Optional: set PORT=3000 and/or HOST=0.0.0.0 in .env (requires python-dotenv) or export before running.
#
#   Alternatively, with uvicorn directly (use the env’s Python so dependencies are found):
#
#     $ python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
