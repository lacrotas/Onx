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

export const fetchAllFilters = async (id) => {
    const { data } = await $host.get('api/attributeRouter/getAll');
    return data;
}
export const fetchAllFiltersByKategoryId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/attributeRouter/getAllByKategoryId/' + id);
        return data;
    }
}

export const postFilterForKategory = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/attributeRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}

export const updateFilter = async (id, item) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.put('api/attributeRouter/update/' + id, item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return data;
    } catch (e) {
        return false;
    }
}

export const deleteFilter = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        const { data } = await $host.delete('api/attributeRouter/delete/' + id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        )
        return data;
    }
}


export const fetchAllAttributeByKategoryId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/attributeRouter/getAllByKategoryId/' + id);
        return data;
    }
}
export const fetchAttributeById = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/attributeRouter/getAttributeById/' + id);
        return data;
    }
}

export const fetchAllAttributeByPodKategoryId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/attributeRouter/getAllByPodKategoryId/' + id);
        return data;
    }
}
export const deleteAttribute = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        const { data } = await $host.delete('api/attributeRouter/delete/' + id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        )
        return data;
    }
}