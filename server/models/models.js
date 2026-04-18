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
    busketId: { type: DataTypes.INTEGER },
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
// linked data
// kategory
const MainKategory = sequelize.define('mainKategory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, unique: true },
    image: { type: DataTypes.STRING },
    gridSpace: { type: DataTypes.INTEGER },
    gridItemIndex: { type: DataTypes.INTEGER },
})
const Kategory = sequelize.define('kategory', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    mainKategoryId: { type: DataTypes.INTEGER },
    name: { type: DataTypes.STRING },
    image: { type: DataTypes.STRING },
    kategoryIndex: { type: DataTypes.INTEGER },
})
// attribute
const Attribute = sequelize.define('attribute', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    kategoryId: { type: DataTypes.INTEGER },
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
    mainKategoryId: { type: DataTypes.INTEGER },
    kategoryId: { type: DataTypes.INTEGER },
    itemGroupId: { type: DataTypes.INTEGER, allowNull: true },
    name: { type: DataTypes.STRING },
    images: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        defaultValue: []
    },
    video: { type: DataTypes.STRING },
    price: { type: DataTypes.STRING },
    deliveryPrice:  { type: DataTypes.JSONB },
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

// relation between kategoryes
MainKategory.hasMany(Kategory, {
    foreignKey: 'mainKategoryId',
    onDelete: 'CASCADE'
});
Kategory.belongsTo(MainKategory, {
    foreignKey: 'mainKategoryId',
    onDelete: 'CASCADE'
});

// relation betweem attribute and kategory
Kategory.hasMany(Attribute, {
    foreignKey: 'kategoryId',
    onDelete: 'CASCADE'
});
Attribute.belongsTo(Kategory, {
    foreignKey: 'kategoryId',
    onDelete: 'CASCADE'
});

// relation between kategoryes and item
MainKategory.hasMany(Item, {
    foreignKey: 'mainKategoryId',
    onDelete: 'CASCADE'
});
Item.belongsTo(MainKategory, {
    foreignKey: 'mainKategoryId',
    onDelete: 'CASCADE'
});
Kategory.hasMany(Item, {
    foreignKey: 'kategoryId',
    onDelete: 'CASCADE'
});
Item.belongsTo(Kategory, {
    foreignKey: 'kategoryId',
    onDelete: 'CASCADE'
});
ItemGroup.hasMany(Item, { foreignKey: 'itemId', onDelete: 'CASCADE' });
Item.hasMany(Review, { foreignKey: 'itemId', onDelete: 'CASCADE' });

// user
User.hasOne(Busket, { foreignKey: 'userId', as: 'busket' });
Busket.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
    Slider,
    Qwestion,
    User,
    MainKategory,
    Kategory,
    Attribute,
    ItemGroup,
    Item,
    Review,
    Order,
    Busket
}
