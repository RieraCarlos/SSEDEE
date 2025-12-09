import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function ClubLogoOffer() {
  return (
    <section className="w-full flex justify-center mb-20">
      <Card className="max-w-4xl w-full bg-gradient-to-br from-[#13161c]/40 to-[#07080a] border-none rounded-3xl shadow-xl ">

        <CardContent className="p-10 flex flex-col items-center text-center gap-8">

          {/* Title */}
          <h2 className="text-white text-2xl md:text-3xl font-bold leading-snug">
            ¿Quieres un logo profesional para tu <span className="text-[#0ae98a]">CLUB</span>?
          </h2>

          {/* Price box */}
          <div className="relative flex items-center justify-center">

            <div className="z-10 flex flex-col items-center justify-center">
              <span className="text-gray-400 text-sm">Desde</span>
              <span className="text-[#0ae98a] text-5xl font-black">$45</span>
            </div>

          </div>

          {/* Subtitle */}
          <p className="text-gray-400 max-w-md">
            Obtendrás un <span className="text-white font-semibold">logo de inmediato</span> para tu club,
            listo para redes sociales, uniformes y plataforma.
          </p>

          {/* Benefits  */}
          <ul className="text-gray-300 text-sm space-y-2">
            <li>✅ Diseño personalizado</li>
            <li>✅ Entrega rápida</li>
            <li>✅ Archivos en alta calidad</li>
            <li>✅ Logo para perfil y camiseta</li>
          </ul>

          {/* CTA */}
          <Button
            className="w-full md:w-auto px-10 py-6 text-lg rounded-xl bg-[#0ae98a] text-black hover:bg-[#0ae98a]/50 transition-all font-bold shadow-lg"
          >
            <a href={`https://wa.me/593987984878?text=Hola, necesito información sobre los logos para 'SSEDEE'.`} target="_blank" rel="noopener noreferrer">
                Contáctate con nosotros
            </a>
          </Button>

        </CardContent>
      </Card>
    </section>
  )
}
