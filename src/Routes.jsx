import { Routes,Route } from 'react-router-dom';
import Presentation from './Pages/Presentation/Presentation';
import Login from './Pages/Login/Login';
import Cadastro from './Pages/Cadastro/Cadastro';
import Chatbox from './Pages/Chatbox/Chatbox';
import Home from './Pages/Home/Home';



function MainRoutes() {
  

  return (
    <>
     <Routes>
      <Route path='/' element={<Presentation />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/cadastro' element={<Cadastro/>}/>
      <Route path='*' element={<h1>404 page not found</h1>}/>
      <Route path='/chatbox' element={<Chatbox/>}/>
      <Route path='/home' element={<Home />}/>

     </Routes>
    </>
  );
};

export default MainRoutes;
