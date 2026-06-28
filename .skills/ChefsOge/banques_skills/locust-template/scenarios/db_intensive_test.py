import random
from locust import HttpUser, task, between

class DatabaseIntensiveScenario(HttpUser):
    """
    Scénario simulant une charge intensive sur la base de données (Heavy DB Load).
    Combine des requêtes de recherche complexes avec filtres (pour bypasser le cache),
    des requêtes d'agrégation de données (calculs de stats), et des opérations d'écriture.
    """
    # Attente de 1 à 3 secondes entre les tâches pour simuler le comportement humain
    wait_time = between(1, 3)

    # Listes de données de test pour simuler des recherches aléatoires variées
    CATEGORIES = ["electronics", "books", "clothing", "home", "sports", "beauty"]
    KEYWORDS = ["laptop", "phone", "novel", "t-shirt", "chair", "shoes", "makeup", "bike"]
    SORT_OPTIONS = ["price_asc", "price_desc", "rating", "newest"]

    @task(6)
    def search_products(self):
        """
        Simule une recherche de produits avec plusieurs paramètres de filtrage aléatoires.
        Les paramètres dynamiques forcent la base de données à exécuter la requête SQL
        au lieu de simplement retourner un résultat en cache (Query Cache Bypass).
        """
        category = random.choice(self.CATEGORIES)
        keyword = random.choice(self.KEYWORDS)
        sort_by = random.choice(self.SORT_OPTIONS)
        page = random.randint(1, 10)  # Utilise la pagination (OFFSET/LIMIT lourd pour la DB)

        url = f"/api/products/search?q={keyword}&category={category}&sort={sort_by}&page={page}"
        
        # Le nom (name) permet de regrouper toutes les variantes d'URL dans les rapports Locust
        self.client.get(url, name="/api/products/search?q=[query]&category=[cat]&sort=[sort]&page=[page]")

    @task(1)
    def view_aggregated_stats(self):
        """
        Simule l'accès à un tableau de bord ou à des rapports de statistiques.
        Ces requêtes effectuent généralement des jointures complexes, des COUNT, SUM ou GROUP BY,
        ce qui stresse fortement le CPU du serveur de base de données.
        """
        self.client.get("/api/reports/statistics")

    @task(3)
    def get_user_activity_history(self):
        """
        Récupère l'historique complet d'activité de l'utilisateur.
        Nécessite souvent le chargement de nombreuses lignes de données avec jointure.
        """
        user_id = random.randint(1, 5000)
        self.client.get(f"/api/users/{user_id}/history", name="/api/users/[id]/history")

    @task(2)
    def write_comment_or_review(self):
        """
        Simule une action d'écriture (INSERT/UPDATE).
        L'écriture est critique en test de charge car elle invalide les caches de requêtes
        de la base de données et peut provoquer des verrous de table/ligne (row/table locking).
        """
        product_id = random.randint(1, 1000)
        payload = {
            "product_id": product_id,
            "rating": random.randint(1, 5),
            "comment": "Super produit ! Test de charge automatisé.",
            "anonymous": random.choice([True, False])
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        self.client.post("/api/products/reviews", json=payload, headers=headers)
