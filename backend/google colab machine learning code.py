# Import necessary libraries
import pandas as pd
from google.colab import drive
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report
import joblib

# Mount Google Drive to access your files
# You will be prompted to authorize this action.
drive.mount('/content/drive')

# --- IMPORTANT ---
# Update this path to the correct location of your CSV file in Google Drive
file_path = '/content/drive/MyDrive/Final project/sri_lanka_universities_with_degrees.csv'

# Load the dataset into a pandas DataFrame
try:
    df = pd.read_csv(file_path)
    print("✅ Dataset loaded successfully!")
except FileNotFoundError:
    print("❌ File not found. Please check the file_path variable and make sure it's correct.")
    # Create a dummy dataframe to prevent errors in subsequent cells if file is not found
    df = pd.DataFrame()

# Display the first 5 rows of the dataframe
print("\nFirst 5 rows of the dataset:")
print(df.head())

# Display information about the dataset, including data types and non-null values
print("\nDataset Information:")
df.info()

# Display summary statistics for numerical columns
print("\nSummary Statistics:")
print(df.describe())

# Check for any missing values
print("\nMissing Values Count:")
print(df.isnull().sum())

# Make a copy of the dataframe to avoid modifying the original
df_processed = df.copy()

# --- Feature Selection ---
# We will drop columns that are either redundant, too specific, or are the target variable itself.
# 'university_id' and 'university_name' are too tied to the target.
# 'program_description' is complex text data that we'll exclude for this first model.
# 'student_id' is just an identifier.
features_to_drop = [
    'student_id', 'university_id', 'university_name', 'location',
    'recommended_university_id'
]

X = df_processed.drop(columns=features_to_drop)
y = df_processed['recommended_university_id']

# --- Data Cleaning & Transformation ---
# Convert boolean columns to integers (0 and 1)
for col in ['al_passed', 'ol_passed', 'hostel_required', 'sports_or_extracurricular', 'hostel_available', 'international_affiliation']:
    if col in X.columns:
        X[col] = X[col].astype(bool).astype(int)

# Identify categorical and numerical features
categorical_features = X.select_dtypes(include=['object']).columns
numerical_features = X.select_dtypes(include=np.number).columns

print(f"Identified Categorical Features: {list(categorical_features)}")
print(f"Identified Numerical Features: {list(numerical_features)}")


# --- Create a Preprocessing Pipeline ---
# This pipeline will apply one-hot encoding to categorical features.
# OneHotEncoder is great because it doesn't assume an order between categories.
# 'handle_unknown='ignore'' will prevent errors if the API receives a category it hasn't seen before.
preprocessor = ColumnTransformer(
    transformers=[
        ('cat', OneHotEncoder(handle_unknown='ignore'), categorical_features)
    ],
    remainder='passthrough' # Keep numerical columns as they are
)

# --- Split the Data ---
# We split the data into training and testing sets.
# The model learns from the training set and we evaluate its performance on the unseen test set.
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

print("\nData has been successfully preprocessed and split.")
print(f"Training set shape: {X_train.shape}")
print(f"Testing set shape: {X_test.shape}")


# Import the model and evaluation metrics
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report

# --- Create the Full Model Pipeline ---
# We combine our preprocessor with the RandomForestClassifier.
# This ensures that the same preprocessing steps are applied consistently
# during training, evaluation, and later for predictions in the API.
model_pipeline = Pipeline(steps=[
    ('preprocessor', preprocessor),
    ('classifier', RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1))
])

# --- Train the Model ---
print("🚀 Starting model training...")
# The .fit() method trains the entire pipeline on our training data.
model_pipeline.fit(X_train, y_train)

print("✅ Model training completed successfully!")

# --- Make Predictions on the Test Set ---
y_pred = model_pipeline.predict(X_test)

# --- Evaluate the Model ---
accuracy = accuracy_score(y_test, y_pred)
print(f"\nModel Accuracy on Test Set: {accuracy:.4f}")

# Display a detailed classification report
print("\nClassification Report:")
print(classification_report(y_test, y_pred))

# Import the joblib library for saving the model
import joblib

# Define the file path in your Google Drive to save the model
model_save_path = '/content/drive/MyDrive/Final project/university_recommendation_model.joblib'

# Save the entire trained pipeline to the specified path
joblib.dump(model_pipeline, model_save_path)

print(f"✅ Model pipeline saved successfully to: {model_save_path}")