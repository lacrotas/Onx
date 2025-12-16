import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const postItemImage = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/itemImageRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}
export const deleteItemImage = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/itemImageRouter/deleteItemImageById/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return data;
        } catch (e) {
            return false;
        }
    }
}
export const fetchAllItemImageByItemId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/itemImageRouter/getAll/' + id);
        return data;
    }
}