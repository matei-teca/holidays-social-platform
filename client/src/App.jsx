import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />  
      <main className="content container">
        <AppRoutes />
      </main>      
      <Footer />
    </BrowserRouter>
  );
};

export default App;