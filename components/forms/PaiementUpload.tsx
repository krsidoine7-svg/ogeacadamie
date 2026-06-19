"use client";

import React, { useState, useRef } from "react";
import { Upload, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface PaiementUploadProps {
  onUploadSuccess: () => void;
}

export default function PaiementUpload({ onUploadSuccess }: PaiementUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation du type de fichier
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format invalide. Seuls les formats JPG, PNG et WEBP sont acceptés.");
      return;
    }

    // Validation de la taille (5 Mo max)
    const maxSize = 5 * 1024 * 1024; // 5 Mo
    if (file.size > maxSize) {
      toast.error("Fichier trop volumineux. La taille maximale est de 5 Mo.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setProgress(0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      toast.error("Format invalide. Seuls les formats JPG, PNG et WEBP sont acceptés.");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Fichier trop volumineux. La taille maximale est de 5 Mo.");
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
    setProgress(0);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setProgress(5); // Début initial

    const formData = new FormData();
    formData.append("file", selectedFile);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/paiements/upload");

    // Événement de suivi de progression de l'upload
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        // On bride à 95% le temps que le serveur traite le fichier
        setProgress(Math.min(percent, 95));
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        setProgress(100);
        toast.success("Preuve de paiement soumise avec succès !");
        setTimeout(() => {
          onUploadSuccess();
          handleRemoveFile();
        }, 1000);
      } else {
        try {
          const res = JSON.parse(xhr.responseText);
          toast.error(res.error || "Une erreur est survenue lors de l'upload.");
        } catch {
          toast.error("Erreur de connexion avec le serveur.");
        }
        setProgress(0);
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      toast.error("Erreur de connexion lors de l'upload.");
      setProgress(0);
    };

    xhr.send(formData);
  };

  return (
    <div className="space-y-4">
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-200 hover:border-gold/50 rounded-xl p-8 text-center cursor-pointer transition-all duration-300 bg-slate-50/50 hover:bg-slate-50 flex flex-col items-center justify-center min-h-[160px]"
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/png, image/jpeg, image/webp"
            className="hidden"
          />
          <Upload className="w-8 h-8 text-slate-400 mb-3" />
          <p className="text-sm font-semibold text-slate-700">Déposez votre capture ou cliquez pour parcourir</p>
          <p className="text-xs text-slate-400 mt-1">PNG, JPG ou WEBP uniquement (max. 5 Mo)</p>
        </div>
      ) : (
        <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50/50 flex flex-col items-center">
          <button
            type="button"
            onClick={handleRemoveFile}
            disabled={isUploading}
            className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
          
          <img
            src={previewUrl}
            alt="Aperçu du reçu"
            className="max-h-[180px] rounded-lg object-contain border border-slate-100 bg-white"
          />
          <p className="text-xs text-slate-500 font-medium mt-2 truncate w-full text-center">
            {selectedFile?.name} ({(selectedFile ? selectedFile.size / 1024 / 1024 : 0).toFixed(2)} Mo)
          </p>

          {isUploading && (
            <div className="w-full mt-3 space-y-1.5">
              <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                <span>Envoi en cours...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gold transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {previewUrl && !isUploading && (
        <Button
          onClick={handleUpload}
          disabled={!selectedFile}
          className="w-full bg-gradient-to-r from-gold to-amber-600 hover:from-yellow-500 hover:to-amber-500 text-white font-medium shadow-md shadow-gold/10 h-10 rounded-lg flex items-center justify-center gap-1.5"
        >
          Envoyer mon reçu de paiement
        </Button>
      )}
    </div>
  );
}
