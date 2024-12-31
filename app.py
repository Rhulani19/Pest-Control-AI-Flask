import os
from time import time
import numpy as np
from flask import Flask, request, render_template, send_from_directory
import tensorflow as tf
from tensorflow.keras.preprocessing import image
from werkzeug.utils import secure_filename

# Initialize the Flask app
app = Flask(__name__)

# Load your TensorFlow model
model = None  # Initialize the model variable
try:
    model = tf.keras.models.load_model('FarmGuide.keras', compile=False)  # Ensure this path is correct
    print("Model loaded successfully.")
except Exception as e:
    print(f"Error loading model: {e}")

# Define class names based on your training data
class_names = ['Healthy', 'Unhealthy', 'Leaf Blight', 'Leaf Curl', 'Septoria Leaf Spot', 'Verticulium Wilt']

# Disease solutions mapping
disease_solutions = {
    'Healthy': "The plant is thriving, showing no signs of distress or disease. No action needed; continue regular care.For more information ",
    'Unhealthy': "The plant exhibits general signs of stress. Adjust care practices to improve plant health.",
    'Leaf Blight': "Dark, water-soaked lesions on leaves. Solution: Apply an organic fungicide.",
    'Leaf Curl': "Leaves curl upward/downward, possibly due to pests. Solution: Use neem oil to deter pests.",
    'Septoria Leaf Spot': "Small dark spots with yellow halos on leaves. Solution: Remove affected leaves.",
    'Verticulium Wilt': "Causes yellowing of leaves and wilting. Solution: Fertilize the plant to boost its strength."
}

# Function to load and preprocess an image, including a basic validation check
def load_and_preprocess_image(img_path):
    # Load and resize the image
    img = image.load_img(img_path, target_size=(224, 224))  # Match the input size of the model
    img_array = image.img_to_array(img)
    
    # Basic validation: check if image is mostly green (common for plant images)
    green_channel = img_array[:, :, 1]  # Extract green channel
    green_ratio = np.sum(green_channel > 100) / img_array.size  # Check green pixel ratio
    
    # Set a green threshold; adjust based on your dataset's characteristics
    if green_ratio < 0.2:
        return None  # Reject images with less than 20% green content
    
    # Continue processing if it passed the green check
    img_array = np.expand_dims(img_array, axis=0)  # Add batch dimension
    img_array /= 255.0  # Rescale pixel values
    return img_array

# Set a confidence threshold for predictions
CONFIDENCE_THRESHOLD = 0.8  # Increased threshold for stricter filtering

@app.route('/index')
def index():
    return render_template('index.html', predicted_class=None, error_message=None, image_url=None, solution=None, time=int(time()))


@app.route('/chatbot')
def chatbot():
    return render_template('chatbot.html', predicted_class=None, error_message=None, image_url=None, solution=None, time=int(time()))



@app.route('/predict', methods=['POST'])  # Add the route decorator here
def predict():
    error_message = None
    predicted_class = None
    image_url = None
    solution = None

    if model is None:
        error_message = "Model is not loaded. Please check the model file."
        return render_template('index.html', predicted_class=predicted_class, error_message=error_message, image_url=image_url, solution=solution, time=int(time()))

    if 'file' not in request.files:
        error_message = "No file part in the request."
        return render_template('index.html', predicted_class=predicted_class, error_message=error_message, image_url=image_url, solution=solution, time=int(time()))

    file = request.files['file']

    if file.filename == '':
        error_message = "No file selected."
        return render_template('index.html', predicted_class=predicted_class, error_message=error_message, image_url=image_url, solution=solution, time=int(time()))

    if file:
        try:
            # Create static directory if it does not exist
            static_folder = 'static/uploads'
            if not os.path.exists(static_folder):
                os.makedirs(static_folder)

            # Save the uploaded image to a static folder
            img_path = os.path.join(static_folder, secure_filename(file.filename))
            file.save(img_path)

            # Preprocess the image with additional validation
            preprocessed_image = load_and_preprocess_image(img_path)
            
            # If image didn't pass validation, show error
            if preprocessed_image is None:
                error_message = "The uploaded image does not appear to be of a tomato leaf."
                return render_template('index.html', predicted_class=predicted_class, error_message=error_message, image_url=image_url, solution=solution, time=int(time()))

            # Make predictions
            predictions = model.predict(preprocessed_image)

            # Get the highest prediction confidence
            max_confidence = np.max(predictions)
            predicted_index = np.argmax(predictions)

            # Check if confidence meets the threshold and the predicted class is valid
            if max_confidence < CONFIDENCE_THRESHOLD or class_names[predicted_index] not in class_names:
                error_message = "Invalid input: The uploaded image does not match the required dataset of tomato leaves."
            else:
                # Set predicted class, solution, and image URL if valid
                predicted_class = class_names[predicted_index]
                solution = disease_solutions.get(predicted_class, "No solution available.")
                image_url = f"/static/uploads/{secure_filename(file.filename)}"

        except Exception as e:
            error_message = f"Error during prediction: {e}"

    return render_template('index.html', predicted_class=predicted_class, error_message=error_message, image_url=image_url, solution=solution, time=int(time()))
@app.route('/')
def home():
    return render_template('home.html')

@app.route('/login')
def login():
    return render_template('login.html')

@app.route('/signup')
def signup():
    return render_template('signup.html')

@app.route('/services')
def services():
    return render_template('services.html')

@app.route('/location')
def location():
    return render_template('location.html')

@app.route('/learn-more')
def learn_more():
    return render_template('learn-more.html')


@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/about')
def about():
    return render_template('about.html')

# Serve uploaded images from the static folder
@app.route('/static/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory('static/uploads', filename)

# Run the app
if __name__ == '__main__':
    app.run(port=5000)
