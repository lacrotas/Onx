const fs = require('fs');
const path = require('path');
const { Kategory, MainKategory, Item, Review, Slider } = require('../models/models');
class ImageDeletionService {
    constructor() {
        this.addBeforeDestroyHooks();
        this.addAfterDestroyHooks();
    }

    static deleteVideoFile(videoPath) {
        if (videoPath) {
            const fullVideoPath = path.resolve(__dirname, '..', 'static/video', videoPath);
            fs.unlink(fullVideoPath, (err) => {
                if (err) {
                    console.error(`Failed to delete video file: ${err.message}`);
                } else {
                    console.log(`Video file deleted: ${fullVideoPath}`);
                }
            });
        }
    }

    static deleteImageArray(imageArray) {
        if (imageArray && Array.isArray(imageArray)) {
            imageArray.forEach(imagePath => {
                if (imagePath) {
                    const fullImagePath = path.resolve(__dirname, '..', 'static/images', imagePath);
                    ImageDeletionService.deleteImageFile(fullImagePath);
                }
            });
        }
    }

    static deleteImageFile(imagePath) {
        if (imagePath) {
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(`Failed to delete image file: ${err.message}`);
                } else {
                    console.log(`Image file deleted: ${imagePath}`);
                }
            });
        }
    }

    // before destroy hooks
    addBeforeDestroyHooks() {
        this.addBeforeDestroyHookForModel(MainKategory, Kategory, 'image', 'mainKategoryId');
        this.addBeforeDestroyHookForModel(MainKategory, Item, 'image', 'mainKategoryId');
        this.addBeforeDestroyHookForModel(Kategory, Item, 'images', 'kategoryId');
        this.addBeforeDestroyHookForModel(Item, Review, 'images', 'itemId');
        this.addBeforeDestroyHookForModel(MainKategory, Item, ['images', 'video'], 'mainKategoryId'); 
        this.addBeforeDestroyHookForModel(Kategory, Item, ['images', 'video'], 'kategoryId');
    }

    addBeforeDestroyHookForModel(parentModel, childModel, imageField, foreignKey) {
        parentModel.beforeDestroy(async (instance) => {
            // Найдем все связанные дочерние элементы
            const childInstances = await childModel.findAll({ where: { [foreignKey]: instance.id } });

            // Удалим все изображения дочерних элементов
            for (const childInstance of childInstances) {
                const imagePath = childInstance[imageField];

                // Обработка массива изображений (для Review)
                if (Array.isArray(imagePath)) {
                    ImageDeletionService.deleteImageArray(imagePath);
                }
                // Обработка одиночного изображения
                else if (imagePath) {
                    const fullImagePath = path.resolve(__dirname, '..', 'static/images', imagePath);
                    ImageDeletionService.deleteImageFile(fullImagePath);
                }

                // Удаляем сам дочерний элемент
                await childInstance.destroy();
            }
        });
    }

    // after destroy hooks
    addAfterDestroyHooks() {
        this.addAfterDestroyHookForModel(Kategory, 'image');
        this.addAfterDestroyHookForModel(MainKategory, 'image');
        this.addAfterDestroyHookForModel(Item, 'images');
        this.addAfterDestroyHookForModel(Item, 'video');
        this.addAfterDestroyHookForModel(Slider, 'image');
        this.addAfterDestroyHookForModel(Review, 'images');
    }

    addAfterDestroyHookForModel(model, field) {
        model.afterDestroy(async (instance) => {
            const fieldData = instance[field];
            if (Array.isArray(fieldData)) {
                ImageDeletionService.deleteImageArray(fieldData);
            } else if (fieldData) {
                if (field === 'image' || field === 'images') {
                    const fullImagePath = path.resolve(__dirname, '..', 'static/images', fieldData);
                    ImageDeletionService.deleteImageFile(fullImagePath);
                } else if (field === 'video') {
                    ImageDeletionService.deleteVideoFile(fieldData);
                }
            }
        });
    }
}

module.exports = ImageDeletionService;