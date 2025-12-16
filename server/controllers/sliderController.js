const { Slider } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class sliderController {
    async addSlider(req, res, next) {
        try {
            const { label, description, link } = req.body
            let fileName = null;
            try {
                if (req.files && req.files.image) {
                    const { image } = req.files;
                    fileName = uuid.v4() + ".jpg";
                    await image.mv(path.resolve(__dirname, '..', 'static/images', fileName));
                } else {
                    console.log('No image file uploaded');
                }
            } catch (e) {
                console.log('File upload error:', e);
            }

            const slider = await Slider.create({
                label: label,
                description: description,
                link: link,
                image: fileName
            });

            return res.json(slider);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async getAllSlider(req, res) {
        const slider = await Slider.findAll();
        return res.json(slider);
    }
    async getSliderById(req, res) {
        const { id } = req.params
        const slider = await Slider.findOne(
            { where: { id } }
        );
        return res.json(slider);
    }
    async deleteSliderById(req, res) {
        try {
            const { id } = req.params;
            const slider = await Slider.findOne({ where: { id } });

            if (!slider) {
                return res.status(404).json({ error: 'Слайдер не найден' });
            }

            await slider.destroy();
            return res.json({ message: 'Слайдер удален' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    async updateSliderById(req, res) {
        const { id } = req.params;
        const { label, description, link } = req.body;
        let fileName;
        // change new image and delete old
        try {
            const { image } = req.files;
            const mainKategory = await Slider.findOne(
                { where: { id } }
            )
            if (mainKategory.image) {
                const imagePath = path.resolve(__dirname, '..', 'static/images', mainKategory.image);
                fs.unlink(imagePath, (err) => {
                    if (err) {
                        console.error(`Failed to delete image file: ${err.message}`);
                    }
                });
            }
            fileName = uuid.v4() + ".jpg";
            image.mv(path.resolve(__dirname, '..', 'static/images', fileName));
        } catch (error) {
            const { image } = req.body;
            if (image) {
                fileName = image;
            }
        }
        try {
            const [updatedRowsCount, updatedRows] = await Slider.update(
                {
                    label: label,
                    description: description,
                    link: link,
                    image: fileName,
                },
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                // Данные успешно обновлены, возвращаем обновленные данные
                res.status(200).json({ message: 'Данные успешно обновлены', updatedRows });
            } else {
                // Запись с указанным id не найдена
                res.status(404).json({ message: 'Запись не найдена' });
            }
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new sliderController();