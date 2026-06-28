from locust import HttpUser, task, between

class SimpleScenario(HttpUser):
    """
    Scénario simple de navigation pour tester l'accès aux pages publiques de l'application.
    """
    # Attente aléatoire de 1 à 3 secondes entre chaque tâche de l'utilisateur
    wait_time = between(1, 3)

    @task(3)
    def index_page(self):
        """Simule la visite de la page d'accueil (fréquence élevée)"""
        self.client.get("/")

    @task(1)
    def about_page(self):
        """Simule la visite de la page 'À Propos' (fréquence normale)"""
        self.client.get("/about")
