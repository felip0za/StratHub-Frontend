import { Routes, Route } from 'react-router-dom';

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

function MainRoutes() {
  return (
      <Routes>
        <Route path='/' element={<Lendpage />} />
        <Route path='/login' element={<Login />} />
        <Route path='/cadastro' element={<Cadastro />} />
        <Route path='/chatbox' element={<Chatbox />} />
        <Route path='/home' element={<Home />} />
        <Route path='*' element={<h1>404 page not found</h1>} />
        <Route path='/usuario/:id' element={<User />} />
        <Route path='/times/:id' element={<Times />} />
        <Route path='/editar-usuario/:id' element={<EditUser />} />
        <Route path='/criartime' element={<CreateTime />} />
        <Route path='/amigos' element={<Invites />} />
        <Route path='/partida' element={<Partidas />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/fpl' element={<FPL />} />
      </Routes>
  );
}

export default MainRoutes;
