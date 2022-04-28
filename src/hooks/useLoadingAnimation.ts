import { usePrefersReducedMotion, keyframes, useToast } from '@chakra-ui/react' 
import { useDispatch } from 'react-redux';
import { setAuth } from '../reducers/authSlice';
import { logOut } from '../services/authServices';
 
const fading = keyframes`
  from { opacity: 0; }
  to { opacity: 1 }
`

export const useLoadingAnimation = () =>{
    const perfersReducedMotion = usePrefersReducedMotion();
    return  perfersReducedMotion ? undefined : `${fading} 1.5s linear alternate infinite;`
}

export const useLogout = () => {
  const toast = useToast();
  const disptatch = useDispatch();
  async function onLogout(){
    const res = await logOut();
    if(!res) disptatch(setAuth(null));
    if(res){
      toast({title: "could not log out", description: res?.message || "Unknown error please try again", status: "error"})
    }
  }

  return onLogout;
}