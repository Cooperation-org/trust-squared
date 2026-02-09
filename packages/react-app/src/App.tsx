import { BrowserRouter, Route, Routes } from "react-router-dom";
import { useAccount } from "wagmi";
import "./App.css";
import BottomNavbar from "./components/BottomNavbar";
import Home from "./screens/Home";
import Login from "./screens/Login";
import Dashborad from "./screens/Dashborad";
import Profile from "./screens/Profile";
import Explore from "./screens/Explore";
import SupportStreams from "./screens/SupportStreams";
import { QrScan } from "./screens/TrustAction";
import StopSupport from "./screens/StopSupport";
import StreamDetails from "./screens/StreamDetails";
import Verify from "./screens/Verify";

function App() {
  const { isConnected } = useAccount();

  return (
    <BrowserRouter>
      {!isConnected ? (
        <Login />
      ) : (
        <Routes>
          <Route
            path="/*"
            element={
              <>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashborad />} />
                  <Route path="/explore" element={<Explore />} />
                  <Route path="/streams" element={<SupportStreams />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/trust" element={<QrScan />} />
                  <Route path="/stop-support" element={<StopSupport />} />
                  <Route path="/stream-details" element={<StreamDetails />} />
                  <Route path="/verify" element={<Verify />} />
                </Routes>
                <BottomNavbar />
              </>
            }
          />
        </Routes>
      )}
    </BrowserRouter>
  );
}

export default App;
