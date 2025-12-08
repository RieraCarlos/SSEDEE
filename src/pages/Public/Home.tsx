import Nav from "../../components/Landing/Nav";
import Componente1 from "@/components/Landing/Componente1";
import Componente2 from "@/components/Landing/Componente2";
import Componente3 from "@/components/Landing/Componente3";
import Componente4 from "@/components/Landing/Componente4";
import Componente5 from "@/components/Landing/Componente5";
import HowToCreateClub from "@/components/Landing/Componente7";
import RegisteredClubs from "@/components/Landing/Componente8";
import MVPServicesList from "@/components/Landing/Componente9";
import ClubLogoOffer from "@/components/Landing/Componente10";
import Productos from "@/components/Landing/Componente11";
import Equipo from "@/components/Landing/Componente12";
import Contactanos from "@/components/Landing/Componente13";
import Footer from "@/components/Landing/Footer";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function Home() {
    const location = useLocation();

    useEffect(() => {
        if (location.state?.scrollTo) {
            const element = document.getElementById(location.state.scrollTo);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                // Clear the state after scrolling to prevent re-scrolling on subsequent renders
                // This typically requires replacing the current state in history, which `navigate` can do.
                // However, directly modifying history state outside of navigate can be tricky.
                // For simplicity here, we'll just rely on the effect not re-firing for the same state.
                // A more robust solution might involve `replace` state after scrolling.
                // For now, let's just make sure the effect depends only on location.state.scrollTo
            }
        }
    }, [location.state?.scrollTo]);

    return (
        <div className="bg-[#07080a] text-white flex flex-col ">
            <Nav/>
            <div className="px-6 md:px-20 lg:px-40">
                <Componente1/>
                <Componente2/>
                <div id="nosotros"> {/* Added id for "Nosotros" section */}
                    <Componente3/>
                </div>
                <HowToCreateClub/>
                <RegisteredClubs/>
                <ClubLogoOffer/>
                <div id="servicios"> {/* Added id for "Servicios" section */}
                    <MVPServicesList/>
                </div>
                {/*Productos*/}
                <Productos/>
                <Equipo/>
                <div id="contactanos"> {/* Added id for "Contactanos" section */}
                    <Contactanos/>
                </div>
            </div>
            <Footer/>
        </div>
    );
}