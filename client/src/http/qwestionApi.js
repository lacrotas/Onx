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

export const postQwestion = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/qwestionRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}
export const deleteQwestion = async (id) => {
    if (checkId(id)) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/qwestionRouter/delete/' + id, {
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
export const updateQwestion = async (id, item) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    const { data } = await $host.put('api/qwestionRouter/update/' + id, item, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return data;
}
export const fetchAllQwestion = async () => {
    const { data } = await $host.get('api/qwestionRouter/getAll');
    return data;
}