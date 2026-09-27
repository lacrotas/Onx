import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { fetchAllQwestion, postQwestion, updateQwestion, deleteQwestion } from '../../../http/qwestionApi';
import { useAdminTable } from '../shared/hooks/useAdminTable';
import AdminPageHeader from '../shared/components/AdminPageHeader';
import { AdminTable } from '../shared/components/AdminTable';
import { AdminModal } from '../shared/components/AdminModal';

const COLUMNS = [
    { label: 'ID', sortKey: 'id', width: '70px' },
    { label: 'Вопрос', sortKey: 'qwestion', width: '35%' },
    { label: 'Ответ / Описание' },
    { label: 'Действия', align: 'right', width: '130px' }
];

export default function QuestionTable() {
    const [questions, setQuestions] = useState([]);
    const [formData, setFormData] = useState({
        qwestion: '',
        description: ''
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
        items: questions,
        searchFields: ['qwestion', 'description'],
        initialSort: { key: 'id', direction: 'ascending' }
    });

    useEffect(() => {
        loadQuestions();
    }, []);

    const loadQuestions = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllQwestion();
            setQuestions(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Ошибка загрузки вопросов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormData({ qwestion: '', description: '' });
        openAddModal();
    };

    const handleOpenEdit = (q) => {
        setFormData({
            qwestion: q.qwestion || '',
            description: q.description || ''
        });
        openEditModal(q);
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
            fd.append("qwestion", formData.qwestion || '');
            fd.append("description", formData.description || '');

            if (editingItem) {
                await updateQwestion(editingItem.id, fd);
            } else {
                await postQwestion(fd);
            }

            await loadQuestions();
            closeModal();
        } catch (error) {
            console.error('Ошибка сохранения вопроса:', error);
            alert('Ошибка при сохранении');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот вопрос?')) {
            try {
                await deleteQwestion(id);
                await loadQuestions();
            } catch (error) {
                console.error('Ошибка удаления вопроса:', error);
                alert('Ошибка при удалении');
            }
        }
    };

    return (
        <div className="admin-page-container">
            <AdminPageHeader
                title="Частые вопросы (FAQ)"
                count={questions.length}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                searchPlaceholder="Поиск вопроса..."
                onAdd={handleOpenAdd}
                addButtonText="Добавить вопрос"
            />

            <AdminTable
                columns={COLUMNS}
                data={filteredItems}
                sortConfig={sortConfig}
                onSort={requestSort}
                getSortIndicator={getSortIndicator}
                isLoading={isLoading}
                emptyMessage="Вопросы не найдены"
                renderRow={(q) => (
                    <tr key={q.id}>
                        <td style={{ color: '#64748b', fontWeight: 600 }}>#{q.id}</td>
                        <td style={{ fontWeight: 600 }}>{q.qwestion}</td>
                        <td style={{ color: '#94a3b8', lineHeight: 1.5 }}>{q.description || '—'}</td>
                        <td className="text-right">
                            <div className="action-buttons-group">
                                <button
                                    type="button"
                                    className="btn-action edit"
                                    onClick={() => handleOpenEdit(q)}
                                    title="Редактировать"
                                >
                                    <FiEdit2 />
                                </button>
                                <button
                                    type="button"
                                    className="btn-action delete"
                                    onClick={() => handleDelete(q.id)}
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
                title={editingItem ? 'Редактирование вопроса' : 'Новый вопрос'}
                subtitle="Вопросы и ответы отображаются на сайте для покупателей"
                onSubmit={handleSubmit}
                isSubmitting={isSaving}
                submitText={editingItem ? 'Сохранить изменения' : 'Создать вопрос'}
            >
                <div className="admin-form-group">
                    <label className="admin-form-label">
                        Вопрос <span className="required">*</span>
                    </label>
                    <input
                        type="text"
                        name="qwestion"
                        value={formData.qwestion}
                        onChange={handleInputChange}
                        placeholder="Например: Как оформить доставку в другой город?"
                        required
                        className="admin-form-input"
                    />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">
                        Ответ / Описание <span className="required">*</span>
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Подробный ответ на вопрос"
                        required
                        className="admin-form-textarea"
                        style={{ minHeight: '120px' }}
                    />
                </div>
            </AdminModal>
        </div>
    );
}