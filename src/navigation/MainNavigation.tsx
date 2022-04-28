import { Routes, Route} from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { Dashboard } from '../pages/Dashboard';







export const MainNavigation = ()=> {


   return(
      <Routes>
         <Route path = "/"  element= {MainLayout}>
            <Route  index element= {<Dashboard/>} />
            <Route path='tasks' element= {<Dashboard/>} />
            <Route path='chat' element= {<Dashboard/>} />
            <Route path='log' element= {<Dashboard/>} />
            <Route path='requisition' element= {<Dashboard/>} />
         </Route>
      </Routes>
   )
}