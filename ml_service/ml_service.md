# How to start
#
# 1. Activate the environment
#
#     $ cd ml_service
#     $ conda activate predict_env
#     $ pip install -r requirements.txt
# 2. Run the ML HTTP service
#
#     $ uvicorn main:app --host 0.0.0.0 --port 8000
#