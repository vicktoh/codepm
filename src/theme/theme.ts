import { extendTheme } from "@chakra-ui/react";
import Text from "./Text";
import Heading from "./Heading";
import IconButton from "./IconButton";

const colors = {
  brand: {
    900: "#E51D2A",
    800: "#E51D2A",
    700: "#E51D2A",
    600: "#E51D2A",
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
    100: "#B2AEAD",
  },
};

const fonts = {
  heading: "Poppins, sans-serif",
  body: "Lato, sans-serif",
};

export const theme = extendTheme({
  colors,
  fonts,
  components: { Text, Heading, IconButton },
});
