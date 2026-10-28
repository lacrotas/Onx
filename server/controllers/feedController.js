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

// Валидация контрольной суммы GTIN (EAN-8, UPC-12, EAN-13, ITF-14) по алгоритму GS1 (modulo 10)
const isValidGtin = (code) => {
    if (!code || !/^\d{8}$|^\d{12,14}$/.test(code)) return false;
    const digits = code.split('').map(Number);
    const checkDigit = digits.pop();
    let sum = 0;
    let multiplier = 3;
    for (let i = digits.length - 1; i >= 0; i--) {
        sum += digits[i] * multiplier;
        multiplier = multiplier === 3 ? 1 : 3;
    }
    const calculatedCheck = (10 - (sum % 10)) % 10;
    return calculatedCheck === checkDigit;
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
    <language>ru</language>
`;

            for (const item of items) {
                // Проверяем валидность названия
                const rawTitle = (item.name || '').trim();
                if (!rawTitle) {
                    continue; // Пропускаем товары без названия
                }
                const title = rawTitle.slice(0, 150);

                // Проверяем валидность цены
                const rawPrice = String(item.price || '').replace(',', '.').trim();
                const numericPrice = parseFloat(rawPrice);
                if (isNaN(numericPrice) || numericPrice <= 0) {
                    continue; // Пропускаем товары с нулевой или отсутствующей ценой
                }

                // Картинки: Google Merchant строго запрещает товары без фото или с логотипом-заглушкой
                const imageList = parseImages(item.images);
                if (!imageList || imageList.length === 0) {
                    continue; // Пропускаем товары без фото
                }

                const formatImageUrl = (img) => {
                    if (!img) return '';
                    if (img.startsWith('http://') || img.startsWith('https://')) return img;
                    const parts = img.split('/').map(part => encodeURIComponent(part));
                    return `${siteUrl}/static/images/${parts.join('/')}`;
                };

                const mainImageUrl = formatImageUrl(imageList[0]);
                if (!mainImageUrl) {
                    continue;
                }

                const additionalImages = [];
                for (let i = 1; i < Math.min(imageList.length, 11); i++) {
                    const url = formatImageUrl(imageList[i]);
                    if (url) additionalImages.push(url);
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
                    // Если нет родительской категории, используем прямой роут карточки /item/:alias
                    productPath = `/item/${item.alias || item.id}`;
                    productType = cat.name;
                } else {
                    productPath = `/item/${item.alias || item.id}`;
                    productType = 'Каталог';
                }

                const productUrl = `${siteUrl}${productPath}`;

                // Описание (до 5000 символов)
                const plainDescription = stripHtml(item.description);
                const finalDescription = plainDescription.length > 0 
                    ? plainDescription.slice(0, 5000) 
                    : `Купить ${title} по выгодной цене ${numericPrice.toFixed(2)} BYN с доставкой по Беларуси в магазине Onx.by`;

                // Парсинг бренда из specificationsJSONB
                let brand = '';
                let specs = item.specificationsJSONB;
                if (typeof specs === 'string') {
                    try {
                        specs = JSON.parse(specs);
                    } catch (e) {
                        specs = null;
                    }
                }
                if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
                    const brandKey = Object.keys(specs).find(k => /бренд|производитель|изготовитель|brand|manufacturer/i.test(k));
                    if (brandKey && specs[brandKey]) {
                        brand = String(specs[brandKey]).trim().slice(0, 70);
                    }
                }

                // Обработка штрихкода (GTIN) / Артикула (MPN)
                const barcode = (item.barcode || '').trim();
                const isGtin = isValidGtin(barcode);

                xml += `    <item>
      <g:id>${item.id}</g:id>
      <g:title>${cdata(title)}</g:title>
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
`;

                // Вывод бренда при наличии
                if (brand) {
                    xml += `      <g:brand>${cdata(brand)}</g:brand>\n`;
                }

                // Вывод уникальных идентификаторов по спецификации Google
                if (isGtin) {
                    xml += `      <g:gtin>${escapeXml(barcode)}</g:gtin>\n`;
                } else if (barcode) {
                    xml += `      <g:mpn>${cdata(barcode)}</g:mpn>\n`;
                } else {
                    xml += `      <g:identifier_exists>no</g:identifier_exists>\n`;
                }

                // Группировка вариантов товаров (размеры, цвета и т.д.)
                if (item.itemGroupId) {
                    xml += `      <g:item_group_id>${item.itemGroupId}</g:item_group_id>\n`;
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
