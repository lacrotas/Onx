const sharp = require('sharp');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const ffmpeg = require('fluent-ffmpeg');

class MediaProcessor {

    // Обработка одного изображения
    async processSingleImage(imageFile, outputDir = 'images') {
        try {
            console.log('Processing image:', imageFile.name);

            const fileName = uuid.v4() + ".png";
            const outputPath = path.resolve(__dirname, '..', 'static', outputDir, fileName);

            // Создаем sharp instance
            let sharpInstance = sharp(imageFile.data);

            // Получаем метаданные для проверки формата
            const metadata = await sharpInstance.metadata();
            console.log('Image format:', metadata.format);
            console.log('Has alpha channel:', metadata.hasAlpha);

            // Если изображение с прозрачностью, сохраняем как PNG
            if (metadata.hasAlpha) {
                console.log('Processing as PNG with transparency');
                await sharpInstance
                    .resize(800, 600, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .png({
                        compressionLevel: 9,
                        adaptiveFiltering: true,
                        force: true // Принудительно сохраняем как PNG
                    })
                    .toFile(outputPath);
            } else {
                // Если нет прозрачности, сохраняем как JPEG
                console.log('Processing as JPEG');
                await sharpInstance
                    .resize(800, 600, {
                        fit: 'inside',
                        withoutEnlargement: true
                    })
                    .jpeg({
                        quality: 80,
                        progressive: true,
                        force: false
                    })
                    .toFile(outputPath);
            }

            console.log('Image processed successfully:', fileName);
            return fileName;
        } catch (error) {
            console.error('Image processing error:', error);
            throw new Error('Ошибка обработки изображения: ' + error.message);
        }
    }

    // Обработка массива изображений
    async processMultipleImages(imagesFiles, outputDir = 'images') {
        try {
            const processedImages = [];
            const filesArray = Array.isArray(imagesFiles) ? imagesFiles : [imagesFiles];

            for (const img of filesArray) {
                const fileName = await this.processSingleImage(img, outputDir);
                processedImages.push(fileName);
            }

            return processedImages;
        } catch (error) {
            console.error('Multiple images processing error:', error);
            // Если ошибка - удаляем уже обработанные изображения
            if (processedImages && processedImages.length > 0) {
                await this.deleteOldFiles(processedImages, outputDir);
            }
            throw new Error('Ошибка обработки изображений: ' + error.message);
        }
    }

    // Обработка видео (сжатие)
    async processVideo(videoFile, outputDir = 'video') {
        return new Promise((resolve, reject) => {
            const fileName = uuid.v4() + ".mp4";
            const outputPath = path.resolve(__dirname, '..', 'static', outputDir, fileName);
            const tempPath = path.resolve(__dirname, '..', 'static', outputDir, 'temp_' + fileName);

            videoFile.mv(tempPath, (err) => {
                if (err) {
                    return reject(err);
                }

                ffmpeg(tempPath)
                    .videoCodec('libx264')
                    .audioCodec('aac')
                    .outputOptions([
                        '-crf 23',
                        '-preset medium',
                        '-movflags +faststart'
                    ])
                    .size('1280x720')
                    .on('end', () => {
                        fs.unlink(tempPath, (unlinkErr) => {
                            if (unlinkErr) console.error('Error deleting temp file:', unlinkErr);
                        });
                        resolve(fileName);
                    })
                    .on('error', (ffmpegErr) => {
                        console.error('FFmpeg error, using original:', ffmpegErr);
                        fs.rename(tempPath, outputPath, (renameErr) => {
                            if (renameErr) {
                                reject(renameErr);
                            } else {
                                resolve(fileName);
                            }
                        });
                    })
                    .save(outputPath);
            });
        });
    }

    // Удаление старых файлов
    async deleteOldFiles(fileNames, fileType = 'images') {
        try {
            const filesArray = Array.isArray(fileNames) ? fileNames : [fileNames];

            for (const fileName of filesArray) {
                if (fileName) {
                    const filePath = path.resolve(__dirname, '..', 'static', fileType, fileName);
                    if (fs.existsSync(filePath)) {
                        fs.unlinkSync(filePath);
                        console.log('Deleted file:', filePath);
                    }
                }
            }
        } catch (error) {
            console.error('Error deleting old files:', error);
            throw error;
        }
    }
}

// Создаем экземпляр процессора
const mediaProcessor = new MediaProcessor();

// Middleware для обработки одного изображения
const processSingleImage = (fieldName = 'image', outputDir = 'images') => {
    return async (req, res, next) => {
        try {
            console.log('Media middleware: checking for files...');

            if (req.files && req.files[fieldName]) {
                console.log('Media middleware: processing image...');
                req.processedImage = await mediaProcessor.processSingleImage(
                    req.files[fieldName],
                    outputDir
                );
                console.log('Media middleware: image processed:', req.processedImage);
            } else {
                console.log('Media middleware: no image found in field:', fieldName);
            }
            next();
        } catch (error) {
            console.error('Media middleware error:', error);
            next(error);
        }
    };
};

// Middleware для обработки нескольких изображений
const processMultipleImages = (fieldName = 'images', outputDir = 'images') => {
    return async (req, res, next) => {
        try {
            if (req.files && req.files[fieldName]) {
                req.processedImages = await mediaProcessor.processMultipleImages(
                    req.files[fieldName],
                    outputDir
                );
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

// Middleware для обработки видео
const processVideo = (fieldName = 'video', outputDir = 'video') => {
    return async (req, res, next) => {
        try {
            if (req.files && req.files[fieldName]) {
                req.processedVideo = await mediaProcessor.processVideo(
                    req.files[fieldName],
                    outputDir
                );
            }
            next();
        } catch (error) {
            next(error);
        }
    };
};

module.exports = {
    mediaProcessor,
    processSingleImage,
    processMultipleImages,
    processVideo
};