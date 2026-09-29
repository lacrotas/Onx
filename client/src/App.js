import { BrowserRouter } from "react-router-dom";
import AppRouter from "./pages/appRouter/AppRouter";
import ScrollToTop from "./components/scrollToTop/ScrollToTop";

function App() {
  return (
    <>
      <div className="animated-border">
        <div className="layer waves"></div>
        <div className="layer geo"></div>
        <div className="layer details"></div>
      </div>
      <div className="App">
        <BrowserRouter>
          <ScrollToTop />
          <AppRouter />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
