import { Carousel } from "react-bootstrap";
import Image from "next/image";

export const Splash: React.FC<{ photos: string[] }> = ({ photos }) => {
  return (
    <Carousel fade interval={3000}>
      {photos.map((p) => {
        return (
          <Carousel.Item key={p}>
            <Image
              layout="responsive"
              src={p}
              alt="main"
              width={1000}
              height={1000}
              priority
            />
          </Carousel.Item>
        );
      })}
    </Carousel>
  );
};
