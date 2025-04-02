import React from 'react';
import './Times.css';
import Navbar from '../../Components/Navbar/Navbar';
import R6HubLogo from "/src/assets/R6HubLogo.png";

function Times(){
    const user = {
        ubi: 'J4iminh0',
        apelido: 'Jaime Silva',
        photo: 'https://via.placeholder.com/150', // URL da foto do usuário
        kd: '1.0'
      };

      const time ={
        nome: 'THE DRAGONS FURY',
        descricao: 'Time de R6 | 1x🏆'  
      };

      const campeonato={
        nome:'ORG.camp',
        placement:'1º lugar'
      };
      
    const handleEdit = (e) => {
        e.preventDefault();
        navigate("/login");
    }
    
    return (
        <>
        <Navbar />
        <div className="container">
            {/* Lado esquerdo - Logo e informações */}
            <div className="logo-section">
                <div className="logo-border">
                    <img src={R6HubLogo} alt="Logo do sistema" className="logo" />
                </div>
                <h1 className="description-title">DESCRIÇÃO:</h1>
                <p className='description-label'>{time.descricao}</p>

                <div className="button-group">
                    <button onClick={handleEdit} className="edit-time">Editar time</button>
                </div>
            </div>
            
            {/* Lado direito - Lista de jogadores */}
            <div className="team-section">
                <h2 className="team-name">{time.nome}</h2>
                <div className="player-list">
                    {[...Array(1)].map((_, index) => (
                        <div className="member-card" key={index}>
                            <img src={R6HubLogo} alt="Logo do sistema" className="member-avatar" />
                            <div className="member-info">
                                <p className="member-name">apelido: {user.apelido}</p>
                                <p className="member-id">ubi: {user.ubi}</p>
                                <p className="kd-info">KD: {user.kd}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="button-group">
                <button className="add-member">ADICIONAR MEMBRO +</button>
                </div>

                {/*lado esquerdo inferior - lista de titulos*/}
                <div className='tournament-titles'>
                    <h2 classname ='tournament-title'>TITULOS:</h2>
                    {[...Array(1)].map((_, index) => (
                        <div className="title-card" key={index}>
                            <div className="title-info">
                                <h1 className="tournament-name">{campeonato.nome}</h1>
                                <p className="placement">{campeonato.placement}</p>
                            </div>
                        </div>
                    ))}
                </div>
                
            </div>
        </div>
        </>
    );
};

export default Times;
