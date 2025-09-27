import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./Landing";
import ImageProcess from "./ImageProcess";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/analyze" element={<ImageProcess />} />
      </Routes>
    </Router>
  );
};

export default App;