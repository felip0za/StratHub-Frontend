import { Routes, Route } from 'react-router-dom';

import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import Login from './Pages/Login/Login';
import Cadastro from './Pages/Cadastro/Cadastro';
import Chatbox from './Pages/Chatbox/Chatbox';
import Home from './Pages/Home/Home';
import User from './Pages/Usuario/User/User';
import Times from './Pages/Time/Times/Times';
import CreateTime from './Pages/Time/CreateTime/CreateTime';
import Invites from './Pages/Invites/Invites';
import Partidas from './Pages/Partidas/Partidas';
import Profile from './Pages/Profiles/Profile';
import FPL from './Pages/Lobbys/FPL/FPL';
import EditUser from './Pages/Usuario/EditUser/EditUser';
import EliteCup from './Pages/EliteCup/EliteCup';
import Campeonatos from './Pages/Campeonatos/Campeonatos';
import EditTime from './Pages/Time/EditTime/EditTime';
import Landpage from './Pages/Landpage/Landpage';
import CriarCampeonatos from './Pages/Campeonatos/CriarCampeonatos/CriarCampeonatos';
import ListarCampeonatos from './Pages/Campeonatos/ListarCampeonatos/ListarCampeonatos';
import InfoEditCampeonatos from './Pages/Campeonatos/ExibirInformaçoesCampeonatos/InfoEditCampeonatos';
import InfoCampeonatos from './Pages/Campeonatos/Campeonatos';
import CampeonatoDetalhes from './Pages/Campeonatos/CampeonatosDetalhes/CampeonatosDetalhes';

function MainRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Landpage />} />
      <Route path='/login' element={<Login />} />
      <Route path='/cadastro' element={<Cadastro />} />
      <Route path='/home' element={<Home />} />
      <Route path='/chatbox' element={
        <PrivateRoute>
          <Chatbox />
        </PrivateRoute>
      } />
      
      <Route path='/usuario/:id' element={
        <PrivateRoute>
          <User />
        </PrivateRoute>
      } />

      <Route path='/eliteCup' element={
        <PrivateRoute>
          <EliteCup />
        </PrivateRoute>
      } />
      <Route path='/times/:id' element={
        <PrivateRoute>
          <Times />
        </PrivateRoute>
      } />
      <Route path='/criar-campeonatos' element={
        <PrivateRoute>
          <CriarCampeonatos/>
        </PrivateRoute>
      } />

      <Route path='/meus-campeonatos' element={
        <PrivateRoute>
          <ListarCampeonatos />
        </PrivateRoute>
      } />

      <Route path='/info-campeonato' element={
        <PrivateRoute>
          <InfoCampeonatos />
        </PrivateRoute>
      } />

      <Route path='/info-campeonato/:id' element={
        <PrivateRoute>
          <InfoEditCampeonatos />
        </PrivateRoute>
      } />

      <Route path='/campeonatos/:id' element={
        <PrivateRoute>
          <CampeonatoDetalhes />
        </PrivateRoute>
      } />
      
      <Route path='/editar-usuario/:id' element={
        <PrivateRoute>
          <EditUser />
        </PrivateRoute>
      } />
      <Route path='/editar-time/:id' element={
        <PrivateRoute>
          <EditTime />
        </PrivateRoute>
      } />
      <Route path='/criartime' element={
        <PrivateRoute>
          <CreateTime />
        </PrivateRoute>
      } />
      <Route path='/amigos' element={
        <PrivateRoute>
          <Invites />
        </PrivateRoute>
      } />
      <Route path='/partida' element={
        <PrivateRoute>
          <Partidas />
        </PrivateRoute>
      } />
      <Route path='/profile/:id' element={
        <PrivateRoute>
          <Profile />
        </PrivateRoute>
      } />
      <Route path='/fpl' element={
        <PrivateRoute>
          <FPL />
        </PrivateRoute>
      } />
      <Route path='/campeonatos' element={
        <PrivateRoute>
          <Campeonatos />
        </PrivateRoute>
      } />
      <Route path='*' element={<h1>404 page not found</h1>} />
    </Routes>
  );
}

export default MainRoutes;
