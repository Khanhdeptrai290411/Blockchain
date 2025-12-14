import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Landing from './Landing';
import AuctionApp from './AuctionApp';

function App() {
  return (
    <div id="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />}></Route>
          <Route path="/auction" element={<AuctionApp />}></Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
