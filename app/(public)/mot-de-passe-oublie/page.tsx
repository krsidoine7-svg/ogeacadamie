"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Mail, ArrowLeft } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Adresse e-mail invalide" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function MotDePasseOubliePage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsLoading(true)
    try {
      const origin = window.location.origin
      const redirectToUrl = `${origin}/reinitialiser-mot-de-passe`
      
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectToUrl,
      })

      if (error) {
        toast.error(error.message || "Erreur lors de l'envoi de la demande de réinitialisation")
        setIsLoading(false)
        return
      }

      toast.success("E-mail de récupération envoyé avec succès !")
      setIsSubmitted(true)
    } catch (err) {
      toast.error("Une erreur inattendue est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 relative overflow-hidden font-sans">
      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl shadow-slate-100 rounded-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
        
        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto w-24 h-24 rounded-3xl overflow-hidden shadow-lg border border-slate-100 flex items-center justify-center mb-3 bg-white">
            <Image
              src="/logo.jpeg"
              alt="OGE Académie Logo"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            OGE ACADÉMIE
          </CardTitle>
          <CardDescription className="text-slate-500 text-sm">
            Récupération de mot de passe
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!isSubmitted ? (
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

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-lg shadow-gold/10 transition-all duration-300 h-10 rounded-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  "Envoyer le lien de récupération"
                )}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-4">
              <div className="mx-auto w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <p className="text-slate-600 text-sm">
                Un e-mail contenant les instructions pour réinitialiser votre mot de passe vient de vous être envoyé.
              </p>
              <p className="text-xs text-slate-400">
                Pensez à vérifier vos courriers indésirables (spams) si vous ne recevez rien dans quelques minutes.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-center pb-8 border-t border-slate-100 pt-4">
          <Link
            href="/connexion"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-gold transition-colors font-medium"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Retour à l'écran de connexion
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
