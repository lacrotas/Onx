const sequelize = require("../db");
const { DataTypes } = require("sequelize")

// unlinked data
const Slider = sequelize.define('slider', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    label: { type: DataTypes.STRING, },
    description: { type: DataTypes.STRING },
    link: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
})
const Qwestion = sequelize.define('qwestion', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    qwestion: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
})
// users
const User = sequelize.define('users', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    login: { type: DataTypes.STRING },
    mail: { type: DataTypes.STRING, unique: true },
    password: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
});
const Order = sequelize.define('order', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    itemsJsonb: { type: DataTypes.JSONB },
    name: { type: DataTypes.STRING },
    adress: { type: DataTypes.STRING },
    comment: { type: DataTypes.STRING },
    phone: { type: DataTypes.STRING },
    payment: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT },
    orderStage: { type: DataTypes.STRING },
})
const Busket = sequelize.define('busket', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER },
    itemsJsonb: { type: DataTypes.JSONB },
})
// Category
const Category = sequelize.define('category', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    parentId: { type: DataTypes.INTEGER },
    alias: { type: DataTypes.STRING },
    seo_title: { type: DataTypes.STRING },
    seo_desc: { type: DataTypes.STRING },
    name: { type: DataTypes.STRING, unique: true },
    image: { type: DataTypes.STRING },
    gridSpace: { type: DataTypes.INTEGER },
    gridItemIndex: { type: DataTypes.INTEGER },
    categoryIndex: { type: DataTypes.INTEGER },
    itemsCount: { type: DataTypes.INTEGER, defaultValue: 0, allowNull: false },
}, {
    tableName: 'category', // Фиксирует имя таблицы в БД
})
// attribute
const Attribute = sequelize.define('attribute', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    categoryId: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    buttonType: { type: DataTypes.STRING },
    addition: { type: DataTypes.STRING },
    attributeValues: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    filterIndex: { type: DataTypes.INTEGER },

})
// items
const Item = sequelize.define('item', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    categoryId: { type: DataTypes.INTEGER },
    alias: { type: DataTypes.STRING },
    seo_title: { type: DataTypes.STRING },
    seo_desc: { type: DataTypes.STRING },
    itemGroupId: { type: DataTypes.INTEGER, allowNull: true },
    alias: { type: DataTypes.STRING, unique: true },
    name: { type: DataTypes.STRING },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    video: { type: DataTypes.STRING },
    price: { type: DataTypes.STRING },
    deliveryPrice: { type: DataTypes.JSONB },
    description: { type: DataTypes.TEXT },
    rating: { type: DataTypes.STRING },
    reviewNumber: { type: DataTypes.STRING },
    specificationsJSONB: { type: DataTypes.JSONB },
    isExist: { type: DataTypes.BOOLEAN },
    isShowed: { type: DataTypes.BOOLEAN },
})
const ItemGroup = sequelize.define('itemGroup', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    itemIds: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        defaultValue: []
    },
    name: { type: DataTypes.STRING },
    itemInfo: { type: DataTypes.JSONB },
})

// review
const Review = sequelize.define('review', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    userId: { type: DataTypes.INTEGER, allowNull: true },
    itemId: { type: DataTypes.INTEGER },
    mark: { type: DataTypes.INTEGER },
    userName: { type: DataTypes.STRING },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    label: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING(1000) },
    isShowed: { type: DataTypes.BOOLEAN },
})

// ==================== СВЯЗИ МЕЖДУ МОДЕЛЯМИ ====================


// 2. Связь между атрибутами и категориями (Kategory <-> Attribute)
Category.hasMany(Attribute, {
    foreignKey: 'categoryId',
    onDelete: 'CASCADE'
});
Attribute.belongsTo(Category, {
    foreignKey: 'categoryId',
    onDelete: 'CASCADE'
});

// 3. Связь между категориями и товарами (MainKategory/Kategory <-> Item)
Category.hasMany(Item, {
    foreignKey: 'categoryId',
    onDelete: 'CASCADE',
    as: 'items'
});
Item.belongsTo(Category, {
    foreignKey: 'categoryId',
    onDelete: 'CASCADE'
});


// 4. Группы товаров (ItemGroup <-> Item)
ItemGroup.hasMany(Item, { foreignKey: 'itemGroupId', as: 'items' });
Item.belongsTo(ItemGroup, { foreignKey: 'itemGroupId', as: 'group' });

// 5. Пользователи, Корзины и Заказы (User <-> Busket / Order)
User.hasOne(Busket, { foreignKey: 'userId', as: 'busket' });
Busket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Order, { foreignKey: 'userId', onDelete: 'CASCADE' });
Order.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
    Slider,
    Qwestion,
    User,
    Category,
    Attribute,
    ItemGroup,
    Item,
    Review,
    Order,
    Busket
}