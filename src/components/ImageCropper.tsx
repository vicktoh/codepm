import React, { FC, useState } from "react";
import { Flex, Container, Button, Divider, Image } from "@chakra-ui/react";
import "react-image-crop/dist/ReactCrop.css";
import ReactCrop, { Crop } from "react-image-crop";
import { getCroppedImg } from "../services/helpers";

type ImageCropperProps = {
  setInput: (value: any) => void;
  onClose: () => void;
  src: string;
};

export const ImageCropper: FC<ImageCropperProps> = ({
  setInput,
  onClose,
  src,
}) => {
  const [crop, setCrop] = useState<Crop & { aspect?: number }>({
    unit: "%",
    width: 30,
    x: 0,
    y: 0,
    height: 30,
    aspect: 1 / 1,
  });
  const [imageBlob, setImageBlob] = useState<HTMLImageElement>();

  const cropImage = async () => {
    if (!imageBlob) return;
    const croppedImageBlob = await getCroppedImg(imageBlob, crop);
    setInput(croppedImageBlob);
    onClose();
  };
  return (
    <Container centerContent maxWidth="md">
      <Flex alignItems="center" justifyContent="center">
        <ReactCrop aspect={1} onChange={(crop) => setCrop(crop)} crop={crop}>
          <Image src={src} onLoad={(e) => setImageBlob(e.currentTarget)} />
        </ReactCrop>
      </Flex>
      <Flex alignItems="center" mt={3} width="100%">
        <Divider orientation="horizontal" width="100%" />
      </Flex>

      <Flex direction="column" width="100%" px={5} mt={5}>
        <Button
          colorScheme="brand"
          onClick={() => onClose()}
          fontSize={{ base: "sm", lg: "md" }}
          variant="outline"
          size="md"
          width="100%"
        >
          Cancel
        </Button>
        <Button
          fontSize={{ base: "sm", lg: "md" }}
          onClick={() => cropImage()}
          variant="primary"
          bg="brand.500"
          color="white"
          size="md"
          width="100%"
          mt={2}
        >
          Crop
        </Button>
      </Flex>
    </Container>
  );
};
