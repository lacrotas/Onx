import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiExternalLink } from 'react-icons/fi';
import { fetchAllSliders, postSlider, updateSlider, deleteSlider } from '../../../http/SliderApi';
import { useAdminTable } from '../shared/hooks/useAdminTable';
import AdminPageHeader from '../shared/components/AdminPageHeader';
import { AdminTable } from '../shared/components/AdminTable';
import { AdminModal } from '../shared/components/AdminModal';
import { ImageUploader } from '../shared/components/ImageUploader';

const COLUMNS = [
    { label: 'ID', sortKey: 'id', width: '70px' },
    { label: 'Баннер', width: '150px' },
    { label: 'Название', sortKey: 'label' },
    { label: 'Описание' },
    { label: 'Ссылка' },
    { label: 'Действия', align: 'right', width: '130px' }
];

export default function SliderTable() {
    const [sliders, setSliders] = useState([]);
    const [formData, setFormData] = useState({
        label: '',
        image: null,
        description: '',
        link: ''
    });

    const {
        searchTerm,
        handleSearch,
        sortConfig,
        requestSort,
        getSortIndicator,
        filteredItems,
        isModalOpen,
        editingItem,
        openAddModal,
        openEditModal,
        closeModal,
        isLoading,
        setIsLoading,
        isSaving,
        setIsSaving
    } = useAdminTable({
        items: sliders,
        searchFields: ['label', 'description', 'link'],
        initialSort: { key: 'id', direction: 'ascending' }
    });

    useEffect(() => {
        loadSliders();
    }, []);

    const loadSliders = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllSliders();
            setSliders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Ошибка загрузки слайдеров:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormData({ label: '', image: null, description: '', link: '' });
        openAddModal();
    };

    const handleOpenEdit = (slider) => {
        setFormData({
            label: slider.label || '',
            image: slider.image || null,
            description: slider.description || '',
            link: slider.link || ''
        });
        openEditModal(slider);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const fd = new FormData();
            fd.append("label", formData.label || '');
            fd.append("description", formData.description || '');
            fd.append("link", formData.link || '');

            if (formData.image instanceof File) {
                fd.append("image", formData.image);
            }

            if (editingItem) {
                await updateSlider(editingItem.id, fd);
            } else {
                await postSlider(fd);
            }

            await loadSliders();
            closeModal();
        } catch (error) {
            console.error('Ошибка сохранения слайдера:', error);
            alert('Ошибка при сохранении слайдера');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот слайд?')) {
            try {
                await deleteSlider(id);
                await loadSliders();
            } catch (error) {
                console.error('Ошибка удаления слайдера:', error);
                alert('Ошибка при удалении');
            }
        }
    };

    return (
        <div className="admin-page-container">
            <AdminPageHeader
                title="Слайдеры"
                count={sliders.length}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                searchPlaceholder="Поиск слайда..."
                onAdd={handleOpenAdd}
                addButtonText="Добавить слайд"
            />

            <AdminTable
                columns={COLUMNS}
                data={filteredItems}
                sortConfig={sortConfig}
                onSort={requestSort}
                getSortIndicator={getSortIndicator}
                isLoading={isLoading}
                emptyMessage="Слайдеры не найдены"
                renderRow={(slider) => (
                    <tr key={slider.id}>
                        <td style={{ color: '#64748b', fontWeight: 600 }}>#{slider.id}</td>
                        <td>
                            {slider.image ? (
                                <img
                                    src={`${process.env.REACT_APP_API_URL}static/images/${slider.image}`}
                                    alt={slider.label}
                                    style={{
                                        width: '100px',
                                        height: '46px',
                                        objectFit: 'cover',
                                        borderRadius: '6px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}
                                />
                            ) : (
                                <span style={{ color: '#64748b', fontSize: '12px' }}>Нет баннера</span>
                            )}
                        </td>
                        <td style={{ fontWeight: 600 }}>{slider.label}</td>
                        <td style={{ color: '#94a3b8', maxWidth: '280px' }}>{slider.description || '—'}</td>
                        <td>
                            {slider.link ? (
                                <a 
                                    href={slider.link} 
                                    target="_blank" 
                                    rel="noreferrer" 
                                    style={{ color: '#6366f1', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                >
                                    <span>{slider.link}</span>
                                    <FiExternalLink style={{ fontSize: '12px' }} />
                                </a>
                            ) : '—'}
                        </td>
                        <td className="text-right">
                            <div className="action-buttons-group">
                                <button
                                    type="button"
                                    className="btn-action edit"
                                    onClick={() => handleOpenEdit(slider)}
                                    title="Редактировать"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    type="button"
                                    className="btn-action delete"
                                    onClick={() => handleDelete(slider.id)}
                                    title="Удалить"
                                >
                                    <FiTrash2 />
                                </button>
                            </div>
                        </td>
                    </tr>
                )}
            />

            <AdminModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingItem ? 'Редактирование слайда' : 'Новый слайд'}
                subtitle="Настройте заголовок, баннер и ссылку для перехода"
                onSubmit={handleSubmit}
                isSubmitting={isSaving}
                submitText={editingItem ? 'Сохранить изменения' : 'Создать слайд'}
            >
                <div className="admin-form-group">
                    <label className="admin-form-label">
                        Название слайда <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="label"
                        value={formData.label}
                        onChange={handleInputChange}
                        placeholder="Например: Скидки до 50% на аксессуары"
                        required
                        className="admin-form-input"
                    />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Описание</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Краткое описание акции или предложения"
                        className="admin-form-textarea"
                    />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Ссылка для перехода</label>
                    <input
                        type="text"
                        name="link"
                        value={formData.link}
                        onChange={handleInputChange}
                        placeholder="Например: /kategory/sale или https://..."
                        className="admin-form-input"
                    />
                </div>

                <div className="admin-form-group">
                    <ImageUploader
                        label="Баннер слайдера"
                        value={formData.image}
                        onChange={(file) => setFormData(prev => ({ ...prev, image: file }))}
                        onRemove={() => setFormData(prev => ({ ...prev, image: null }))}
                    />
                </div>
            </AdminModal>
        </div>
    );
}