import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { type CarouselApi } from "@/components/ui/carousel";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useEffect, useState } from "react";
import Autoplay from "embla-carousel-autoplay";

const merchandiseProducts = [
  {
    id: 1,
    title: "Camiseta 'Blanca'",
    description: "Hecha con algodón premium, resistente y cómoda para cualquier misión.",
    image: "/images/Camisa1.avif",
    whatsappUrl: "https://wa.me/593995875130?text=Hola, estoy interesado en la Camiseta Blanca."
  },
  {
    id: 2,
    title: "Taza Coleccionable",
    description: "Empieza tu día con la taza oficial. Cerámica de alta calidad.",
    image: "/images/Taza1.avif",
    whatsappUrl: "https://wa.me/593995875130?text=Hola, estoy interesado en la Taza Coleccionable."
  },
  {
    id: 3,
    title: "Botella deportiva 'Blanca'",
    description: "Protección y estilo en el juego.",
    image: "/images/Tomatodo1.avif",
    whatsappUrl: "https://wa.me/593995875130?text=Hola, estoy interesado en la la botalla 'Blanca'."
  },
  {
    id: 4,
    title: "Abrido 'Blanco'",
    description: "Muestra tu lealtad con este abrigo de alta calidad.",
    image: "/images/Abrigo1.avif",
    whatsappUrl: "https://wa.me/593995875130?text=Hola, estoy interesado en el Abrigo 'Blanco'."
  },
  {
    id: 5,
    title: "Botella deportiva",
    description: "Mantente hidratado. Acero inoxidable, con aislamiento térmico.",
    image: "/images/Tomatodo2.avif",
    whatsappUrl: "https://wa.me/593995875130?text=Hola, estoy interesado en la Botella de Agua 'deportiva'."
  },
  {
    id: 6,
    title: "Camiseta 'Blanca'",
    description: "Hecha con algodón premium, resistente y cómoda.",
    image: "/images/Camisa2.avif",
    whatsappUrl: "https://wa.me/593995875130?text=Hola, estoy interesado en la Camisa 'Blanca 2'."
  },
];

export default function Productos() {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
  }, [api]);

  return (
    <section className="w-full py-6 md:py-12 lg:py-16">
      <div className="relative px-0 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
              Patrocina <span className="text-[#0ae98a] font-bold">nuestro proyecto</span>
            </h2>
            <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Por la compra de cada producto tendrás grandes beneficios en todo <span className="text-[#0ae98a] font-bold">ssedee</span>
            </p>
          </div>
        </div>
        <Carousel
          setApi={setApi}
          className="w-full mt-15"
          plugins={[
            Autoplay({
              delay: 3000,
              stopOnInteraction: true,
            }),
          ]}
          opts={{
            align: "start",
            loop: true,
          }}
        >
          <CarouselContent className="-ml-4">
            {merchandiseProducts.map((product) => (
              <CarouselItem key={product.id} className="pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <Card className="overflow-hidden rounded-lg w-full bg-gradient-to-br from-[#13161c]/75 to-[#07080a] border-none hover:border-[#0ae98a]">
                  <CardContent className="p-0">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4">
                      <h3 className="text-sm font-bold text-white">{product.title}</h3>
                      <p className="text-xs text-gray-300  h-12 mt-1">
                        {product.description}
                      </p>
                      <Button asChild className="w-full mt-4 bg-[#0ae98a] text-[#07080a] font-bold hover:bg-[#0ae98a]/40">
                        <a href={product.whatsappUrl} target="_blank" rel="noopener noreferrer">
                          Contactar por WhatsApp
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  );
}