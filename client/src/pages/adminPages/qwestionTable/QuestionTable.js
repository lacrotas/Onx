// QuestionTable.jsx
import React, { useState, useEffect } from 'react';
import { fetchAllQwestion, postQwestion, updateQwestion, deleteQwestion } from '../../../http/qwestionApi';
import "./QuestionTable.scss";

const QuestionTable = () => {
    const [questions, setQuestions] = useState([]);
    const [filteredQuestions, setFilteredQuestions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);
    const [formData, setFormData] = useState({
        qwestion: '',
        description: ''
    });

    // Load questions on component mount
    useEffect(() => {
        loadQuestions();
    }, []);

    // Filter questions based on search term
    useEffect(() => {
        const filtered = questions.filter(question =>
            question.qwestion.toLowerCase().includes(searchTerm.toLowerCase()) ||
            question.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredQuestions(filtered);
    }, [searchTerm, questions]);

    const loadQuestions = async () => {
        try {
            const data = await fetchAllQwestion();
            setQuestions(data);
            setFilteredQuestions(data);
        } catch (error) {
            console.error('Error loading questions:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openAddModal = () => {
        setEditingQuestion(null);
        setFormData({
            qwestion: '',
            description: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (question) => {
        setEditingQuestion(question);
        setFormData({
            qwestion: question.qwestion,
            description: question.description
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingQuestion(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        try {
            myFormData.append("qwestion", formData.qwestion);
            myFormData.append("description", formData.description);
            
            if (editingQuestion) {
                await updateQwestion(editingQuestion.id, myFormData);
            } else {
                await postQwestion(myFormData);
            }
            loadQuestions(); // Обновляем список после сохранения
            closeModal();
        } catch (error) {
            console.error('Error saving question:', error);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            deleteQwestion(id).then(() => {
                loadQuestions(); // Обновляем список после удаления
            }).catch(error => {
                console.error('Error deleting question:', error);
            });
        }
    };

    return (
        <div className="adminQuestionTable">
            <div className="admin-header">
                <h1>Вопросы</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Найти вопрос..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button onClick={openAddModal} className="add-button">
                    Добавить вопрос
                </button>
            </div>

            <div className="table-container">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Вопрос</th>
                            <th>Описание</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredQuestions.map(question => (
                            <tr key={question.id}>
                                <td>{question.id}</td>
                                <td>{question.qwestion}</td>
                                <td>{question.description}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() => openEditModal(question)}
                                        className="edit-button"
                                    >
                                        Обновить
                                    </button>
                                    <button
                                        onClick={() => handleDelete(question.id)}
                                        className="delete-button"
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingQuestion ? 'Обновить' : 'Добавить'}</h2>
                            <button className="close-button" onClick={closeModal}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="qwestion">Вопрос:</label>
                                <input
                                    type="text"
                                    id="qwestion"
                                    name="qwestion"
                                    value={formData.qwestion}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Описание:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    rows="4"
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={closeModal} className="cancel-button">
                                    Отмена
                                </button>
                                <button type="submit" className="save-button">
                                    {editingQuestion ? 'Обновить' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuestionTable;