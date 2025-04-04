import { Routes,Route } from 'react-router-dom';
import Lendpage from './Pages/Lendpage/Lendpage';
import Login from './Pages/Login/Login';
import Cadastro from './Pages/Cadastro/Cadastro';
import Chatbox from './Pages/Chatbox/Chatbox';
import Home from './Pages/Home/Home';
import User from './Pages/User/User';
import Times from './Pages/Times/Times';
import CreateTime from './Pages/CreateTime/CreateTime';
import Invites from './Pages/Invites/Invites';

function MainRoutes() {
  

  return (
    <>
     <Routes>
      <Route path='/' element={<Lendpage />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/cadastro' element={<Cadastro/>}/>
      <Route path='/chatbox' element={<Chatbox/>}/>
      <Route path='/home' element={<Home />}/>
      <Route path='*' element={<h1>404 page not found</h1>}/>
      <Route path='/user' element={<User />}/>
      <Route path='/times' element={<Times />}/>
      <Route path='/criartime' element={<CreateTime />}/>
      <Route path='/amigos' element={<Invites />}/>
     </Routes>
    </>
  );
};

export default MainRoutes;
