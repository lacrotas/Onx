import React, { useEffect } from "react";
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { Helmet } from "react-helmet-async";
import { PrivacyContent } from "../../../components/modalWindow/content/privacy/Privacy";
import "./InfoPages.scss";

function PrivacyPage() {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="info-page-wrapper">
            <Helmet>
                <title>Политика конфиденциальности | ONX.BY</title>
                <meta 
                    name="description" 
                    content="Политика обработки и защиты персональных данных пользователей интернет-магазина ONX.BY в соответствии с законодательством Республики Беларусь." 
                />
                <link rel="canonical" href="https://onx.by/privacy" />
            </Helmet>

            <Header isAdminHeader={false} />

            <main className="info-page-main">
                <div className="info-page-container">
                    <PrivacyContent isStandalone={true} />
                </div>
            </main>

            <Footer />
        </div>
    );
}

export default PrivacyPage;

