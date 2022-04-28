import { Routes, Route} from 'react-router-dom';
import { MainLayout } from '../layout/MainLayout';
import { ChatPage } from '../pages/ChatPage';
import { Dashboard } from '../pages/Dashboard';
import { LogsPage } from '../pages/LogsPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RequisitionPage } from '../pages/RequisitionPage';
import { TasksPage } from '../pages/TasksPage';







export const MainNavigation = ()=> {


   return(
      <Routes>
         <Route path = "/"  element= {<MainLayout/>}>
            <Route  index element= {<Dashboard/>} />
            <Route path='tasks' element= {<TasksPage/>} />
            <Route path='chat' element= {<ChatPage/>} />
            <Route path='logs' element= {<LogsPage/>} />
            <Route path='requisitions' element= {<RequisitionPage/>} />
            <Route path='profile' element= {<ProfilePage/>} />
         </Route>
      </Routes>
   )
}