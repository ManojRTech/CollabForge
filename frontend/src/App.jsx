import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/Auth";

function App() {
  return (
    <Router>
      <nav className="p-4 flex gap-4">
        <Link to="/">Home</Link>
        <Link to="/auth">Auth</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;
