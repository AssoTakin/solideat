import { Routes, Route } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Verify from './pages/Verify';
import Dashboard from './pages/Dashboard';
import UserProfile from './pages/UserProfile';
import MealList from './pages/MealList';
import MealDetails from './pages/MealDetails';

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
        <Route path="/health" element={<div>Frontend OK</div>} />
      </Routes>
    </div>
  );
}

export default App;
