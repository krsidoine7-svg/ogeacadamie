FROM python:3.11-slim

WORKDIR /app

# Installer les dépendances
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du dossier
COPY . .

# Exposer le port par défaut pour l'interface web Locust
EXPOSE 8089

# Lancer la commande locust par défaut
ENTRYPOINT ["locust"]
