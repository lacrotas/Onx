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

export const postOrder = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/orderRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}
export const deleteOrder = async (id) => {
    if (checkId(id)) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/orderRouter/delete/' + id, {
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
export const updateOrder = async (id, item) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    const { data } = await $host.put('api/orderRouter/update/' + id, item, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return data;
}
export const fetchAllOrders = async () => {
    const { data } = await $host.get('api/orderRouter/getAll');
    return data;
}