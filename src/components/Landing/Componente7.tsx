import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Users } from "lucide-react"
import { Link } from "react-router-dom"

export default function HowToCreateClub() {
  const steps = [
    {
      id: 1,
      title: "Regístrate como DT",
      description:
        "Crea tu cuenta como Director Técnico para acceder a las herramientas de gestión.",
      icon: <Users className="text-[#0ae98a] w-6 h-6" />,
    },
    {
      id: 2,
      title: "Confirma tu correo y registra el club",
      description:
        "Verifica tu email y completa la información básica de tu club.",
      icon: <Mail className="text-[#0ae98a] w-6 h-6" />,
    },
    {
      id: 3,
      title: "Invita a tus jugadores",
      description:
        "Comparte el enlace de tu club para que tus amigos se unan.",
      icon: <CheckCircle className="text-[#0ae98a] w-6 h-6" />,
    },
  ]

  return (
    <section className="w-full flex justify-center py-20 px-0 md:px-4">
      <Card className="w-full max-w-2xl bg-gradient-to-br from-[#13161c]/40 to-[#07080a] border-0 rounded-2xl shadow-lg">
        <CardContent className="p-8 space-y-8">

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-white text-2xl font-bold">
              ¿Cómo crear un club?
            </h2>
            <p className="text-gray-400 text-sm">
              Sigue estos simples pasos para comenzar
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6 relative">
            {steps.map((step) => (
              <div
                key={step.id}
                className="flex gap-4 items-start group relative"
              >
                {/* Number */}
                <div className="min-w-[40px] min-h-[40px] rounded-full bg-[#0ae98a] text-black flex items-center justify-center font-bold text-lg shadow-lg group-hover:scale-110 transition">
                  {step.id}
                </div>

                {/* Text */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {step.icon}
                    <h3 className="text-white font-semibold text-base md:text-lg">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="flex justify-center pt-6">
            <Button className="bg-[#0ae98a] hover:bg-[#0ae98a]/50 text-black font-bold px-8 py-3 rounded-xl">
              <Link to={'/login'}>
                  Crear mi club
              </Link>
            </Button>
          </div>

        </CardContent>
      </Card>
    </section>
  )
}
