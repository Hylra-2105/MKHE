import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/layout/Header";
import LoginPage from "./pages/auth/LoginPage";

function App() {
  return (
    <Router>
      <div className="flex flex-col h-screen overflow-hidden">
        <Header />

        <main className="flex-1 flex flex-col">
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
