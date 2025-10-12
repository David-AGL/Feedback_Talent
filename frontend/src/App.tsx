import { Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login.tsx";
import SurveyEmployee from "./pages/SurveyEmployee.tsx";
import SurveyCandidate from "./pages/SurveyCandidate.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Register from "./pages/Register.tsx";
import Home from "./pages/Home.tsx"; 
import RecoverPassword from "./pages/RecoverPassword.tsx";
import Profile from "./pages/Profile.tsx";
import FeedbackHistory from './pages/FeedbackHistory';
import CompanyProfile from "./pages/CompanyProfile.tsx"; // ← AGREGAR IMPORT
import Navbar from "./components/navbar.tsx";
import Footer from "./components/footer.tsx";
import ProtectedRoute from "./components/protectedRoute.tsx";

const AppContent: React.FC = () => {
  const location = useLocation();

  const showNavbarAndFooter =
    location.pathname !== '/login' && location.pathname !== '/auth/Recover' &&
    location.pathname !== '/register' && location.pathname !== '/recoverpassword' &&
    location.pathname !== '/auth/reset-password' && location.pathname !== '/auth/resend-pin' &&
    location.pathname !== '/auth/forgot-password' && location.pathname !== '/auth/verify-pin';

  return (
    <div>
      {showNavbarAndFooter && <Navbar />}
      <main>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/auth/recover" element={<RecoverPassword />} />
          <Route path="/" element={<Home />} />
          
          {/* Rutas solo para employee y candidate */}
          <Route 
            path="/surveyemployee" 
            element={
              <ProtectedRoute allowedRoles={['employee']}>
                <SurveyEmployee />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/surveycandidate" 
            element={
              <ProtectedRoute allowedRoles={['candidate']}>
                <SurveyCandidate />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/feedback-history" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'candidate']}>
                <FeedbackHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/userprofile" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'candidate']}>
                <Profile />
              </ProtectedRoute>
            } 
          />

          {/* Rutas solo para company */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['company']}>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          
          {/* ← CAMBIAR ESTA RUTA */}
          <Route 
            path="/company-profile/:companyId" 
            element={
              <ProtectedRoute allowedRoles={['employee', 'candidate', 'company']}>
                <CompanyProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {showNavbarAndFooter && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;