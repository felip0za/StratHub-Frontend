import Navbar from "../../../Components/Navbar/Navbar";
import api from "../../../Services/API";
import { useState } from "react";
import { useNavigate,useParams } from "react-router-dom";

function EditUser(){
    const[usuario, setUsuario] = useState('');
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
    async function fetchUsuario() {
      try {
        const { data } = await api.get(`/usuario/${id}`);
        setUsuario(data);
      } catch (err) {
        setError('Usuário não encontrado ou erro ao carregar os dados.');
      } finally {
        setLoading(false);
      }
    }

    fetchUsuario();
  }, [id]);
}
    
    