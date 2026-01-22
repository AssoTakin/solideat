import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<div>SOLID'EAT - Page d'accueil (à implémenter)</div>} />
        <Route path="/health" element={<div>Frontend OK</div>} />
      </Routes>
    </div>
  );
}

export default App;
