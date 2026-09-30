import React from 'react';
import { Helmet } from 'react-helmet-async';
import Headers from "../../components/header/Header";
import AutoSlider from "../../components/autoSlider/AutoSlider";
import Catalog from "../../components/catalog/Catalog";
import Qwestion from "../../components/qwestion/Qwestion";
import Footer from "../../components/footer/Footer";

function MainPage() {
    const seoTitle = "ONX.BY — Интернет-магазин в Беларуси | Каталог качественных товаров по выгодным ценам";
    const seoDescription = "Интернет-магазин ONX.BY: огромный каталог качественных товаров для дома, спорта, отдыха и работы по доступным ценам. Официальная гарантия, скидки и быстрая доставка по Минску и всей Беларуси. Заказывайте на ONX.BY!";
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://onx.by';

    const organizationSchema = {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "name": "ONX.BY",
        "url": siteUrl,
        "description": seoDescription,
        "logo": `${siteUrl}/logo192.png`,
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "BY",
            "addressLocality": "Минск"
        }
    };

    return (
        <div className="App">
            <Helmet>
                <title>{seoTitle}</title>
                <meta name="description" content={seoDescription} />
                <link rel="canonical" href={siteUrl} />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={seoTitle} />
                <meta property="og:description" content={seoDescription} />
                <meta property="og:url" content={siteUrl} />
                <meta property="og:site_name" content="ONX.BY" />
                <meta property="og:image" content={`${siteUrl}/logo192.png`} />

                {/* Schema.org */}
                <script type="application/ld+json">
                    {JSON.stringify(organizationSchema)}
                </script>
            </Helmet>

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
