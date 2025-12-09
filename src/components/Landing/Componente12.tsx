import { Card, CardContent } from "@/components/ui/card";
import { Twitter, Instagram } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

const teamMembers = [
  {
    name: "Carlos Riera",
    role: "Fundador",
    image: "/public/images/Persona1.png",
    social: {
      instagram: "#",
      twitter: "#",
    },
  },
  {
    name: "Jennifer Pin",
    role: "Asesora en ventas",
    image: "/public/images/Persona2.png",
    social: {
      instagram: "#",
      twitter: "#",
    },
  },
  {
    name: "Heyner Moreira",
    role: "Desarrollador Frontend",
    image: "/public/images/Persona3.png",
    social: {
      instagram: "#",
      twitter: "#",
    },
  },
  {
    name: "Jhair Chacha",
    role: "Desarrollador Backend",
    image: "/public/images/Persona4.png",
    social: {
      instagram: "#",
      twitter: "#",
    },
  },
  {
    name: "Darwin Esmeralda",
    role: "Desarrollador Backend",
    image: "/public/images/Persona5.png",
    social: {
      instagram: "#",
      twitter: "#",
    },
  },
];

export default function Equipo() {
  return (
    <section className="w-full py-6 md:py-12 lg:py-16">
      <div className="container px-0 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-white">
              Nuestro Equipo
            </h2>
            <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Conoce a las personas que hacen posible nuestro éxito.
            </p>
          </div>
        </div>
          <div className="mt-10 py-4"> {/* Moved styles here */}
          <Carousel
            plugins={[
              Autoplay({
                delay: 3000,
              }),
            ]}
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-5xl mx-auto" // Adjusted for max-width and centering
          >
            <CarouselContent className="-ml-4"> {/* Negative margin to offset CarouselItem padding */}
          {teamMembers.map((member, index) => (
            <CarouselItem key={index} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/4"> {/* Responsive sizing */}
                  <Card className="overflow-hidden bg-transparent border-0 p-0 shadow-none h-100">
              <CardContent className="w-full h-full px-0">
                <div className="overflow-hidden w-full h-full bg-gradient-to-b from-[#13161c]/50 to-[#07080a] rounded-2xl  text-center shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]">
                    <img src={member.image} alt={member.name} className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-0 left-0 w-full h-28 bg-gradient-to-t from-[#07080a] via-[#13161c]/88 to-transparent flex flex-col justify-end items-start px-4 pb-5">
                      <h3 className="text-base font-medium text-white">{member.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {member.role}
                      </p>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full h-28 flex space-x-3 justify-end items-end pr-4 pb-5">
                      <a href={member.social.instagram} target="_blank" rel="noopener noreferrer">
                        <Instagram className="h-5 w-5 text-white hover:text-gray-500" />
                      </a>
                      <a href={member.social.twitter} target="_blank" rel="noopener noreferrer">
                        <Twitter className="h-5 w-5 text-white hover:text-gray-500" />
                      </a>
                    </div>   
                  </div>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
               ))}
            </CarouselContent>
          </Carousel>
          </div>
      </div>
    </section>
  );
}