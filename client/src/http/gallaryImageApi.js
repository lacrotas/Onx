import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const fetchAllGallaryImageByCityId = async (id) => {
    const { data } = await $host.get('api/gallaryImage/getAllImage/' + id)
    return data
}
export const postGallaryImage = async (image) => {
    const token = localStorage.getItem('token');
    const { data } = await $host.post('api/gallaryImage/addImage', image, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return data
}
export const deleteGallatyImageById = async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await $host.delete('api/gallaryImage/deleteImage/' + id, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return data
}
export const deleteAllGallatyImageByCityId = async (id) => {
    const token = localStorage.getItem('token');
    const { data } = await $host.delete('api/gallaryImage/deleteAllImage/' + id, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    return data
}