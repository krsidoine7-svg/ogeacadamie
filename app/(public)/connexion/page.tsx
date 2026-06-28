"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import Image from "next/image"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit faire au moins 6 caractères" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function ConnexionPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        toast.error("Identifiants invalides ou erreur de connexion")
        setIsLoading(false)
        return
      }

      if (data?.user) {
        // Récupérer le rôle dans la table profiles
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          // Si pas de profil ou erreur, on redirige par défaut vers le dashboard candidat
          toast.success("Connexion réussie")
          router.push("/dashboard")
          router.refresh()
          return
        }

        const role = profile?.role ?? "user"
        toast.success("Ravi de vous revoir !")

        // Redirection selon le rôle
        if (role === "manager_zone") {
          router.push("/zone")
        } else if (role === "admin" || role === "super_admin") {
          router.push("/admin")
        } else {
          router.push("/dashboard")
        }
        router.refresh()
      }
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
          <div className="mx-auto w-24 h-24 rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex items-center justify-center mb-3 bg-white">
            <img
              src="/logo.jpeg"
              alt="OGE Académie Logo"
              className="object-cover w-full h-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            OGE ACADÉMIE
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Préparez vos concours dans les meilleures conditions
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 text-sm font-medium">
                Adresse e-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="nom@exemple.com"
                  {...register("email")}
                  className="pl-10 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password" className="text-slate-700 text-sm font-medium">
                  Mot de passe
                </Label>
                <a
                  href="/mot-de-passe-oublie"
                  className="text-xs text-gold hover:text-yellow-600 font-medium transition-colors"
                >
                  Oublié ?
                </a>
              </div>
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
            </div>



            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-lg shadow-gold/10 transition-all duration-300 h-10 rounded-lg disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                "Se connecter"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pb-8 border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500">
            Nouveau candidat ?{" "}
            <a
              href="/inscription"
              className="text-gold hover:text-yellow-600 font-medium transition-colors"
            >
              Créer un compte
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
