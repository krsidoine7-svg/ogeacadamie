"""
SCÉNARIO DE CHARGE INTENSIVE — OGE ACADÉMIE
=============================================
Objectif : Simuler 50 utilisateurs qui utilisent intensément le site et ses
fonctionnalités les plus lourdes (Auth, requêtes SQL complexes, CMS, listings).

Pondération des profils simulés :
  - 70% de Candidats Actifs (login, dashboard, notifications, documents)
  - 20% de Managers de Zone (KPIs locaux, candidats de zone, reçus de paiements)
  - 10% d'Administrateurs (KPIs globaux consolidés, recherche candidats, CMS)

SLA cibles :
  - p95 < 2000 ms pour les opérations de lecture
  - p95 < 3000 ms pour l'authentification et les pages d'administration lourdes
  - Taux d'erreur < 2%
"""

from locust import HttpUser, task, between, SequentialTaskSet
import random
import os
import csv
from queue import Queue, Empty

# File d'attente globale pour les comptes candidats
_candidats_queue = Queue()
_queue_loaded = False


def load_candidats():
    global _queue_loaded
    if _queue_loaded:
        return
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "candidats.csv")
    if os.path.exists(csv_path):
        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                _candidats_queue.put(row)
    _queue_loaded = True


# --- LISTE DES COMPTES ADMINISTRATIFS ---
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


# --- TÂCHES INTENSIVES POUR LES CANDIDATS ---
class CandidatTasks(SequentialTaskSet):
    def on_start(self):
        """Authentification et récupération des cookies."""
        load_candidats()
        try:
            self.credentials = _candidats_queue.get_nowait()
        except Empty:
            self.credentials = {
                "email": "candidat2.yamoussoukro@oge-academie.ci",
                "password": "Candidat123!"
            }
        
        self.client.post(
            "/api/auth/test-login",
            json={
                "email": self.credentials["email"],
                "password": self.credentials["password"],
            },
            name="[Candidat] Connexion"
        )

    def on_stop(self):
        if hasattr(self, "credentials"):
            _candidats_queue.put(self.credentials)

    @task(3)
    def view_dashboard(self):
        """Consulter le dashboard."""
        self.client.get("/dashboard", name="[Candidat] Dashboard")

    @task(4)
    def view_documents(self):
        """Consulter l'espace de cours (génère des requêtes DB pour les listes)."""
        self.client.get("/dashboard/documents", name="[Candidat] Liste Documents")

    @task(2)
    def view_pdf_viewer(self):
        """Simule l'ouverture d'un document (requête SQL + decryptage de document)."""
        # Utilise un document ID factice pour simuler l'appel à l'API de décryptage
        fake_id = "00000000-0000-0000-0000-000000000000"
        self.client.get(f"/api/documents/{fake_id}/view", name="[Candidat] Décryptage PDF (API)")

    @task(2)
    def view_notifications(self):
        """Consulter les alertes."""
        self.client.get("/dashboard/notifications", name="[Candidat] Notifications")

    @task(1)
    def update_profile(self):
        """Mettre à jour le profil candidat."""
        self.client.get("/dashboard/profil", name="[Candidat] Page Profil")


# --- TÂCHES INTENSIVES POUR LES MANAGERS ---
class ManagerTasks(SequentialTaskSet):
    def on_start(self):
        self.credentials = random.choice(MANAGER_ACCOUNTS)
        self.client.post("/api/auth/test-login", json=self.credentials, name="[Manager] Connexion")

    @task(3)
    def view_zone_kpis(self):
        """KPIs de la zone (agrégations SQL)."""
        self.client.get("/zone", name="[Manager] Dashboard Zone")

    @task(4)
    def list_candidats(self):
        """Liste de tous les candidats de sa zone."""
        self.client.get("/zone/candidats", name="[Manager] Liste Candidats")

    @task(3)
    def view_pending_payments(self):
        """Vérifier les reçus en attente."""
        self.client.get("/zone/paiements", name="[Manager] Paiements en attente")

    @task(2)
    def manage_documents(self):
        """Consulter les cours de la zone."""
        self.client.get("/zone/documents", name="[Manager] Gestion cours")


# --- TÂCHES INTENSIVES POUR LES ADMINS ---
class AdminTasks(SequentialTaskSet):
    def on_start(self):
        self.credentials = random.choice(ADMIN_ACCOUNTS)
        self.client.post("/api/auth/test-login", json=self.credentials, name="[Admin] Connexion")

    @task(4)
    def view_global_kpis(self):
        """Consolider les stats globales."""
        self.client.get("/admin", name="[Admin] Dashboard Global")

    @task(5)
    def search_candidats_heavy(self):
        """Recherche et filtrage complexe sur tous les candidats de Côte d'Ivoire."""
        # Simule des requêtes SQL lourdes avec filtres dynamiques
        zones = ["yamoussoukro", "yopougon", "cocody"]
        zone = random.choice(zones)
        self.client.get(f"/admin/candidats?zone={zone}", name="[Admin] Recherche Candidats (Zone)")

    @task(3)
    def view_cms_contenu(self):
        """Charger toutes les sections du CMS (page d'accueil, témoignages, blog)."""
        self.client.get("/admin/contenu", name="[Admin] Gestion CMS")


# --- DÉFINITION DE LA SIMULATION ---
class OgeHeavyLoadUser(HttpUser):
    wait_time = between(2, 5)

    # Répartition des profils d'utilisateurs
    tasks = {
        CandidatTasks: 70,  # 70% candidats
        ManagerTasks: 20,   # 20% managers
        AdminTasks: 10,     # 10% admins
    }
