import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const postReview = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/reviewRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        return data;
    } catch (e) {
        return false;
    }
}
export const deleteReviewById = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/reviewRouter/delete/' + id, {
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
export const deleteReviewByItemId = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/reviewRouter/deleteByItemId/' + id, {
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
export const fetchReviewByItemId = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/reviewRouter/getAllById/' + id);
        return data;
    }
}

export const fetchAllReview = async () => {
    const { data } = await $host.get('api/reviewRouter/getAll');
    return data;
}
export const fetchReviewByItemIdAndIsShowed = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/reviewRouter/getAllByItemId/' + id);
        return data;
    }
}

export const updateOneReview = async (id, item) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.put('api/reviewRouter/update/' + id, item, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            return data;
        } catch (e) {
            return false;

        }
    }
}