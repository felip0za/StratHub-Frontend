import React, { useState } from 'react';
import './SearchBar.css';  // Importando o CSS

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log('Busca por:', searchTerm);
    // Aqui você pode adicionar a lógica para o que deve acontecer quando o formulário for enviado
  };

  return (
    <div className="search-container">
      <form className = "formulairo" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Pesquise algo..."
          value={searchTerm}
          onChange={handleInputChange}
          className="search-input"
        />
        <button type="submit" className="search-button">
          Buscar
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
