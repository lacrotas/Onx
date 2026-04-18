import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

function checkId(id) {
    if (!id || isNaN(id)) {
        return true;
    }
    if (id == 'undefined' || id == 'null' || id == 'false') {
        return true;
    }
    const numericId = Number(id);
    if (!Number.isFinite(numericId)) {
        return true;
    }
    if (!Number.isInteger(numericId) || numericId < 0) {
        return true;
    }
    return false
}
export const fetchItemGroupById = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/itemGroupRouter/getById/' + id);
        return data;
    }
}
export const fetchAllItemGroup = async (id) => {
    const { data } = await $host.get('api/itemGroupRouter/getAll');
    return data;
}

export const postItemGroup = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/itemGroupRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}
export const deleteItemGroup = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        const { data } = await $host.delete('api/itemGroupRouter/delete/' + id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        )
        return data;
    }
}
export const updateItemGroup = async (id, item) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        const { data } = await $host.put('api/itemGroupRouter/update/' + id, item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data;
    }
}