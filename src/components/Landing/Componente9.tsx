import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"

const services = [
  "Registro de jugadores",
  "Registro de clubs",
  "Solicitud de cupos para jugar",
  "Perfiles adaptativos",
  "Selección de chalecos",
  "Historial de partidos",
  "Ubicación de partidos",
  "Nómina del club",
]

export default function MVPServicesList() {
  return (
    <section className="w-full flex items-center justify-center p-0 md:p-6 mb-10">
      <Card className=" w-full bg-gradient-to-b from-[#13161c]/40 to-[#07080a] border-0 text-white rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl md:text-3xl font-bold tracking-wide">
            🚀 Servicios como <span className="text-[#0ae98a]">Producto minimo viable</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-3 grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="group flex items-center gap-4 p-4 bg-zinc-900/60 rounded-xl hover:bg-[#0ae98a]/90 transition-all duration-300 cursor-pointer"
            >
              <div className="bg-[#0ae98a]/10 group-hover:bg-black/20 p-2 rounded-full transition-all">
                <CheckCircle className="w-6 h-6 text-[#0ae98a] group-hover:text-black" />
              </div>

              <p className="text-base md:text-lg font-medium tracking-wide group-hover:text-black transition-colors">
                {service}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </section>
  )
}