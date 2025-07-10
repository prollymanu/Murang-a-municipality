import uuid
import datetime

def generate_unique_id(prefix):
    return f"{prefix}-{uuid.uuid4().hex[:6].upper()}"

def get_greeting():
    hour = datetime.datetime.now().hour
    if hour < 12:
        return "Good Morning"
    elif hour < 17:
        return "Good Afternoon"
    else:
        return "Good Evening"
