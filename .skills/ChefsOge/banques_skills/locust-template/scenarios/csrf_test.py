import re
from locust import HttpUser, task, between

class CSRFScenario(HttpUser):
    """
    Scénario professionnel montrant comment extraire dynamiquement un jeton CSRF
    depuis le code HTML d'une page (requis pour les frameworks comme Django, Laravel, Symfony)
    afin de le soumettre dans une requête POST ultérieure.
    """
    wait_time = between(1, 3)

    @task
    def submit_secure_form(self):
        """Simule l'obtention d'un formulaire, l'extraction du jeton CSRF et sa soumission sécurisée"""
        
        # 1. Charger la page contenant le formulaire (GET)
        with self.client.get("/login", catch_response=True) as response:
            if response.status_code == 200:
                # 2. Extraction du jeton CSRF par expression régulière
                # Cherche par exemple : <input type="hidden" name="csrf_token" value="VALEUR_JETON" />
                match = re.search(r'name=["\']csrf_token["\']\s+value=["\']([^"\']+)["\']', response.text)
                
                if match:
                    csrf_token = match.group(1)
                    
                    # 3. Préparer les données et en-têtes contenant le jeton
                    headers = {
                        "X-CSRFToken": csrf_token,
                        "Referer": f"{self.host}/login"
                    }
                    payload = {
                        "csrf_token": csrf_token,
                        "username": "user_charge_test",
                        "password": "password123"
                    }
                    
                    # 4. Envoyer la requête POST sécurisée
                    self.client.post("/login", data=payload, headers=headers)
                else:
                    response.failure("Échec : Jeton CSRF introuvable dans le code HTML de la page")
            else:
                response.failure(f"Échec : Impossible de charger la page de login (code: {response.status_code})")
