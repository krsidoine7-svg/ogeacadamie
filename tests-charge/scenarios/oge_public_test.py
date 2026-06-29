"""
SCÉNARIO 1 : TEST DE CHARGE PUBLIC — OGE ACADÉMIE
===================================================
Objectif : Simuler des visiteurs anonymes naviguant sur le site public.
Ces pages sont les plus consultées (page d'accueil, inscription, CGU).
Elles doivent répondre en moins de 1500ms même sous forte charge.

Pondération des tâches :
  - 50% des visites sur la page d'accueil (/)
  - 20% sur la page d'inscription (/inscription)
  - 15% sur la page de connexion (/connexion)
  - 10% sur la politique de confidentialité
  - 5%  sur la page de réinitialisation mot de passe

SLA cibles :
  - p95 < 1500 ms
  - Taux d'erreur < 1%
"""

from locust import HttpUser, task, between

class OgePublicVisitor(HttpUser):
    """
    Utilisateur virtuel simulant un visiteur anonyme qui navigue
    sur les pages publiques d'OGE Académie sans se connecter.
    """
    wait_time = between(1, 4)  # Pause réaliste entre les actions (1 à 4 secondes)

    @task(10)
    def page_accueil(self):
        """Page d'accueil — route la plus sollicitée du site public."""
        with self.client.get("/", catch_response=True, name="[Public] Page d'accueil (/)") as response:
            if response.status_code == 200:
                response.success()
            else:
                response.failure(f"Erreur {response.status_code} sur la page d'accueil")

    @task(4)
    def page_inscription(self):
        """Formulaire d'inscription des candidats."""
        with self.client.get("/inscription", catch_response=True, name="[Public] Inscription") as response:
            if response.status_code in [200, 307]:
                response.success()
            else:
                response.failure(f"Erreur {response.status_code} sur /inscription")

    @task(3)
    def page_connexion(self):
        """Page de connexion."""
        with self.client.get("/connexion", catch_response=True, name="[Public] Connexion") as response:
            if response.status_code in [200, 307]:
                response.success()
            else:
                response.failure(f"Erreur {response.status_code} sur /connexion")

    @task(2)
    def page_politique_confidentialite(self):
        """Page politique de confidentialité / CGU."""
        with self.client.get(
            "/politique-de-confidentialite",
            catch_response=True,
            name="[Public] Politique de confidentialité"
        ) as response:
            if response.status_code in [200, 404]:  # 404 acceptable si page pas encore créée
                response.success()
            else:
                response.failure(f"Erreur {response.status_code}")

    @task(1)
    def page_mot_de_passe_oublie(self):
        """Page de demande de réinitialisation du mot de passe."""
        with self.client.get(
            "/mot-de-passe-oublie",
            catch_response=True,
            name="[Public] Mot de passe oublié"
        ) as response:
            if response.status_code in [200, 307]:
                response.success()
            else:
                response.failure(f"Erreur {response.status_code}")
