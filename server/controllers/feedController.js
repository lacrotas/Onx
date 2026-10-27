const { Item, Category } = require('../models/models');

// Функция очистки HTML от тегов
const stripHtml = (html) => {
    if (!html) return '';
    return html
        .replace(/<[^>]*>?/gm, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&quot;/gi, '"')
        .replace(/\s+/g, ' ')
        .trim();
};

// Экранирование спецсимволов XML
const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
};

// Безопасное оборачивание в CDATA
const cdata = (text) => {
    if (!text) return '';
    return `<![CDATA[${String(text).replace(/\]\]>/g, ']] >')}]]>`;
};

// Нормализация массива картинок из БД
const parseImages = (images) => {
    if (!images) return [];
    if (Array.isArray(images)) return images.filter(Boolean);
    if (typeof images === 'string') {
        return images
            .replace(/^\{|\}$/g, '')
            .split(',')
            .map(s => s.trim().replace(/^"|"$/g, ''))
            .filter(Boolean);
    }
    return [];
};

class FeedController {
    constructor() {
        this.cacheXml = null;
        this.cacheTime = 0;
        this.CACHE_TTL_MS = 15 * 60 * 1000; // Кэш на 15 минут
    }

    async getGoogleMerchantFeed(req, res) {
        try {
            const noCache = req.query.nocache === '1';
            const now = Date.now();

            if (!noCache && this.cacheXml && (now - this.cacheTime < this.CACHE_TTL_MS)) {
                res.setHeader('Content-Type', 'application/xml; charset=utf-8');
                res.setHeader('X-Cache', 'HIT');
                return res.send(this.cacheXml);
            }

            // 1. Получаем все категории для построения правильных путей и категорий
            const categories = await Category.findAll();
            const categoryMap = new Map();
            categories.forEach(cat => categoryMap.set(cat.id, cat));

            // 2. Получаем все активные товары
            const items = await Item.findAll({
                where: { isShowed: true },
                order: [['id', 'DESC']]
            });

            const siteUrl = 'https://onx.by';

            let xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Интернет-магазин Onx.by</title>
    <link>${siteUrl}</link>
    <description>Качественные товары с доставкой по Минску и Беларуси</description>
`;

            for (const item of items) {
                // Проверяем валидность цены
                const rawPrice = String(item.price || '').replace(',', '.').trim();
                const numericPrice = parseFloat(rawPrice);
                if (isNaN(numericPrice) || numericPrice <= 0) {
                    continue; // Пропускаем товары с нулевой или отсутствующей ценой
                }

                // Категории и ссылки
                const cat = item.categoryId ? categoryMap.get(item.categoryId) : null;
                const parentCat = (cat && cat.parentId && cat.parentId !== 0) ? categoryMap.get(cat.parentId) : null;

                let productPath;
                let productType = '';

                if (parentCat && cat) {
                    productPath = `/${parentCat.alias || parentCat.id}/${cat.alias || cat.id}/${item.alias || item.id}`;
                    productType = `${parentCat.name} > ${cat.name}`;
                } else if (cat) {
                    productPath = `/${cat.alias || cat.id}/${item.alias || item.id}`;
                    productType = cat.name;
                } else {
                    productPath = `/item/${item.alias || item.id}`;
                    productType = 'Каталог';
                }

                const productUrl = `${siteUrl}${productPath}`;

                // Картинки
                const imageList = parseImages(item.images);
                let mainImageUrl = `${siteUrl}/logo192.png`;
                const additionalImages = [];

                if (imageList.length > 0) {
                    const formatImageUrl = (img) => {
                        if (img.startsWith('http://') || img.startsWith('https://')) return img;
                        return `${siteUrl}/static/images/${img}`;
                    };

                    mainImageUrl = formatImageUrl(imageList[0]);

                    // До 10 дополнительных картинок
                    for (let i = 1; i < Math.min(imageList.length, 11); i++) {
                        additionalImages.push(formatImageUrl(imageList[i]));
                    }
                }

                // Описание
                const plainDescription = stripHtml(item.description);
                const finalDescription = plainDescription.length > 0 
                    ? plainDescription.slice(0, 5000) 
                    : `Купить ${item.name} по выгодной цене ${numericPrice.toFixed(2)} BYN с доставкой по Беларуси в магазине Onx.by`;

                // Парсинг бренда из specificationsJSONB
                let brand = 'Onx';
                let specs = item.specificationsJSONB;
                if (typeof specs === 'string') {
                    try {
                        specs = JSON.parse(specs);
                    } catch (e) {
                        specs = null;
                    }
                }
                if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
                    const brandKey = Object.keys(specs).find(k => /бренд|производитель|brand/i.test(k));
                    if (brandKey && specs[brandKey]) {
                        brand = String(specs[brandKey]).trim();
                    }
                }

                // Обработка штрихкода (GTIN) / Артикула (MPN)
                const barcode = (item.barcode || '').trim();
                const isGtin = /^\d{8}$|^\d{12,14}$/.test(barcode);

                xml += `    <item>
      <g:id>${item.id}</g:id>
      <g:title>${cdata(item.name)}</g:title>
      <g:description>${cdata(finalDescription)}</g:description>
      <g:link>${escapeXml(productUrl)}</g:link>
      <g:image_link>${escapeXml(mainImageUrl)}</g:image_link>
`;

                for (const addImg of additionalImages) {
                    xml += `      <g:additional_image_link>${escapeXml(addImg)}</g:additional_image_link>\n`;
                }

                xml += `      <g:availability>${item.isExist ? 'in_stock' : 'out_of_stock'}</g:availability>
      <g:price>${numericPrice.toFixed(2)} BYN</g:price>
      <g:condition>new</g:condition>
      <g:brand>${cdata(brand)}</g:brand>
`;

                if (isGtin) {
                    xml += `      <g:gtin>${escapeXml(barcode)}</g:gtin>\n`;
                } else if (barcode) {
                    xml += `      <g:mpn>${cdata(barcode)}</g:mpn>\n`;
                    xml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
                } else {
                    xml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
                }

                if (productType) {
                    xml += `      <g:product_type>${cdata(productType)}</g:product_type>\n`;
                }

                xml += `    </item>\n`;
            }

            xml += `  </channel>
</rss>`;

            this.cacheXml = xml;
            this.cacheTime = now;

            res.setHeader('Content-Type', 'application/xml; charset=utf-8');
            res.setHeader('X-Cache', 'MISS');
            return res.send(xml);

        } catch (error) {
            console.error('Ошибка при генерации Google Merchant Feed:', error);
            return res.status(500).send('<?xml version="1.0" encoding="UTF-8"?><error>Internal Server Error</error>');
        }
    }
}

module.exports = new FeedController();
