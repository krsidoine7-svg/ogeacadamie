import { z } from 'zod'

export const step1Schema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  prenom: z.string().min(2, 'Prénom requis'),
  serie_bac: z.string().min(1, 'Sélectionnez votre série'),
  whatsapp: z.string().min(8, 'Numéro WhatsApp requis'),
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit faire au moins 8 caractères'),
  acceptTerms: z.literal(true, {
    message: "Vous devez accepter les conditions d'utilisation",
  }),
})

export const step2Schema = z.object({
  concours: z.array(z.enum(['inphb', 'esatic', 'cme'])).min(1, 'Choisissez au moins un concours'),
  mode_formation: z.enum(['presentiel', 'en_ligne']),
})

export const step3Schema = z.object({
  zone: z.enum(['yamoussoukro', 'yopougon', 'abobo', 'cocody', 'port-bouet', 'bouake']),
})

export type Step1Data = z.infer<typeof step1Schema>
export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
