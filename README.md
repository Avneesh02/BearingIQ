# 🔩 BearingIQ — Intelligent Bearing Fault Diagnosis

> **From vibration signals to intelligent fault predictions.** BearingIQ is an end-to-end machine learning and full-stack predictive maintenance system that detects bearing faults using vibration-derived features and explains predictions using SHAP.

## 🚀 Overview

BearingIQ is designed to identify common bearing conditions in industrial and CNC machinery, demonstrating how **machine learning can support predictive maintenance** and reduce unexpected equipment failures.

The project combines **Machine Learning, Signal Processing, Explainable AI, Backend APIs, Database Management, Authentication, and Cloud Deployment** into one complete application.

### 🔥 Key Features

* ⚙️ Processes vibration signals and engineers statistical & frequency-domain features
* 🧠 Evaluates **6 machine learning algorithms**
* 🌲 Uses a tuned **Random Forest** production model
* 🔍 Provides **SHAP-based Explainable AI**
* 📊 Generates prediction confidence and class probabilities
* 🏆 Identifies **Top-5 contributing features**
* 🔐 Implements **JWT-based authentication**
* 🗄️ Stores prediction history using **PostgreSQL**
* 🌐 Provides REST APIs using **FastAPI**
* 💻 Provides an interactive **React/Vite dashboard**
* ☁️ Deployed using **Render**

---

## 🧠 Machine Learning Pipeline

```text
CWRU Bearing Dataset
        ↓
Vibration Signal Processing
        ↓
Sliding Window Segmentation
        ↓
Feature Engineering
        ↓
20 Initial Features
        ↓
Feature Selection
        ↓
17 Final Features
        ↓
StandardScaler
        ↓
Model Training & Tuning
        ↓
Random Forest
        ↓
SHAP Explainability
        ↓
Fault Prediction
```

### ⚙️ Feature Engineering

Vibration signals are processed using:

* **2048-sample windows**
* **1024-sample overlap (50%)**
* Time-domain features
* Frequency-domain features

After feature analysis and removal of redundant features, the final model uses **17 engineered features**, including RMS, Standard Deviation, Kurtosis, Crest Factor, Peak-to-Peak, Dominant Frequency, Spectral Energy, Mean Frequency, and Spectral Entropy.

---

## 🤖 Model Development

Six algorithms were evaluated:

```text
Logistic Regression
KNN
SVM
Decision Tree
Random Forest
XGBoost
```

Hyperparameter tuning was performed using **GridSearchCV with 5-fold cross-validation**.

The tuned **Random Forest classifier** was selected as the final production model.

### 📊 Verified Performance

| Metric             |      Score |
| ------------------ | ---------: |
| Accuracy           | **97.79%** |
| Precision          | **97.90%** |
| Recall             | **97.79%** |
| F1 Score           | **97.78%** |
| 5-Fold CV Accuracy | **99.92%** |

---

## 🔍 Explainable AI

BearingIQ uses **SHAP (SHapley Additive exPlanations)** to answer:

> **"Why did the model make this prediction?"**

For each prediction, the system provides:

```text
Fault Class
     ↓
Confidence Score
     ↓
Class Probabilities
     ↓
SHAP Feature Contributions
     ↓
Top-5 Contributing Features
```

This makes the ML predictions more **transparent, interpretable, and actionable**.

---

## 🏗️ System Architecture

```text
                   USER
                     │
                     ▼
             React + Vite
                Frontend
                     │
                REST API
                     │
                     ▼
             FastAPI Backend
             ┌───────┼────────┐
             │       │        │
             ▼       ▼        ▼
        PostgreSQL   ML      SHAP
         Database   Model   Explainability
             │       │        │
             └───────┼────────┘
                     ▼
              Prediction Result
                     │
                     ▼
               React Dashboard
```

### 🔄 Prediction Flow

```text
Login
 ↓
JWT Authentication
 ↓
17 Engineered Features
 ↓
FastAPI
 ↓
StandardScaler
 ↓
Random Forest
 ↓
Prediction + Probabilities
 ↓
SHAP Explanation
 ↓
PostgreSQL
 ↓
React Dashboard
```

---

## 🛠️ Technology Stack

| Category             | Technologies                           |
| -------------------- | -------------------------------------- |
| **Programming**      | Python, JavaScript                     |
| **Machine Learning** | Scikit-learn, Random Forest, XGBoost   |
| **Data Processing**  | NumPy, Pandas, SciPy                   |
| **Explainable AI**   | SHAP                                   |
| **Backend**          | FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| **Frontend**         | React, Vite                            |
| **Database**         | PostgreSQL                             |
| **Authentication**   | JWT, bcrypt, Passlib                   |
| **Visualization**    | Matplotlib, Seaborn, Recharts          |
| **Deployment**       | Render                                 |
| **Version Control**  | Git, GitHub                            |

---


## ☁️ Deployment

BearingIQ is deployed using **Render** with separate frontend, backend, and PostgreSQL services.

```text
GitHub
  │
  ├── React Frontend → Render
  │
  └── FastAPI Backend → Render
           │
           ├── PostgreSQL
           └── ML Model + SHAP
```

**Live Backend:**
[https://bearingiq-r21u.onrender.com](https://bearingiq-r21u.onrender.com)

**API Documentation:**
[https://bearingiq-r21u.onrender.com/docs](https://bearingiq-r21u.onrender.com/docs)

---

## 📌 Project Highlights

* ⚙️ **17** final vibration-derived features
* 🧠 **6** ML algorithms evaluated
* 🌲 **Random Forest** production classifier
* 🎯 **97.79%** test accuracy
* 📈 **99.92%** 5-fold cross-validation accuracy
* 🔍 **SHAP** explainable predictions
* 🔐 **JWT** authentication
* 🗄️ **PostgreSQL** prediction persistence
* ⚡ **FastAPI** REST backend
* 💻 **React/Vite** frontend
* ☁️ **Render** cloud deployment

---

## 🚀 Future Scope

* 📁 Raw sensor CSV upload with automatic feature extraction
* 📡 Real-time IoT vibration monitoring
* ⏳ Remaining Useful Life (RUL) prediction
* 🧠 ML model version management
* 📊 Advanced predictive-maintenance dashboards

---

## 💡 Key Takeaway

**BearingIQ demonstrates the complete journey from vibration data and machine learning experimentation to an explainable, authenticated, database-backed, cloud-deployed AI application.**

> ### **Detect. Explain. Predict. Prevent. 🔩**
