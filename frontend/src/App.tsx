import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Verify from './pages/Verify';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import EditProfile from './pages/EditProfile';
import MealList from './pages/MealList';
import MealDetails from './pages/MealDetails';
import MyReservations from './pages/MyReservations';
import ReserveMeal from './pages/ReserveMeal';
import Conversations from './pages/Conversations';
import Conversation from './pages/Conversation';
import SaveThem from './pages/SaveThem';
import CreateReview from './pages/CreateReview';
import SubscriptionPlans from './pages/SubscriptionPlans';
import CreateMeal from './pages/CreateMeal';
import Notifications from './pages/Notifications';
import Help from './pages/Help';
import Diagnostic from './pages/Diagnostic';
import { initializePushNotifications } from './utils/pushNotifications';

function App() {
  useEffect(() => {
    // Initialiser les notifications push au chargement de l'app
    // Fait de manière asynchrone pour ne pas bloquer le chargement
    const initNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          await initializePushNotifications();
        }
      } catch (error) {
        // Erreur silencieuse - les notifications push ne sont pas critiques
        // Ne pas logger pour éviter le bruit dans la console
      }
    };
    
    // Démarrer l'initialisation après un court délai pour ne pas bloquer le rendu initial
    setTimeout(initNotifications, 1000);
  }, []);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/auth/forgot-password" element={<ForgotPassword />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/profile/edit" element={<EditProfile />} />
        <Route path="/meals" element={<MealList />} />
        <Route path="/meals/new" element={<CreateMeal />} />
        <Route path="/meals/:id" element={<MealDetails />} />
        <Route path="/meals/:id/reserve" element={<ReserveMeal />} />
        <Route path="/meals/:mealId/review" element={<CreateReview />} />
        <Route path="/save-them" element={<SaveThem />} />
        <Route path="/reservations" element={<MyReservations />} />
        <Route path="/messages" element={<Conversations />} />
        <Route path="/messages/:mealId" element={<Conversation />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/help" element={<Help />} />
        <Route path="/subscriptions/plans" element={<SubscriptionPlans />} />
        <Route path="/health" element={<div>Frontend OK</div>} />
        <Route path="/diagnostic" element={<Diagnostic />} />
      </Routes>
    </div>
  );
}

export default App;
