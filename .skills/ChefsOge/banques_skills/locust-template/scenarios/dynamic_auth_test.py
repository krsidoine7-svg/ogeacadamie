import os
import csv
from queue import Queue
from locust import HttpUser, task, between

class DynamicAuthScenario(HttpUser):
    """
    Scénario professionnel avec chargement de données dynamique (CSV Feeder).
    Simule la connexion d'utilisateurs distincts à l'aide d'une file d'attente (Queue)
    pour éviter les collisions de données en environnement hautement concurrent.
    """
    wait_time = between(1, 3)
    
    # File d'attente globale pour stocker les comptes utilisateurs
    user_queue = Queue()
    
    @classmethod
    def load_users(cls):
        """
        Méthode de classe pour charger les comptes utilisateurs depuis un fichier CSV.
        """
        csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "users.csv")
        if os.path.exists(csv_path):
            with open(csv_path, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    cls.user_queue.put(row)
            print(f"[+] {cls.user_queue.qsize()} comptes utilisateurs chargés depuis le CSV.")
        else:
            # Fallback par défaut si le CSV n'existe pas
            for i in range(1, 101):
                cls.user_queue.put({"email": f"user{i}@example.com", "password": f"password{i}"})

    def on_start(self):
        """
        Exécuté au démarrage de chaque utilisateur simulé.
        Récupère un compte unique de la file d'attente et l'authentifie.
        """
        # Charger les données si la file est vide (premier appel)
        if self.user_queue.empty():
            self.load_users()
            
        try:
            # Récupère un utilisateur (non bloquant)
            self.credentials = self.user_queue.get_nowait()
        except:
            # Si plus de comptes uniques disponibles dans la queue, on crée un compte par défaut
            self.credentials = {"email": "user_default@example.com", "password": "default_password"}
            
        response = self.client.post("/api/auth/login", json=self.credentials)
        if response.status_code == 200:
            token = response.json().get("token")
            self.client.headers.update({"Authorization": f"Bearer {token}"})
        else:
            # Enregistrer un message d'échec si la connexion échoue
            print(f"[-] Connexion échouée pour {self.credentials['email']}: {response.status_code}")
            
    def on_stop(self):
        """
        Exécuté à la fin du cycle de vie de l'utilisateur virtuel.
        Remet le compte utilisateur dans la file d'attente pour qu'il puisse être réutilisé.
        """
        if hasattr(self, 'credentials'):
            self.user_queue.put(self.credentials)

    @task(3)
    def view_dashboard(self):
        """Simule l'accès à la page principale de l'espace membre"""
        self.client.get("/dashboard")

    @task(1)
    def edit_profile(self):
        """Exemple de requête POST dynamique avec modification du profil"""
        payload = {
            "email": self.credentials["email"],
            "bio": "Ceci est une description de test automatique de charge."
        }
        self.client.post("/api/profile/update", json=payload)
