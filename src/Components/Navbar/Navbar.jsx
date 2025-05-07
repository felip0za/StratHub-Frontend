import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaUsers } from "react-icons/fa";
import StratHub from "/src/assets/StratHub.png";
import "./Navbar.css";

function Navbar() {
    const user = {
        time: false,
    };
    const navigate = useNavigate();
    const userBalance = 125.50; // Substitua pelo valor vindo da API ou do estado global

    const handleClickVerifyTime = () => {
        if (user.time === false) {
            navigate("/criartime");
        } else {
            navigate("/times");
        }
    };

    return (
        <header>
            <nav className="nav">
                <img src={StratHub} alt="Logo do sistema" onClick={() => navigate("/")} className="nav-logo"/>
                <span onClick={() => navigate("/home")} className="nav-link">
                    Salas
                </span>
                <span onClick={() => navigate("/chatbox")} className="nav-link">
                    Campeonatos (em Breve)
                </span>
                <span onClick={handleClickVerifyTime} className="nav-link">
                    Time
                </span>
                <span onClick={() => navigate("/amigos")} className="nav-link-friends">
                    <FaUsers className="friends-icon" /> 
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