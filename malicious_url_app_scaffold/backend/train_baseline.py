import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score
import joblib

# Load the dataset
data = pd.read_csv('malicious_url_app_scaffold/backend/malicious_phish.csv')

# Separate features and labels
urls = data['url']
labels = data['type']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(urls, labels, test_size=0.2, random_state=42)

# Vectorize the URLs
vectorizer = TfidfVectorizer()
X_train_vectorized = vectorizer.fit_transform(X_train)
X_test_vectorized = vectorizer.transform(X_test)

# Train the model
model = LogisticRegression()
model.fit(X_train_vectorized, y_train)

# Make predictions
y_pred = model.predict(X_test_vectorized)

# Evaluate the model
accuracy = accuracy_score(y_test, y_pred)
print(f'Accuracy: {accuracy}')

# Save the model and the vectorizer
joblib.dump(model, 'malicious_url_model.pkl')
joblib.dump(vectorizer, 'vectorizer.pkl')
