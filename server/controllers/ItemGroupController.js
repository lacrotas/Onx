const { ItemGroup } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');

class ItemGroupController {

    async addItemGroup(req, res, next) {
        try {
            const { name, itemIds, itemInfo } = req.body;

            // Убираем дубликаты из itemIds
            const uniqueItemIds = itemIds ? [...new Set(itemIds)] : [];

            const itemGroup = await ItemGroup.create({
                name,
                itemIds: uniqueItemIds,
                itemInfo: itemInfo,
            });

            return res.json(itemGroup);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAllItemGroup(req, res) {
        const itemGroup = await ItemGroup.findAll();
        return res.json(itemGroup);
    }

    async getItemGroupById(req, res) {
        const { id } = req.params;
        const itemGroup = await ItemGroup.findOne({ where: { id } });
        return res.json(itemGroup);
    }

    async deleteItemGroupById(req, res) {
        try {
            const { id } = req.params;
            const itemGroup = await ItemGroup.findOne({ where: { id } });
            
            if (!itemGroup) {
                return res.status(404).json({ message: 'ItemGroup not found' });
            }

            await itemGroup.destroy();
            return res.json({ message: 'ItemGroup deleted successfully' });
        } catch (error) {
            console.error('Error deleting ItemGroup:', error);
            return res.status(500).json({ message: 'Error deleting ItemGroup' });
        }
    }

    async updateItemGroupById(req, res) {
        try {
            const { id } = req.params;
            const { name, itemIds, itemInfo } = req.body;

            const itemGroup = await ItemGroup.findOne({ where: { id } });
            
            if (!itemGroup) {
                return res.status(404).json({ message: 'ItemGroup not found' });
            }

            // Подготавливаем данные для обновления
            const updateData = {};

            if (name !== undefined) updateData.name = name;
            if (itemInfo !== undefined) updateData.itemInfo = itemInfo;
            if (itemIds !== undefined) {
                // Убираем дубликаты из новых itemIds
                updateData.itemIds = [...new Set(itemIds)];
            }

            // Обновляем запись
            await ItemGroup.update(updateData, {
                where: { id }
            });

            // Получаем обновленную запись
            const updatedItemGroup = await ItemGroup.findOne({ where: { id } });
            return res.json({ 
                message: 'ItemGroup updated successfully', 
                itemGroup: updatedItemGroup 
            });

        } catch (error) {
            console.error('Error updating ItemGroup:', error);
            return res.status(500).json({ message: 'Error updating ItemGroup' });
        }
    }

    // for work with items

    // async addItemsToGroup(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const { itemIds } = req.body;

    //         const itemGroup = await ItemGroup.findOne({ where: { id } });
            
    //         if (!itemGroup) {
    //             return res.status(404).json({ message: 'ItemGroup not found' });
    //         }

    //         // Объединяем существующие и новые ID, убираем дубликаты
    //         const currentItemIds = itemGroup.itemIds || [];
    //         const newItemIds = [...new Set([...currentItemIds, ...itemIds])];

    //         await ItemGroup.update(
    //             { itemIds: newItemIds },
    //             { where: { id } }
    //         );

    //         const updatedItemGroup = await ItemGroup.findOne({ where: { id } });
    //         return res.json({ 
    //             message: 'Items added to group successfully', 
    //             itemGroup: updatedItemGroup 
    //         });

    //     } catch (error) {
    //         console.error('Error adding items to group:', error);
    //         return res.status(500).json({ message: 'Error adding items to group' });
    //     }
    // }

    // async removeItemsFromGroup(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const { itemIds } = req.body;

    //         const itemGroup = await ItemGroup.findOne({ where: { id } });
            
    //         if (!itemGroup) {
    //             return res.status(404).json({ message: 'ItemGroup not found' });
    //         }

    //         // Фильтруем массив, убирая указанные ID
    //         const currentItemIds = itemGroup.itemIds || [];
    //         const updatedItemIds = currentItemIds.filter(itemId => !itemIds.includes(itemId));

    //         await ItemGroup.update(
    //             { itemIds: updatedItemIds },
    //             { where: { id } }
    //         );

    //         const updatedItemGroup = await ItemGroup.findOne({ where: { id } });
    //         return res.json({ 
    //             message: 'Items removed from group successfully', 
    //             itemGroup: updatedItemGroup 
    //         });

    //     } catch (error) {
    //         console.error('Error removing items from group:', error);
    //         return res.status(500).json({ message: 'Error removing items from group' });
    //     }
    // }

}

module.exports = new ItemGroupController();