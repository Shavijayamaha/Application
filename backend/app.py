# app.py
# --- 1. Import Libraries ---
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import joblib
import pandas as pd
import os
from dotenv import load_dotenv
import openai
import requests
from bs4 import BeautifulSoup
from googlesearch import search 
from datetime import datetime
import re

# --- 2. Load Environment Variables ---
load_dotenv()

# --- 3. Initialize Flask App ---
app = Flask(__name__)
CORS(app)

# --- 4. Configure MongoDB ---
app.config['MONGO_URI'] = os.getenv('MONGO_URI')  # e.g., mongodb://localhost:27017/university_db
mongo = PyMongo(app)

# --- 5. Initialize Bcrypt ---
bcrypt = Bcrypt(app)

# --- 6. Load ML Model ---
MODEL_PATH = 'C:/Users/User/Desktop/2 Sem/FinalProjectDoc/Application1/backend/university_recommendation_model.joblib'
try:
    model = joblib.load(MODEL_PATH)
    print("✅ Model loaded successfully!")
except Exception as e:
    print(f"❌ Model load error: {e}")
    model = None

# --- 7. OpenAI API Key ---
openai.api_key = os.getenv("OPENAI_API_KEY")

# --- 8. Ensure Admin User Exists ---
def ensure_admin_user():
    existing_admin = mongo.db.users.find_one({"username": "admin"})
    if not existing_admin:
        hashed_pw = bcrypt.generate_password_hash("admin123").decode("utf-8")
        mongo.db.users.insert_one({
            "username": "admin",
            "password": hashed_pw,
            "user_type": "admin",
            "full_name": "Administrator",
            "email": "admin@example.com",
            "age": None,
            "city": None
        })
        print("✅ Admin user created (username=admin, password=admin123)")
    else:
        print("ℹ️ Admin user already exists")

ensure_admin_user()

