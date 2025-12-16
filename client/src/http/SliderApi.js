import { $authHost, $host } from "./index";
import jwt_decode from "jwt-decode";

export const fetchAllSliders = async () => {
    const { data } = await $host.get('api/sliderRouter/getAll');
    return data;
}
export const postSlider = async (slider) => {
    const token = localStorage.getItem('token');
    const { data } = await $host.post('api/sliderRouter/add', slider, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    return data;
}

export const updateSlider = async (id, slider) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.put('api/sliderRouter/update/' + id, slider, {
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

export const deleteSlider = async (id) => {
    if (!id) {
        return null;
    } else {
        const token = localStorage.getItem('token');
        try {
            const { data } = await $host.delete('api/sliderRouter/delete/' + id, {
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

// export const fetchOneMeating = async (id) => {
//     if (!id) {
//         return null;
//     } else {
//         const { data } = await $host.get('api/meating/' + id)
//         return data;
//     }
// }

// export const deleteMeatingsByCityId = async (id) => {
//     if (!id) {
//         return null;
//     } else {
//         try {
//             const token = localStorage.getItem('token');
//             const { data } = await $host.delete('api/meating/deleteByCityId/' + id, {
//                 headers: {
//                     Authorization: `Bearer ${token}`
//                 }
//             }
//             )
//             return data;
//         } catch (e) { }
//     }
// }