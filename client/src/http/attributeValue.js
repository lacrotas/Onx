import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const postAttribute = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/attributeValueRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}
export const deleteAttributeValue = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/attributeValueRouter/delete/' + id, {
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
export const fetchAttributeValuesById = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/attributeValueRouter/getAttributeValueById/' + id);
        return data;
    }
}
export const fetchAllAttributeValuesByAttributeId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/attributeValueRouter/getAllAttributeValueByAttributeId/' + id);
        return data;
    }
}