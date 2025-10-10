// CampeonatoDetalhes.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApi } from '../../Services/API';
import './CampeonatoDetalhes.css';
import LoadingScreen from '../../Components/LoadingScreen/LoadingScreen';

const CampeonatoDetalhes = () => {
  const { id } = useParams(); // Pega o id do campeonato da URL
  const [campeonato, setCampeonato] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    const fetchCampeonato = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/campeonatos/${id}`);
        setCampeonato(response.data);
      } catch (err) {
        console.error('Erro ao buscar campeonato:', err);
        setError('❌ Não foi possível carregar os dados do campeonato.');
      } finally {
        setLoading(false);
      }
    };
    fetchCampeonato();
  }, [id, api]);

  const handleEntrar = () => {
    if (campeonato.statusCampeonato === 'ABERTO') {
      // Aqui você pode chamar a API para entrar no campeonato
      alert(`Entrando no campeonato: ${campeonato.descricao}`);
    } else {
      alert('Este campeonato não está aberto para participação.');
    }
  };

  if (loading) return <LoadingScreen />;
  if (error) return <p className="error">{error}</p>;
  if (!campeonato) return <p>Campeonato não encontrado.</p>;

  const statusFormatado = (status) => {
    switch (status) {
      case 'ABERTO':
        return { texto: 'Aberto', classe: 'aberto' };
      case 'EM_ANDAMENTO':
        return { texto: 'Em andamento', classe: 'em_andamento' };
      case 'FECHADO':
        return { texto: 'Fechado', classe: 'fechado' };
      default:
        return { texto: '-', classe: '' };
    }
  };

  const status = statusFormatado(campeonato.statusCampeonato);

  return (
    <div className="detalhes-container">
      <h1>{campeonato.descricao}</h1>
      {campeonato.imagemCampeonato && (
        <img
          src={campeonato.imagemCampeonato}
          alt={campeonato.descricao}
          className="campeonato-img"
        />
      )}
      <p><strong>Prêmio:</strong> R$ {campeonato.premio}</p>
      <p><strong>Valor por equipe:</strong> R$ {campeonato.valorEquipe}</p>
      <p><strong>Número de equipes selecionadas:</strong> {campeonato.numeroEquipesSelecionadas}</p>
      <p><strong>Status:</strong> <span className={status.classe}>{status.texto}</span></p>
      <p><strong>Tipo:</strong> {campeonato.tipoCampeonato === 'GRATIS' ? 'Gratuito' : 'Pago'}</p>
      
      {campeonato.statusCampeonato === 'ABERTO' ? (
        <button className="btn-entrar" onClick={handleEntrar}>Entrar no Campeonato</button>
      ) : (
        <button className="btn-fechado" disabled>Fechado</button>
      )}
    </div>
  );
};

export default CampeonatoDetalhes;
