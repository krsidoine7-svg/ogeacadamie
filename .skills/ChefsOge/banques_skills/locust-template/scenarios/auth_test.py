from locust import HttpUser, task, between

class AuthScenario(HttpUser):
    """
    Scénario avancé simulant la connexion d'un utilisateur et l'accès
    à des routes protégées via un jeton d'authentification (Token).
    """
    wait_time = between(1, 4)

    def on_start(self):
        """
        Méthode exécutée au démarrage de la session de l'utilisateur virtuel.
        Elle gère l'authentification et injecte le jeton JWT dans les en-têtes.
        """
        log_payload = {
            "email": "user@example.com",
            "password": "password123"
        }
        
        # Envoi de la requête de connexion
        response = self.client.post("/api/auth/login", json=log_payload)
        
        if response.status_code == 200:
            # Récupération du jeton JWT dans la réponse JSON
            token = response.json().get("token")
            # Ajout du header d'autorisation pour toutes les requêtes futures de cet utilisateur
            self.client.headers.update({"Authorization": f"Bearer {token}"})
        else:
            print(f"Échec de l'authentification pour l'utilisateur. Code : {response.status_code}")

    @task(3)
    def view_dashboard(self):
        """Simule la visite de l'espace membre / tableau de bord"""
        self.client.get("/dashboard")

    @task(1)
    def view_profile(self):
        """Simule la visite des paramètres du profil utilisateur"""
        self.client.get("/dashboard/profile")
