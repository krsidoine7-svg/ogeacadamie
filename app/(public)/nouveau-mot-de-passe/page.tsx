"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Loader2, KeyRound, Eye, EyeOff, ShieldCheck } from "lucide-react";

import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { clearForcePasswordResetStatus } from "@/app/(dashboard)/dashboard/actions";

const passwordSchema = z
  .object({
    password: z.string().min(6, { message: "Le mot de passe doit faire au moins 6 caractères" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function ForceNewPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: "onChange",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: PasswordFormValues) => {
    setIsLoading(true);
    try {
      // 1. Update password in Supabase Auth via active session
      const { error: updateError } = await supabase.auth.updateUser({
        password: values.password,
      });

      if (updateError) {
        toast.error(updateError.message || "Erreur lors de la mise à jour du mot de passe");
        setIsLoading(false);
        return;
      }

      // 2. Clear force reset flag in DB
      const result = await clearForcePasswordResetStatus();
      if (!result.success) {
        toast.error(result.error || "Erreur lors de la mise à jour du statut");
        setIsLoading(false);
        return;
      }

      toast.success("Votre mot de passe a été configuré avec succès !");

      // 3. Get profile to determine dashboard redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        const role = profile?.role ?? "user";
        if (role === "manager_zone") {
          router.push("/zone");
        } else if (role === "admin" || role === "super_admin") {
          router.push("/admin");
        } else {
          router.push("/dashboard");
        }
      } else {
        router.push("/connexion");
      }
      router.refresh();
    } catch (err) {
      toast.error("Une erreur inattendue est survenue");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4 relative overflow-hidden font-sans">
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-[100px] pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#F04438]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

      <Card className="w-full max-w-md bg-white border border-slate-200 shadow-2xl shadow-slate-100/50 rounded-2xl relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#D4A017] to-transparent" />

        <CardHeader className="space-y-2 text-center pt-8">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-3">
            <ShieldCheck className="h-6 w-6 text-[#D4A017]" />
          </div>
          <CardTitle className="text-xl font-bold tracking-tight text-slate-900">
            Nouveau Mot de Passe Requis
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs sm:text-sm">
            Par mesure de sécurité suite à une réinitialisation de votre compte, veuillez définir votre nouveau mot de passe d'accès.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pass" className="text-slate-700 text-sm font-medium">
                Nouveau mot de passe
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <Input
                  id="pass"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min. 6 caractères"
                  {...register("password")}
                  className="pl-10 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
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
              <Label htmlFor="confirm" className="text-slate-700 text-sm font-medium">
                Confirmer le mot de passe
              </Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
                <Input
                  id="confirm"
                  type={showPassword ? "text" : "password"}
                  placeholder="Ressaisir à l'identique"
                  {...register("confirmPassword")}
                  className="pl-10 bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-gold focus:ring-gold/20"
                />
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-rose-500 font-medium">{errors.confirmPassword.message}</p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading || !isValid}
              className="w-full bg-slate-900 hover:bg-[#D4A017] text-white font-medium shadow-md transition-all duration-300 h-10 rounded-lg disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-white" />
                  Mise à jour...
                </>
              ) : (
                "Enregistrer mon mot de passe"
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex justify-center pb-8 border-t border-slate-100 pt-4">
          <p className="text-[10px] text-slate-400 text-center leading-normal">
            Votre session restera sécurisée et chiffrée selon les protocoles de sécurité de l'Académie.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
