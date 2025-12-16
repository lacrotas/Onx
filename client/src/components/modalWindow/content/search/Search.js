// Search.js
import "./Search.scss";
import { useState } from "react";
import { useHistory } from "react-router-dom"; // ← v5
import { ITEM_SEARCH_ROUTE } from "../../../../pages/appRouter/Const";
import { FiSearch } from 'react-icons/fi';

function Search({ setIsModalActive }) {
    const [itemName, setItemName] = useState("");
    const history = useHistory(); // ← v5

    const handleSearch = () => {
        if (itemName.trim()) {
            // Формируем URL с query-параметром
            const searchQuery = encodeURIComponent(itemName.trim());
            history.push(`${ITEM_SEARCH_ROUTE}?q=${searchQuery}`);
        }
        setIsModalActive(false)
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="search">
            <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={handleKeyDown}
                className="search_input my_p common_reg"
                type="text"
                placeholder="Введите название товара"
            />
            <FiSearch onClick={handleSearch} className="icon" />
        </div>
    );
}

export default Search;