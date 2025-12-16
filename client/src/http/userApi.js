import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const signIn = async (mail, password) => {
    const { data } = await $host.post('api/user/login', { mail, password })
    localStorage.setItem('token', data.token);
    return jwt_decode(data.token);
}

export const check = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) return false;

        const { data } = await $host.get('api/user/check');
        return jwt_decode(data.token);
    } catch (error) {
        console.error('Check auth error:', error.response ? error.response.data : error.message);
        throw error;
}};

export const fetchAllUsers = async () => {
    const { data } = await $host.get('api/user/getAll');
    return data;
}
export const registration = async (slider) => {
    const token = localStorage.getItem('token');
    const { data } = await $host.post('api/user/registrate', slider);
    return data;
}

export const updateUser = async (id, slider) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.put('api/user/update/' + id, slider, {
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

export const deleteUser = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/user/delete/' + id, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
            )
            return data;
        } catch (e) {
            return false;
        }
    }
}
export const fetchUserById = async (id) => {
    if (!id) {
        return null;
    } else {
        const { data } = await $host.get('api/user/getbyId/' + id);
        return data;
    }
}