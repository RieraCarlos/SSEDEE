import { Mail, Phone, Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";

export default function Contactanos() {
  const contactInfo = {
    phoneNumbers: ["593987984878", "593995875130"],
    emails: ["carlosrg107@rgtechnology-ec.com",],
    socialMedia: {
      instagram: "https://instagram.com/sseedee",
      twitter: "https://twitter.com/sseedee",
      facebook: "https://facebook.com/sseedee",
      linkedin: "https://linkedin.com/company/sseedee",
    },
  };

  return (
    <section className="w-full py-5 md:py-10 lg:py-20 text-white">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-8 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Contáctanos</h2>
            <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Estamos aquí para ayudarte. Ponte en contacto con nosotros a través de los siguientes canales.
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-3 mt-12">
          {/* Tarjeta de Teléfono */}
          <Card className="bg-gradient-to-b from-[#13161c]/50 to-[#07080a] border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2 text-white">
                <Phone className="h-6 w-6 text-emerald-400" /> Teléfonos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-center -mt-5">
              {contactInfo.phoneNumbers.map((phone, index) => (
                <Button key={index} className="w-full mt-4 bg-[#0ae98a] text-[#07080a] font-bold hover:bg-[#0ae98a]/40">
                    <a href={`https://wa.me/${phone}?text=Hola, necesito información sobre 'SSEDEE'.`} target="_blank" rel="noopener noreferrer">
                        Contactar por WhatsApp
                    </a>
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* Tarjeta de Correo Electrónico */}
          <Card className="bg-gradient-to-b from-[#13161c]/50 to-[#07080a] border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2 text-white">
                <Mail className="h-6 w-6 text-emerald-400" /> Correos Oficiales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-center">
              {contactInfo.emails.map((email, index) => (
                <p key={index} className="text-gray-300">{email}</p>
              ))}
            </CardContent>
          </Card>

          {/* Tarjeta de Redes Sociales */}
          <Card className="bg-gradient-to-b from-[#13161c]/50 to-[#07080a] border-0">
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2 text-white">
                Redes Sociales
              </CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center gap-6 mt-4">
              {contactInfo.socialMedia.instagram && (
                <a href={contactInfo.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  <Instagram className="h-7 w-7" />
                </a>
              )}
              {contactInfo.socialMedia.twitter && (
                <a href={contactInfo.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  <Twitter className="h-7 w-7" />
                </a>
              )}
              {contactInfo.socialMedia.facebook && (
                <a href={contactInfo.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  <Facebook className="h-7 w-7" />
                </a>
              )}
              {contactInfo.socialMedia.linkedin && (
                <a href={contactInfo.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-emerald-400 transition-colors">
                  <Linkedin className="h-7 w-7" />
                </a>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}