import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import MealList from './pages/MealList';
import MealDetails from './pages/MealDetails';
import MyReservations from './pages/MyReservations';
import ReserveMeal from './pages/ReserveMeal';
import Conversations from './pages/Conversations';
import Conversation from './pages/Conversation';
import SaveThem from './pages/SaveThem';
import CreateReview from './pages/CreateReview';
import SubscriptionPlans from './pages/SubscriptionPlans';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>SOLID'EAT - Page d'accueil (à implémenter)</div>} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/meals" element={<MealList />} />
        <Route path="/meals/:id" element={<MealDetails />} />
        <Route path="/meals/:id/reserve" element={<ReserveMeal />} />
        <Route path="/meals/:mealId/review" element={<CreateReview />} />
        <Route path="/save-them" element={<SaveThem />} />
        <Route path="/reservations" element={<MyReservations />} />
        <Route path="/messages" element={<Conversations />} />
        <Route path="/messages/:mealId" element={<Conversation />} />
        <Route path="/subscriptions/plans" element={<SubscriptionPlans />} />
        <Route path="/health" element={<div>Frontend OK</div>} />
      </Routes>
    </div>
  );
}

export default App;
