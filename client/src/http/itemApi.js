import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const postItem = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/itemRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        if (e.response && e.response.status === 413) {
            alert("Ошибка: Слишком большой размер загружаемых файлов!");

        } else if (e.response && e.response.status === 401) {
            alert("Вы не авторизованны");
        } else {
            alert("Произошла ошибка при сохранении.");
        }
        return false;
    }
}
export const fetchAllItem = async () => {
    const { data } = await $host.get('api/itemRouter/getAll');
    return data;
}
export const fetchAllItemByName = async (substring) => {
    try {
        const { data } = await $host.get('api/itemRouter/getAllByNameSubst/' + substring);
        return data;
    } catch (e) {
        console.log(e);
        return false;
    }
}
export const fetchItemId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/itemRouter/getItemById/' + id);
        return data;
    }
}
export const fetchAllItemByKategoryId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/itemRouter/getAllByKategoryId/' + id);
        return data;
    }
}
export const fetchAllItemByMainKategoryId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/itemRouter/getAllByMainKategoryId/' + id);
        return data;
    }
}
export const deleteItemById = async (id) => {
    if (!id) {
        return null;
    } else {
        try {
            const token = localStorage.getItem('token');
            const { data } = await $host.delete('api/itemRouter/delete/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            )
            return data;
        } catch (e) {
            if (e.response && e.response.status === 413) {
                alert("Ошибка: Слишком большой размер загружаемых файлов!");

            } else if (e.response && e.response.status === 401) {
                alert("Вы не авторизованны");
            } else {
                alert("Произошла ошибка при сохранении.");
            }
            return false;
        }
    }
}
export const updateItemById = async (id, item) => {
    if (!id) {
        return null;
    } else {
        try {
            const token = localStorage.getItem('token');
            const { data } = await $host.put('api/itemRouter/update/' + id, item, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data;
        } catch (e) {
            if (e.response && e.response.status === 413) {
                alert("Ошибка: Слишком большой размер загружаемых файлов!");

            } else if (e.response && e.response.status === 401) {
                alert("Вы не авторизованны");
            } else {
                alert("Произошла ошибка при сохранении.");
            }
            return false;
        }
    }
}