import React, { useEffect, useState } from "react";
import "./Campeonatos.css";
import Navbar from "../../Components/Navbar/Navbar";
import LoadingScreen from "../../Components/LoadingScreen/LoadingScreen";

function Campeonatos() {
  const [campeonatos, setCampeonatos] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const dadosFalsos = [
        { nome: "Liga dos Campeões", times: 16 },
        { nome: "Copa do Brasil", times: 12 },
        { nome: "Brasileirão", times: 20 },
        { nome: "Libertadores", times: 8 },
      ];

      const embaralhado = dadosFalsos.sort(() => 0.5 - Math.random());
      setCampeonatos(embaralhado);
      setLoading(false);
    }, 1000); // simula 1 segundo de carregamento

    return () => clearTimeout(timeout);
  }, []);

  const campeonatosFiltrados = campeonatos.filter((c) =>
    c.nome.toLowerCase().includes(filtro.toLowerCase())
  );

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <>
      <Navbar />
      <div className="campeonatos-page">
        <div className="campeonatos-container">
          <h1>CAMPEONATOS DISPONÍVEIS</h1>

          <input
            type="text"
            placeholder="Pesquisar campeonatos..."
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            className="campo-pesquisa"
          />

          <ul className="campeonatos-lista">
            {campeonatosFiltrados.map((c, index) => (
              <li key={index} className="campeonato-item">
                <span className="campeonato-nome">{c.nome}</span>
                <span className="campeonato-times">{c.times} times</span>
                <button className="campeonato-botao">Entrar</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default Campeonatos;
