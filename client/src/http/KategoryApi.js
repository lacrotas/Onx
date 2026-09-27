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

export const fetchAllMainCategory = async () => {
    const { data } = await $host.get('api/categoryRouter/getAllMainCategory');
    return data;
}
export const fetchAllKategory = async () => {
    const { data } = await $host.get('api/categoryRouter/getAll');
    return data;
}
export const fetchCategoryByParam = async (param) => {
    if (!param) {
        return null;
    }
    const { data } = await $host.get('api/categoryRouter/getCategoryByParam/' + param);
    return data;
}

export const fetchCategoryByParentId = async (param) => {
    if (!param) {
        return null;
    }
    const { data } = await $host.get('api/categoryRouter/getParentCategoryByParam/' + param);
    return data;
}
// methods
export const postCategory = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/categoryRouter/add', item, {
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
export const updateCategory = async (id, item) => {
    if (checkId(id)) {
        return null;
    }
    try {
        const token = localStorage.getItem('token');
        const { data } = await $host.put('api/categoryRouter/update/' + id, item, {
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
export const deleteCategoryById = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.delete('api/categoryRouter/delete/' + id, {
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

// хз




export const fetchMainKategoryById = async (param) => {
 
    try {
        const { data } = await $host.get('api/mainKategoryRouter/getMainKategoryById/' + param)
        return data;
    } catch {
        return false
    }
}

/* kategory */

export const fetchAllKategoryByMainKategoryId = async (param) => {
    try {
        if (!param) return [];
        const { data } = await $host.get('api/categoryRouter/getParentCategoryByParam/' + param);
        return Array.isArray(data) ? data : [];
    } catch (e) {
        console.error("Ошибка получения подкатегорий для parentId:", param, e);
        return [];
    }
}

export const deleteKategoryById = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.delete('api/kategoryRouter/delete/' + id, {
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
export const deleteKategoryByMainKategoryId = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.delete('api/kategoryRouter/delete/' + id, {
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
export const postKategory = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/kategoryRouter/add', item, {
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
export const updateKategory = async (id, item) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.put('api/kategoryRouter/update/' + id, item, {
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
export const deleteAllKategoryByMainKategoryId = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.delete('api/kategoryRouter/deleteAllkategotyByMainKategoryId/' + id, {
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

/* podkategory */
export const postPodKategory = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/podKategoryRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}
export const fetchAllPodKategoryByKategoryId = async (kategoryId) => {
    const { data } = await $host.get('api/podKategoryRouter/getAllByKategoryId/' + kategoryId);
    return data;
}
export const fetchPodKategoryById = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const { data } = await $host.get('api/podKategoryRouter/getpodCategory/' + id);
    return data;
}
export const updatePodKategory = async (id, item) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.put('api/podKategoryRouter/update/' + id, item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data;
    } catch (e) {
        return false;
    }
}
export const deletePodKategoryById = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.delete('api/podKategoryRouter/delete/' + id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data;
    } catch (e) {
        return false
    }
}