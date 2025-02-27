import { Routes,Route } from 'react-router-dom';
import Presentation from './Pages/Presentation/Presentation';
import Login from './Pages/Login/Login';
import Cadastro from './Pages/Cadastro/Cadastro';

function MainRoutes() {
  

  return (
    <>
     <Routes>
      <Route path='/' element={<Presentation />}/>
      <Route path='/login' element={<Login />}/>
      <Route path='/cadastro' element={<Cadastro/>}/>
      <Route path='*' element={<h1>404 page not found</h1>}/>

     </Routes>
    </>
  );
};

export default MainRoutes;
