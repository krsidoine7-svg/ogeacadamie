"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const resetPasswordSchema = z
  .object({
    password: z.string().min(6, { message: "Le mot de passe doit faire au moins 6 caractères" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ReinitialiserMotDePassePage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasSession, setHasSession] = useState<boolean | null>(null)

  useEffect(() => {
    // Vérifier si une session ou un event de récupération est actif
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setHasSession(!!data.session)
    }

    checkSession()

    // S'abonner aux changements d'état d'authentification (Supabase récupère le token du hash URL automatiquement)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        setHasSession(true)
      } else if (session) {
        setHasSession(true)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = async (values: ResetPasswordFormValues) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        toast.error(error.message || "Impossible de réinitialiser le mot de passe")
        setIsLoading(false)
        return
      }

      toast.success("Votre mot de passe a été réinitialisé !")
      setIsSuccess(true)
      
      // Auto redirect to login page after 3 seconds
      setTimeout(() => {
        // Se déconnecter pour forcer une nouvelle connexion propre
        supabase.auth.signOut().then(() => {
          router.push("/connexion")
          router.refresh()
        })
      }, 3000)
    } catch (err) {
      toast.error("Une erreur inattendue est survenue")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden font-sans">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl shadow-slate-100 rounded-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-slate-100 flex items-center justify-center mb-2 bg-slate-50">
            <Image
              src="/logo.jpeg"
              alt="OGE Académie Logo"
              width={64}
              height={64}
              className="object-cover w-full h-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            OGE ACADÉMIE
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Définir votre nouveau mot de passe
          </CardDescription>
        </CardHeader>

        <CardContent>
          {hasSession === false ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-slate-700 font-medium">Session invalide ou expirée</p>
              <p className="text-slate-500 text-sm">
                Ce lien de réinitialisation de mot de passe est invalide ou a expiré. Veuillez refaire une nouvelle demande de réinitialisation.
              </p>
              <Button
                onClick={() => router.push("/mot-de-passe-oublie")}
                className="w-full mt-4 bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 rounded-lg"
              >
                Refaire une demande
              </Button>
            </div>
          ) : isSuccess ? (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <p className="text-slate-755 font-semibold text-lg">Mot de passe réinitialisé !</p>
              <p className="text-slate-500 text-sm">
                Votre nouveau mot de passe a bien été enregistré. Vous allez être redirigé vers l'écran de connexion...
              </p>
              <Loader2 className="mx-auto h-5 w-5 animate-spin text-gold mt-2" />
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                  Nouveau mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                    className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-slate-700 text-sm font-medium">
                  Confirmer le mot de passe
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("confirmPassword")}
                    className="pl-10 pr-10 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-lg shadow-gold/10 transition-all duration-300 h-10 rounded-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Enregistrer le nouveau mot de passe"
                )}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pb-8 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            OGE Académie — L'excellence à portée de main
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
