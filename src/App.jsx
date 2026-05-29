import { Routes, Route } from "react-router-dom";
import HomeLayout from "./components/layout/HomeLayout";
import Landing from "./pages/Landing";


// Landing Sections Pages
// import GetStarted from "./pages/GetStarted";

function App() {
  return (
    <>
     
      <Routes>
        {/* Main Landing Page */}
        <Route element={<HomeLayout />}>
          <Route index element={<Landing />} />
          {/* Future Pages */}
          {/* <Route path="/get-started" element={<GetStarted />} /> */}
        </Route>
      </Routes>
    </>
  );
}

export default App;