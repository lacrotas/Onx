import Headers from "../../components/header/Header";
import HistoryCatalog from "../../components/historyCatalog/HistoryCatalog";
import Busket from "../../components/busket/Busket";
import Footer from "../../components/footer/Footer";
import Breadcrumbs from "../../components/breadcrumbs/Breadcrumbs";

function BasketPage() {
    const breadcrumbsItems = [
        { title: "Главная", path: "/" },
        { title: "Корзина" },
    ];
    return (
        <>
            <Headers />
            <Breadcrumbs items={breadcrumbsItems} />
            <Busket />
            <Footer />
        </>
    )
}

export default BasketPage