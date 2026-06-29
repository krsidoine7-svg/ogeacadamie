"""
SCÉNARIO 2 : TEST DE CHARGE CANDIDAT AUTHENTIFIÉ — OGE ACADÉMIE
=================================================================
Objectif : Simuler des candidats connectés accédant à leur espace membre.
Ce scénario couvre le parcours complet d'un élève actif (paiement validé) :
consultation du dashboard, accès aux documents, vérification du paiement,
lecture des notifications.

Le scénario utilise un fichier CSV (data/candidats.csv) pour simuler
des comptes distincts et éviter les biais de cache BDD.

Authentification : Via les cookies de session Supabase (SSR).
La connexion se fait via le formulaire POST /connexion (Server Action Next.js).

SLA cibles :
  - p95 < 2000 ms pour le dashboard
  - p95 < 3000 ms pour l'accès aux documents (chargement sécurisé)
  - Taux d'erreur < 2%
"""

import os
import csv
from queue import Queue, Empty
from locust import HttpUser, task, between

# File d'attente globale partagée entre tous les utilisateurs virtuels
_candidats_queue = Queue()
_queue_loaded = False


def load_candidats():
    """Charge les comptes candidats depuis le CSV dans la file d'attente."""
    global _queue_loaded
    if _queue_loaded:
        return
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "candidats.csv")
    if os.path.exists(csv_path):
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                _candidats_queue.put(row)
        print(f"[+] {_candidats_queue.qsize()} comptes candidats chargés depuis {csv_path}")
    else:
        # Fallback si CSV introuvable
        fallback_accounts = [
            {"email": "candidat2.yamoussoukro@oge-academie.ci", "password": "Candidat123!"},
            {"email": "candidat2.yopougon@oge-academie.ci",     "password": "Candidat123!"},
            {"email": "candidat2.cocody@oge-academie.ci",       "password": "Candidat123!"},
        ]
        for acc in fallback_accounts:
            _candidats_queue.put(acc)
        print("[!] CSV non trouvé. Utilisation des comptes de fallback.")
    _queue_loaded = True


class OgeCandidatUser(HttpUser):
    """
    Utilisateur virtuel simulant un candidat OGE Académie connecté.
    Reproduit les actions les plus fréquentes sur l'espace membre.
    """
    wait_time = between(2, 5)

    def on_start(self):
        """Authentification du candidat via le formulaire de connexion."""
        load_candidats()

        try:
            self.credentials = _candidats_queue.get_nowait()
        except Empty:
            # Si plus de comptes disponibles, réutiliser un compte par défaut
            self.credentials = {
                "email": "candidat2.yamoussoukro@oge-academie.ci",
                "password": "Candidat123!"
            }

        # Connexion via l'API de test (positionne les cookies de session SSR)
        response = self.client.post(
            "/api/auth/test-login",
            json={
                "email": self.credentials["email"],
                "password": self.credentials["password"],
            },
            name="[Auth] Connexion candidat"
        )

        if response.status_code == 200:
            print(f"[+] Connecté : {self.credentials['email']}")
        else:
            print(f"[-] Échec connexion pour {self.credentials['email']} : HTTP {response.status_code}")

    def on_stop(self):
        """Remet le compte dans la file à la fin du cycle."""
        if hasattr(self, "credentials"):
            _candidats_queue.put(self.credentials)

    @task(5)
    def dashboard_accueil(self):
        """Page principale du tableau de bord candidat."""
        with self.client.get(
            "/dashboard",
            catch_response=True,
            name="[Dashboard] Accueil candidat"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(4)
    def mes_documents(self):
        """Accès à la liste des cours et supports de révision."""
        with self.client.get(
            "/dashboard/documents",
            catch_response=True,
            name="[Dashboard] Mes Documents"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def statut_paiement(self):
        """Consultation du statut de paiement."""
        with self.client.get(
            "/dashboard/paiement",
            catch_response=True,
            name="[Dashboard] Statut Paiement"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def mes_notifications(self):
        """Liste des notifications reçues."""
        with self.client.get(
            "/dashboard/notifications",
            catch_response=True,
            name="[Dashboard] Notifications"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(1)
    def mon_profil(self):
        """Consultation du profil candidat."""
        with self.client.get(
            "/dashboard/profil",
            catch_response=True,
            name="[Dashboard] Mon Profil"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")
