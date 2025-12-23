import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Landing from './Landing';
import AuctionApp from './AuctionApp';
import Home from './pages/Home';
import Auctions from './pages/Auctions';
import Profile from './pages/Profile';
import Collection from './pages/Collection';

function App() {
  return (
    <div id="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/home" element={<Home />}></Route>
          <Route path="/auctions" element={<Auctions />}></Route>
          <Route path="/profile" element={<Profile />}></Route>
          <Route path="/collection" element={<Collection />}></Route>
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
