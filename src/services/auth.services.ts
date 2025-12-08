// src/services/auth.service.ts
import { supabase } from '@/api/supabaseClient'

export const AuthService = {
    async signIn(email: string, password: string) {
        return supabase.auth.signInWithPassword({ email, password })
    },

    async signUp(email: string, password: string, data: any) {
        return supabase.auth.signUp({
            email,
            password,
            options: {
                data
            }
        })
    },

    async signOut() {
        return supabase.auth.signOut()
    },

    async getSession() {
        // Obtiene sesión actual (client-side)
        const { data } = await supabase.auth.getSession()
        return data?.session ?? null
    },

    async getProfile(userId: string) {
        if (!userId) {
            console.warn('[getProfile] Missing userId')
            return { data: null, error: new Error('Missing userId') }
        }
        const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
        
        if (error) {
            console.error('[getProfile] Error fetching profile:', error)
        } else if (!data) {
            console.warn('[getProfile] No usuario found for userId:', userId)
        } 
        return { data, error }
    }
}
