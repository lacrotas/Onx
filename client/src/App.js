import { BrowserRouter } from "react-router-dom";
import AppRouter from "./pages/appRouter/AppRouter";

function App() {
  return (
    <>
      <div class="animated-border">
        <div class="layer waves"></div>
        <div class="layer geo"></div>
        <div class="layer details"></div>
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
