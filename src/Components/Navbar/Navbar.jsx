import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import R6HubLogo from "/src/assets/R6HubLogo.png";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const userBalance = 125.50; // Substitua pelo valor vindo da API ou do estado global

    return (
        <header>
            <nav className="nav">
                <img src={R6HubLogo} alt="Logo do sistema" onClick={() => navigate("/")} className="nav-logo"/>
                <span onClick={() => navigate("/home")} className="nav-link">
                    Salas
                </span>
                <span onClick={() => navigate("/chatbox")} className="nav-link">
                    Campeonatos (em Breve)
                </span>
                <span onClick={() => navigate("/times")} className="nav-link">
                    Seu time
                </span>
                
                <div className="user-info">
                <span onClick={() => navigate("/user")} className="user-balance">R$ {userBalance.toFixed(2)}</span>
                    <FaUserCircle 
                        className="profile-icon" 
                        onClick={() => navigate("/user")} 
                    />
                </div>
            </nav>
        </header>
    );
}

export default Navbar;
