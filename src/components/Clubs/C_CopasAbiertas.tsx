export default function C_CopasAbiertas() {
  return (
        <div className="flex flex-col items-center w-full mt-8">
            <span className="text-gray-400 text-xl md:text-2xl mb-4">Copas abiertas</span>
            <div className="flex flex-col w-full space-y-4">
                <div
                    className="bg-[#13161c] border-2 border-[#13161c] rounded-2xl p-4 text-center"
                >
                    <span className="text-gray-200 text-lg md:text-xl break-words">
                        copa.titulo
                    </span>
                </div>
            </div>
        </div>
  )
}