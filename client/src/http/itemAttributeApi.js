import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const postItemAttribute = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/itemAttributeRouter/add', item, {
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
            const { data } = await $host.delete('api/itemAttributeRouter/delete/' + id, {
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
export const fetchAllAttributeValuesByItemId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/itemAttributeRouter/getAllByItemId/' + id);
        return data;
    }
}
// export const fetchAllAttributeValuesByPodKategoryId = async (id) => {
//     if (!id) {
//         return null;
//     } else {
//         const { data } = await $host.get('api/itemAttributeRouter/getAllByPodKategoryId/' + id);
//         return data;
//     }
// }