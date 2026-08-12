import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Prediction from "./pages/Prediction";
import History from "./pages/History";
import PredictionDetails from "./pages/PredictionDetails";
import Model from "./pages/Model";
import Profile from "./pages/Profile";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* Public Routes */}

        <Route path="/" element={<Login />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}

        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/prediction/:predictionId"
            element={<PredictionDetails />}
          />

          <Route
            path="/prediction"
            element={<Prediction />}
          />

          <Route
            path="/history"
            element={<History />}
          />

          <Route
            path="/history/:predictionId"
            element={<PredictionDetails />}
          />

          <Route
            path="/model"
            element={<Model />}
          />

          <Route
            path="/profile"
            element={<Profile />}
          />

        </Route>

      </Routes>

    </BrowserRouter>
  );
}

export default App;