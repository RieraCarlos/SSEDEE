export default function Componente2(){
    return(
        <div>
            {/* Sección del video */}
            <div className="mt-8 flex-shrink-0 border-1 border-[#0ae98a] rounded-2xl">
                <div className=" rounded-3xl p-4">
                    <div className=" h-64 md:h-96 rounded-2xl flex items-center justify-center">
                        
                        <iframe 
                            width="100%" 
                            height="100%" 
                            src="https://www.youtube.com/embed/-_7ZXrJNpWE?autoplay=1&mute=1&loop=1&playlist=-_7ZXrJNpWE&si=EHyaCBojrvpu26dz" 
                            title="YouTube video player" 
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin" 
                            allowfullscreen>
                        </iframe>
                    </div>
                </div>
            </div>
        </div>
    )
}