import { BrowserRouter } from "react-router-dom";
import AppRouter from "./pages/appRouter/AppRouter";

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
          <AppRouter />
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
