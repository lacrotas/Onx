import React, { useEffect } from "react";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { Helmet } from "react-helmet-async";
import { ReturnsContent } from "../../../components/modalWindow/content/returns/Returns";
import "./InfoPages.scss";

function ReturnsPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="info-page-wrapper">
            <Helmet>
                <title>Правила возврата и обмена товаров | ONX.BY</title>
                <meta 
                    name="description" 
                    content="Условия и правила возврата и обмена непродовольственных товаров надлежащего и ненадлежащего качества в интернет-магазине ONX.BY по законодательству РБ." 
                />
                <link rel="canonical" href="https://onx.by/returns" />
            </Helmet>

            <Header isAdminHeader={false} />

            <main className="info-page-main">
                <div className="info-page-container">
                    <ReturnsContent isStandalone={true} />
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default ReturnsPage;

