import { Routes, Route } from 'react-router-dom';

import PrivateRoute from './Components/PrivateRoute/PrivateRoute';
import Lendpage from './Pages/Lendpage/Lendpage';
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
import Ranking from './Pages/Ranking/Ranking';
import Campeonatos from './Pages/Campeonatos/Campeonatos';

function MainRoutes() {
  return (
    <Routes>
      <Route path='/' element={<Lendpage />} />
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
      <Route path='/ranking' element={
        <PrivateRoute>
          <Ranking />
        </PrivateRoute>
      } />
      <Route path='/times/:id' element={
        <PrivateRoute>
          <Times />
        </PrivateRoute>
      } />
      <Route path='/editar-usuario/:id' element={
        <PrivateRoute>
          <EditUser />
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
      <Route path='/profile' element={
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
