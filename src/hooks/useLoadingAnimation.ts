import { usePrefersReducedMotion, keyframes } from '@chakra-ui/react' 
 
const fading = keyframes`
  from { opacity: 0; }
  to { opacity: 1 }
`

export const useLoadingAnimation = () =>{
    const perfersReducedMotion = usePrefersReducedMotion();
    return  perfersReducedMotion ? undefined : `${fading} 1.5s linear alternate infinite;`
}