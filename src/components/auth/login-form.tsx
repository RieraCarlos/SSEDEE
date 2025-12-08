import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import React, { useState } from "react"

// Definimos las props que el componente espera recibir
interface LoginFormProps extends Omit<React.ComponentProps<"form">, 'onSubmit'> {
  onSubmit: (data: { email: string, password: string }) => void;
  isLoading: boolean;
  onSwitchToRegister: () => void;
}

export function LoginForm({ className, onSubmit, isLoading, onSwitchToRegister, ...props }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Llama a la función que el padre le pasó, entregándole los datos del formulario
    onSubmit({ email, password })
  }

  return (
    <form className={cn("flex flex-col gap-6 px-4 py-6 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-green-400 shadow-[0px_0px_130px_rgba(34,197,94,0.15)]", className)} {...props} onSubmit={handleFormSubmit}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Ingresa a tu cuenta</h1>
        <p className="text-xs px-4">
          Ingrese su correo electrónico a continuación para iniciar sesión en su cuenta
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email"
            type="email" 
            placeholder="m@example.com"
            value={email} 
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            required 
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </a>
          </div>
          <Input 
            id="password" 
            type="password"
            value={password} 
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            required 
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Cargando...' : 'Iniciar sesión'}
        </Button>
      </div>
      <div className="text-center text-sm">
        ¿Aún no tienes una cuenta?{" "}
        <button type="button" onClick={onSwitchToRegister} className="underline underline-offset-4">
          Regístrate
        </button>
      </div>
    </form>
  )
}
