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

/* main kategory */
export const fetchAllMainKategory = async () => {
    const { data } = await $host.get('api/mainKategoryRouter/getAll');
    return data;
}
export const postMainKategory = async (item) => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.post('api/mainKategoryRouter/add', item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        alert("Данные успешно добавлены");
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

export const deleteMainKategoryById = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.delete('api/mainKategoryRouter/delete/' + id, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
        )
        alert("Данные успешно удалены");
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
export const updateMainKategory = async (id, item) => {
    if (checkId(id)) {
        return null;
    }
    try {
        const token = localStorage.getItem('token');
        const { data } = await $host.put('api/mainKategoryRouter/update/' + id, item, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        alert("Данные успешно удалены");
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
export const fetchMainKategoryById = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const token = localStorage.getItem('token');
    try {
        const { data } = await $host.get('api/mainKategoryRouter/getMainKategoryById/' + id)
        return data;
    } catch {
        return false
    }
}

/* kategory */
export const fetchAllKategory = async () => {
    const { data } = await $host.get('api/kategoryRouter/getAll');
    return data;
}
export const fetchAllKategoryByMainKategoryId = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const { data } = await $host.get('api/kategoryRouter/getAllKategory/' + id);
    return data;
}
export const fetchKategoryById = async (id) => {
    if (checkId(id)) {
        return null;
    }
    const { data } = await $host.get('api/kategoryRouter/getKategory/' + id);
    return data;
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
        alert("Категория успешно удалена");
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
        alert("Категория успешно удалена");
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
        alert("Добавить категорию");
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
        alert("Обновление категории успешно");
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
        alert("Удаление категорий успешно");
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
// export const deleteOneSlider = async (id) => {
//     if (!id || isNaN(id)) {
//         return null;
//     } else {
//         const token = localStorage.getItem('token');
//         const { data } = await $host.delete('api/sliderRouter/delete/' + id, {
//             headers: {
//                 Authorization: `Bearer ${token}`
//             }
//         }
//         )
//         return data;
//     }
// }

// export const fetchOneMeating = async (id) => {
//     if (!id || isNaN(id)) {
//         return null;
//     } else {
//         const { data } = await $host.get('api/meating/' + id)
//         return data;
//     }
// }

// export const deleteMeatingsByCityId = async (id) => {
//     if (!id || isNaN(id)) {
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