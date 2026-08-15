BearingIQ
Intelligent Bearing Fault Diagnosis System

End-to-end machine learning application for bearing fault classification using vibration-derived features, explainable AI, FastAPI, React, and PostgreSQL.

Overview:

BearingIQ is an end-to-end machine learning and web application designed to classify faults in rolling-element bearings used in industrial and CNC machinery. It uses vibration-derived statistical and frequency-domain features with a trained Random Forest classifier.

•	User authentication
•	Machine learning fault prediction
•	Prediction probabilities
•	SHAP-based explainable AI
•	Top contributing features
•	PostgreSQL prediction history
•	Active model management
•	Model performance dashboard
•	Random/demo prediction
•	REST API
•	Cloud deployment using Render

Why BearingIQ?

Bearing failures can cause unplanned downtime, production losses, expensive maintenance, and unexpected equipment failures. BearingIQ demonstrates a predictive-maintenance approach rather than keeping the ML model isolated in a notebook.
Vibration Data → Feature Engineering → Machine Learning → Fault Classification → Explainable Prediction

System Architecture:

USER
  │
  ▼
React + Vite Frontend
  │  REST API / JSON
  ▼
FastAPI Backend
  ├── Authentication
  ├── Prediction API
  └── Model Management
       │
       ├── PostgreSQL
       │   ├── users
       │   ├── models
       │   ├── predictions
       │   └── refresh_tokens
       │
       ├── ML Pipeline
       │   ├── StandardScaler
       │   ├── Random Forest
       │   └── Label Encoder
       │
       └── SHAP Explainability
               │
               ▼
      Prediction + Confidence
      Probabilities + SHAP
      + Top Features
      
Complete Prediction Flow :

Login → JWT Authentication → Prediction Page
→ 17 Engineered Features → FastAPI
→ Validate Input → Load Active Model
→ StandardScaler → Random Forest
→ Class Probabilities → SHAP Explanation
→ Top 5 Features → PostgreSQL
→ Result returned to React

Machine Learning Pipeline:
The project was developed through seven major phases.

Phase 1 — Dataset & Data Loading
The project uses the Case Western Reserve University (CWRU) Bearing Dataset. MATLAB .mat vibration files are loaded and associated with bearing-condition labels.
•	Normal
•	Ball Fault
•	Inner Race Fault
•	Outer Race Fault

Phase 2 — Data Validation & Splitting
The dataset is validated for file availability, signal integrity, signal length, and label consistency. An 80/20 stratified train/test split is used.

Phase 3 — Feature Engineering
Vibration signals are divided into overlapping windows.
Window Size: 2048 samples
Overlap: 1024 samples (50%)
The pipeline initially extracts 20 time-domain and frequency-domain features.

Phase 4 — Feature Analysis & Selection
EDA includes class distributions, feature distributions, pair plots, correlation analysis, and heatmaps. StandardScaler is fitted on training data. Three redundant features are removed:
•	Variance
•	Peak
•	Spectral_Centroid
The final production model uses 17 features.
Final 17 Model Features
•	Mean
•	Standard_Deviation
•	RMS
•	Maximum
•	Minimum
•	Peak_to_Peak
•	Skewness
•	Kurtosis
•	Crest_Factor
•	Shape_Factor
•	Impulse_Factor
•	Clearance_Factor
•	Dominant_Frequency
•	Maximum_FFT_Magnitude
•	Spectral_Energy
•	Mean_Frequency
•	Spectral_Entropy
artifacts/feature_list.csv

Phase 5 — Model Training & Tuning
Algorithms evaluated:
•	Logistic Regression
•	K-Nearest Neighbors
•	Support Vector Machine
•	Decision Tree
•	Random Forest
•	XGBoost

Hyperparameter tuning uses GridSearchCV with 5-fold cross-validation. Models are evaluated using Accuracy, Precision, Recall, F1, Confusion Matrix, and Classification Report. Random Forest was selected as the final production model.

Final Model & Artifacts

models/final/final_random_forest.pkl
models/standard_scaler.pkl
artifacts/feature_list.csv
artifacts/label_encoder.pkl
Verified Model Performance
Metric	Score
Accuracy	97.79%
Precision	97.90%
Recall	97.79%
F1 Score	97.78%
5-Fold Cross Validation	99.92%

Phase 6 — Explainable AI with SHAP
BearingIQ uses SHAP (SHapley Additive exPlanations) to calculate feature contributions for individual predictions and return the top contributing features.
Prediction → SHAP Analysis → Feature Contributions → Rank → Top 5 Features

Phase 7 — PostgreSQL Database
Main tables:
•	users
•	models
•	predictions
•	refresh_tokens

