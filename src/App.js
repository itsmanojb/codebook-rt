import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Home from './pages/Home';
import EditorPage from './pages/EditorPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="editor/:id" element={<EditorPage />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
