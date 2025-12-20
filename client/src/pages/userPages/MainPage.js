import Headers from "../../components/header/Header";
import AutoSlider from "../../components/autoSlider/AutoSlider";
import Catalog from "../../components/catalog/Catalog";
import Qwestion from "../../components/qwestion/Qwestion";
import Footer from "../../components/footer/Footer";

function MainPage() {
    return (
        <div className="App">
            <Headers />
            <AutoSlider />
            <div className="app_container">
                <Catalog />
                <Qwestion />
            </div>
            <Footer />
        </div>
    );
}

export default MainPage;