The models table stores model metadata, metrics, active status, and model path. The predictions table stores user/model references, predicted label, confidence, probabilities, input features, SHAP values, top features, and timestamps.
Authentication & Security
•	JWT access tokens
•	Refresh tokens
•	bcrypt password hashing
•	Passlib
•	python-jose

Protected prediction and history endpoints require authenticated requests. Refresh tokens can be revoked during logout.
Backend — FastAPI

Endpoint	Method	Description
/api/auth/register	POST	Register a user
/api/auth/login	POST	Login and obtain tokens
/api/auth/refresh	POST	Refresh access token
/api/auth/logout	POST	Revoke refresh token
/api/prediction/predict	POST	Run bearing fault prediction
/api/prediction/predict-random	POST	Run demo prediction
/api/prediction/history	GET	Retrieve prediction history
/api/prediction/history	DELETE	Clear prediction history
/api/prediction/model	GET	Retrieve active model information
/api/prediction/{id}	GET	Retrieve prediction details
/health	GET	API health check
/docs	GET	Interactive Swagger documentation

Frontend — React + Vite
Page	Purpose
Login	User authentication
Register	New user registration
Dashboard	Overview and statistics
Prediction	Submit features and generate predictions
Prediction Details	View prediction explanation
History	View previous predictions
Model	View active model and performance
Profile	User-related information

Prediction Result
•	Prediction label
•	Confidence
•	Class probabilities
•	SHAP values
•	Top features
•	Prediction timestamp

Example:
Prediction: Normal
Confidence: 40%
Ball: 16.5% | Inner Race: 35.5%
Normal: 40.0% | Outer Race: 8.0%

Demo Prediction
BearingIQ includes a Random Demo Prediction feature for testing and demonstrations. Demo values are not intended to represent real sensor measurements.

Technology Stack:

Layer	Technologies
Programming	Python, JavaScript
Machine Learning	Scikit-learn, Random Forest, XGBoost
Explainable AI	SHAP
Data Processing	NumPy, Pandas, SciPy
Visualization	Matplotlib, Seaborn, Recharts
Backend	FastAPI, Uvicorn
ORM	SQLAlchemy
Validation	Pydantic
Authentication	JWT, bcrypt, python-jose
Database	PostgreSQL
Frontend	React, Vite
UI	Tailwind CSS, Framer Motion, Lucide
Deployment	Render
Version Control	Git, GitHub


Project Structure:

BearingIQ/
├── data/
├── notebooks/
│   ├── Phase_2/ ... Phase_7/
├── models/
│   ├── baseline/
│   ├── tuned/
│   ├── final/
│   │   └── final_random_forest.pkl
│   └── standard_scaler.pkl
├── artifacts/
│   ├── feature_list.csv
│   └── label_encoder.pkl
├── results/
│   └── shap/
├── src/
│   ├── data_loader/
│   ├── preprocessing/
│   ├── feature_eng/
│   ├── feature_selection/
│   ├── models/
│   ├── evaluation/
│   ├── explainability/
│   └── validation/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── core/
│   │   ├── api/
│   │   ├── services/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── database/
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── database/
│   ├── database.sql
│   ├── models.sql
│   ├── predictions.sql
│   ├── refresh_tokens.sql
│   └── users.sql
├── scripts/
└── README.md

Current Prediction Input :

The current prediction API expects the 17 engineered features listed in this README. The deployed application does not require users to upload the original CWRU .mat dataset.

Future Improvements:

Raw Sensor CSV Upload — Allow users to upload raw vibration/sensor CSV files and automatically perform signal processing, windowing, feature extraction, scaling, prediction, and SHAP explanation.

Real-Time Sensor Monitoring — Integrate industrial or IoT vibration sensors for continuous monitoring and real-time fault alerts.

Remaining Useful Life Prediction — Extend the system from fault classification to Remaining Useful Life estimation.

Model Version Management — Allow administrators to upload, compare, activate, deactivate, and roll back trained model versions.

Advanced Monitoring Dashboard — Add bearing-health trends, maintenance alerts, sensor monitoring, time-series visualization, and fault progression analysis.

Key Technical Concepts:
Sliding Window — Divides a long vibration signal into smaller overlapping segments.
Standardization — Normalizes features with different numerical ranges using StandardScaler.
Random Forest — Combines multiple decision trees to produce a robust classification.
SHAP — Explains individual predictions through feature contribution values.
JWT Authentication — Protects authenticated API endpoints and supports refresh/revocation.

Project Highlights:
•	17 final vibration-derived features
•	6 ML algorithms evaluated
•	Random Forest selected as final model
•	97.79% accuracy
•	97.90% precision
•	97.79% recall
•	97.78% F1 score
•	99.92% 5-fold cross-validation accuracy
•	SHAP explainability
•	JWT authentication
•	PostgreSQL persistence
•	FastAPI REST API
•	React/Vite frontend
•	Render cloud deployment



