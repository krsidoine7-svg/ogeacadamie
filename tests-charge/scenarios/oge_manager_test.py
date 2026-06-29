"""
SCÉNARIO 3 : TEST DE CHARGE MANAGERS ET ADMINS — OGE ACADÉMIE
==============================================================
Objectif : Simuler des managers de zone et des administrateurs
qui utilisent leurs espaces respectifs en parallèle.

Ce scénario teste les endpoints les plus coûteux en ressources BDD :
  - KPIs (agrégation multi-zones)
  - Listes de candidats avec filtres
  - Validation de paiements
  - Gestion des documents

Comptes utilisés :
  MANAGERS  (mot de passe : Manager123!) :
    - manager.yamoussoukro@oge-academie.ci
    - manager.yopougon@oge-academie.ci
    - manager.abobo@oge-academie.ci
    - manager.cocody@oge-academie.ci
    - manager.portbouet@oge-academie.ci
    - manager.bouake@oge-academie.ci

  ADMIN GLOBAL (mot de passe : Admin123!) :
    - admin1@oge-academie.ci

SLA cibles :
  - p95 < 2500 ms pour les dashboards KPIs
  - p95 < 3000 ms pour les listes de candidats
  - Taux d'erreur < 1%
"""

from locust import HttpUser, task, between
import random

# Comptes de test Manager et Admin
MANAGER_ACCOUNTS = [
    {"email": "manager.yamoussoukro@oge-academie.ci", "password": "Manager123!"},
    {"email": "manager.yopougon@oge-academie.ci",     "password": "Manager123!"},
    {"email": "manager.abobo@oge-academie.ci",        "password": "Manager123!"},
    {"email": "manager.cocody@oge-academie.ci",       "password": "Manager123!"},
    {"email": "manager.portbouet@oge-academie.ci",    "password": "Manager123!"},
    {"email": "manager.bouake@oge-academie.ci",       "password": "Manager123!"},
]

ADMIN_ACCOUNTS = [
    {"email": "admin1@oge-academie.ci", "password": "Admin123!"},
    {"email": "admin2@oge-academie.ci", "password": "Admin123!"},
]


class OgeManagerUser(HttpUser):
    """
    Utilisateur virtuel simulant un responsable de zone.
    Représente 80% du trafic back-office.
    """
    wait_time = between(2, 6)
    weight = 4  # 4x plus de managers que d'admins

    def on_start(self):
        """Connexion avec un compte manager aléatoire."""
        self.credentials = random.choice(MANAGER_ACCOUNTS)
        self.client.post(
            "/api/auth/test-login",
            json=self.credentials,
            name="[Auth] Connexion manager"
        )

    @task(5)
    def dashboard_zone(self):
        """KPIs et vue principale de la zone."""
        with self.client.get(
            "/zone",
            catch_response=True,
            name="[Zone] Dashboard KPIs"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(4)
    def liste_candidats_zone(self):
        """Liste des candidats de la zone du manager."""
        with self.client.get(
            "/zone/candidats",
            catch_response=True,
            name="[Zone] Liste candidats"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(3)
    def paiements_en_attente(self):
        """Liste des paiements en attente de validation."""
        with self.client.get(
            "/zone/paiements",
            catch_response=True,
            name="[Zone] Paiements en attente"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def documents_zone(self):
        """Gestion des cours de la zone."""
        with self.client.get(
            "/zone/documents",
            catch_response=True,
            name="[Zone] Documents zone"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(1)
    def parametres_zone(self):
        """Configuration du centre local (Wave, adresse)."""
        with self.client.get(
            "/zone/parametres",
            catch_response=True,
            name="[Zone] Paramètres"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")


class OgeAdminUser(HttpUser):
    """
    Utilisateur virtuel simulant un administrateur global.
    Représente 20% du trafic back-office — requêtes plus lourdes (multi-zones).
    """
    wait_time = between(3, 7)
    weight = 1  # Moins d'admins que de managers

    def on_start(self):
        """Connexion avec un compte admin."""
        self.credentials = random.choice(ADMIN_ACCOUNTS)
        self.client.post(
            "/api/auth/test-login",
            json=self.credentials,
            name="[Auth] Connexion admin"
        )

    @task(5)
    def dashboard_global(self):
        """Dashboard KPIs global (toutes zones) — requête lourde en agrégation BDD."""
        with self.client.get(
            "/admin",
            catch_response=True,
            name="[Admin] Dashboard Global KPIs"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(3)
    def liste_tous_candidats(self):
        """Liste globale de tous les candidats (toutes zones)."""
        with self.client.get(
            "/admin/candidats",
            catch_response=True,
            name="[Admin] Tous les candidats"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def tous_paiements(self):
        """Vue globale de tous les paiements."""
        with self.client.get(
            "/admin/paiements",
            catch_response=True,
            name="[Admin] Paiements globaux"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def gestion_managers(self):
        """Gestion des managers de zone."""
        with self.client.get(
            "/admin/managers",
            catch_response=True,
            name="[Admin] Gestion managers"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(2)
    def contenu_cms(self):
        """Interface CMS de gestion du contenu."""
        with self.client.get(
            "/admin/contenu",
            catch_response=True,
            name="[Admin] CMS Contenu"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")

    @task(1)
    def gestion_documents(self):
        """Gestion des cours et documents globaux."""
        with self.client.get(
            "/admin/documents",
            catch_response=True,
            name="[Admin] Documents globaux"
        ) as response:
            if response.status_code in [200, 302]:
                response.success()
            else:
                response.failure(f"HTTP {response.status_code}")
