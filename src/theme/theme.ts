import { extendTheme } from "@chakra-ui/react";



const colors = {
   brand: {
      500: "#E51D2A",
      400: "#EA5454",
      300: "#EA8181",
      200: "#EEB3B3",
      100: "#F1D6D6",
   },
   tetiary: {
      500: "#281713",
      400: "#4E352F",
      300: "#685550",
      200: "#887F7D",
      100: "#B2AEAD"
   }
}

const fonts = {
   heading: 'Lato, sans-serif',
   body: 'Nunito Sans, sans-serif',
}


export const theme = extendTheme({colors, fonts})