# --- 9. Auth Routes ---
@app.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    full_name = data.get('full_name')
    email = data.get('email')
    age = data.get('age')
    city = data.get('city')
    user_type = data.get('user_type', 'user')

    if not username or not password:
        return jsonify({'error': 'Username and password are required'}), 400
    if mongo.db.users.find_one({'username': username}):
        return jsonify({'error': 'Username already exists'}), 409

    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    mongo.db.users.insert_one({
        'username': username,
        'password': hashed_pw,
        'user_type': user_type,
        'full_name': full_name,
        'email': email,
        'age': age,
        'city': city
    })
    return jsonify({'message': 'User created successfully'}), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = mongo.db.users.find_one({'username': username})

    if user and bcrypt.check_password_hash(user['password'], password):
        user_data = {
            "username": user['username'],
            "user_type": user['user_type'],
            "full_name": user.get('full_name'),
            "email": user.get('email'),
            "age": user.get('age'),
            "city": user.get('city')
        }
        return jsonify({'message': 'Login successful', 'user': user_data}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401

# --- 10. User Profile Routes ---
@app.route('/api/user/profile', methods=['GET'])
def get_profile():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username is required"}), 400
    user = mongo.db.users.find_one({"username": username}, {"password": 0})
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["_id"] = str(user["_id"])
    return jsonify(user), 200

@app.route('/api/user/update', methods=['PUT'])
def update_profile():
    data = request.get_json()
    username = data.get('username')
    if not username:
        return jsonify({"error": "Username is required"}), 400
    mongo.db.users.update_one({"username": username}, {"$set": data})
    return jsonify({"message": "Profile updated successfully"}), 200

@app.route('/api/user/delete', methods=['DELETE'])
def delete_profile():
    username = request.args.get('username')
    if not username:
        return jsonify({"error": "Username is required"}), 400
    mongo.db.users.delete_one({"username": username})
    return jsonify({"message": "User deleted successfully"}), 200

# --- 11. University Recommendation API ---
@app.route('/api/predict', methods=['POST'])
def predict():
    if model is None:
        return jsonify({'error': 'Model not loaded'}), 500
    try:
        data = request.get_json()
        input_df = pd.DataFrame(data, index=[0])
        prediction = model.predict(input_df)
        predicted_university_id = prediction[0]
        return jsonify({'recommended_university_id': predicted_university_id}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# --- 12. University Routes ---
@app.route('/api/universities', methods=['GET'])
def get_universities():
    universities = list(mongo.db.universities.find({}, {"_id": 0}))
    return jsonify(universities), 200

@app.route('/api/universities/search', methods=['GET'])
def search_universities():
    query = request.args.get('q', '')
    if not query:
        return jsonify([]), 200
    
    # Use case-insensitive regex search on the 'name' field
    # The 're.compile' and 're.IGNORECASE' make it case-insensitive
    regex_pattern = re.compile(f".*{re.escape(query)}.*", re.IGNORECASE)
    
    universities = list(mongo.db.universities.find({"name": {"$regex": regex_pattern}}, {"_id": 0}))
    return jsonify(universities), 200

# --- 13. Admin Routes ---
@app.route('/api/admin/universities', methods=['GET'])
def get_admin_universities():
    universities = list(mongo.db.universities.find({}, {"_id": 0}))
    return jsonify(universities), 200

@app.route('/api/admin/universities', methods=['POST'])
def add_university():
    data = request.get_json()
    required_fields = ['university_id', 'name', 'location', 'ranking', 'website']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required university fields"}), 400
    if mongo.db.universities.find_one({"university_id": data['university_id']}):
        return jsonify({"error": "University ID already exists"}), 409
    mongo.db.universities.insert_one(data)
    return jsonify({"message": "University added successfully"}), 201

@app.route('/api/admin/universities/<university_id>', methods=['PUT'])
def update_university(university_id):
    data = request.get_json()
    result = mongo.db.universities.update_one({"university_id": university_id}, {"$set": data})
    if result.matched_count == 0:
        return jsonify({"error": "University not found"}), 404
    return jsonify({"message": "University updated successfully"}), 200

@app.route('/api/admin/universities/<university_id>', methods=['DELETE'])
def delete_university(university_id):
    result = mongo.db.universities.delete_one({"university_id": university_id})
    if result.deleted_count == 0:
        return jsonify({"error": "University not found"}), 404
    return jsonify({"message": "University deleted successfully"}), 200

# --- 14. OpenAI Chat Route ---
@app.route('/api/openai/chat', methods=['POST'])
def chat_with_openai():
    data = request.get_json()
    prompt = data.get('prompt')
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    try:
        client = openai.OpenAI(api_key=openai.api_key)
        response = client.chat.completions.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=500
        )
        answer = response.choices[0].message.content
        return jsonify({"response": answer}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
# --- 15. New Route: Get Latest University Info ---
@app.route('/api/university/update-info', methods=['POST'])
def get_updated_university_info():
    try:
        data = request.get_json()
        university_id = data.get('university_id')

        if not university_id:
            return jsonify({"error": "University ID is required"}), 400

        university = mongo.db.universities.find_one({"university_id": university_id})
        if not university:
            return jsonify({"error": "University not found"}), 404

        university_name = university.get("name")
        website = university.get('website')

        text_content = ""

        # --- Try fetching the website first ---
        if website:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
            try:
                res = requests.get(website, headers=headers, timeout=10)
                res.raise_for_status()
                soup = BeautifulSoup(res.text, 'html.parser')
                content_blocks = []
                for tag in soup.find_all(['p', 'h1', 'h2', 'h3']):
                    text = tag.get_text(strip=True)
                    if text:
                        content_blocks.append(text)
                text_content = " ".join(content_blocks)[:3000]  # Limit for OpenAI
            except requests.exceptions.RequestException:
                text_content = ""  # Ignore website fetch errors

        # --- If website fetch failed, try Google search ---
        if not text_content:
            try:
                search_results = list(search(f"{university_name} official website", num_results=3))
                google_texts = []
                for url in search_results:
                    try:
                        res = requests.get(url, headers={"User-Agent": "Mozilla/5.0"}, timeout=5)
                        res.raise_for_status()
                        soup = BeautifulSoup(res.text, 'html.parser')
                        for tag in soup.find_all(['p', 'h1', 'h2', 'h3']):
                            text = tag.get_text(strip=True)
                            if text:
                                google_texts.append(text)
                    except:
                        continue
                text_content = " ".join(google_texts)[:3000]
            except:
                text_content = ""  # Ignore Google fetch errors

        # --- If no content found, generate generic AI info ---
        if not text_content:
            text_content = f"Provide a professional summary about {university_name}, a university located in {university.get('location', 'Sri Lanka')}, with a ranking of {university.get('ranking', 'unknown')}."

        # --- OpenAI summary generation ---
        prompt = f"""
        You are an assistant that provides concise and professional university information.
        Based on the following extracted content, give a short and updated summary about the university in 2-3 paragraphs:

        {text_content}
        """

        response = openai.chat.completions.create(
            model="gpt-4-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.6,
            max_tokens=500
        )

        answer = response.choices[0].message.content.strip()

        return jsonify({
            "university_id": university_id,
            "university_name": university_name,
            "updated_info": answer
        }), 200

    except Exception as e:
        return jsonify({"error": f"Unexpected server error: {str(e)}"}), 500

@app.route('/api/bookings', methods=['POST'])
def add_booking():
    data = request.get_json()
    required_fields = ['user_email', 'university_id']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: user_email and university_id"}), 400

    try:
        new_booking = {
            "user_email": data['user_email'],
            "university_id": data['university_id'],
            "booking_date": datetime.now()
        }
        mongo.db.booking.insert_one(new_booking)
        return jsonify({"message": "Booking added successfully"}), 200
    except Exception as e:
        return jsonify({"error": f"Error adding booking: {str(e)}"}), 500
        
@app.route('/api/feedback/submit-rating', methods=['POST'])
def submit_rating():
    data = request.get_json()
    required_fields = ['user_email', 'university_id', 'rating']
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields: user_email, university_id, and rating"}), 400

    try:
        # Check if the user has already rated this university using their email
        existing_rating = mongo.db.feedback.find_one({
            "user_email": data['user_email'],
            "university_id": data['university_id']
        })

        if existing_rating:
            # Update the existing rating
            mongo.db.feedback.update_one(
                {"_id": existing_rating["_id"]},
                {"$set": {"rating": data['rating'], "timestamp": datetime.now()}}
            )
            return jsonify({"message": "Rating updated successfully"}), 200
        else:
            # Insert a new rating
            new_rating = {
                "user_email": data['user_email'],
                "university_id": data['university_id'],
                "rating": data['rating'],
                "timestamp": datetime.now()
            }
            mongo.db.feedback.insert_one(new_rating)
            return jsonify({"message": "Rating submitted successfully"}), 201

    except Exception as e:
        return jsonify({"error": f"Error submitting rating: {str(e)}"}), 500


@app.route('/api/feedback/average-rating/<university_id>', methods=['GET'])
def get_average_rating(university_id):
    try:
        ratings = list(mongo.db.feedback.find({"university_id": university_id}))
        
        if not ratings:
            return jsonify({"average_rating": 0, "count": 0}), 200
            
        total_rating = sum(r['rating'] for r in ratings)
        count = len(ratings)
        average = total_rating / count
        
        return jsonify({
            "average_rating": average,
            "count": count
        }), 200

    except Exception as e:
        return jsonify({"error": f"Error calculating average rating: {str(e)}"}), 500

@app.route('/api/admin/bookings', methods=['GET'])
def get_all_bookings():
    """
    Retrieves all booking records from the database.
    """
    try:
        bookings = list(mongo.db.booking.find({}))
        for booking in bookings:
            booking['_id'] = str(booking['_id'])
            booking['booking_date'] = booking['booking_date'].isoformat()
        return jsonify(bookings), 200
    except Exception as e:
        return jsonify({"error": f"Error fetching bookings: {str(e)}"}), 500

@app.route('/api/admin/feedback', methods=['GET'])
def get_all_feedback():
    """
    Retrieves all feedback records from the database.
    """
    try:
        feedback = list(mongo.db.feedback.find({}))
        for item in feedback:
            item['_id'] = str(item['_id'])
            item['timestamp'] = item['timestamp'].isoformat()
        return jsonify(feedback), 200
    except Exception as e:
        return jsonify({"error": f"Error fetching feedback: {str(e)}"}), 500


# --- 16. Root Endpoint ---
@app.route('/')
def home():
    return "<h1>University Recommendation API</h1><p>Server is running.</p>"

# --- 17. Run App ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)