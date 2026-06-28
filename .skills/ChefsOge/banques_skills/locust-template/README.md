# 🚀 Template de Test de Charge avec Locust

Ce dossier fournit une structure professionnelle prête à l'emploi pour effectuer des tests de charge et de performance sur votre projet Web ou API.

---

## 📁 Structure du Dossier

```text
locust-load-tests/
├── README.md               # Guide d'utilisation
├── setup.py                # Script d'installation automatique (.venv & dependencies)
├── requirements.txt        # Liste des bibliothèques requises
├── config/
│   └── locust.conf         # Fichier de configuration par défaut pour Locust
└── scenarios/
    ├── basic_test.py       # Scénario de navigation publique de base
    ├── auth_test.py        # Scénario avec authentification (Login + Token JWT)
    ├── csrf_test.py        # Scénario de gestion de jeton anti-CSRF dynamique
    ├── dynamic_auth_test.py# Scénario de connexion multi-comptes depuis un CSV
    └── db_intensive_test.py# Scénario de charge SQL / DB intensive (Recherches aléatoires)
```

---

## 🛠️ Installation Rapide

1. **Copiez le dossier** `locust-load-tests` complet dans votre projet.
2. Ouvrez un terminal dans ce dossier et exécutez le script d'installation automatique :
   ```bash
   python setup.py
   ```
   *(Ce script va automatiquement créer l'environnement virtuel `.venv` et installer Locust).*

---

## 🏃‍♂️ Lancement des Tests

1. Activez votre environnement virtuel :
   * **Windows (PowerShell) :**
     ```powershell
     .venv\Scripts\Activate.ps1
     ```
   * **macOS / Linux / Git Bash :**
     ```bash
     source .venv/bin/activate
     ```

2. Exécutez l'un de vos scénarios de test :
   * **Test de navigation simple :**
     ```bash
     locust -f scenarios/basic_test.py
     ```
   * **Test avec authentification JWT :**
     ```bash
     locust -f scenarios/auth_test.py
     ```
   * **Test avec jeton anti-CSRF :**
     ```bash
     locust -f scenarios/csrf_test.py
     ```
   * **Test multi-comptes CSV :**
     ```bash
     locust -f scenarios/dynamic_auth_test.py
     ```
   * **Test de charge Base de Données intensive :**
     ```bash
     locust -f scenarios/db_intensive_test.py
     ```
   * **Utiliser les paramètres par défaut de `locust.conf` :**
     ```bash
     locust
     ```

3. Ouvrez votre navigateur internet sur : **`http://localhost:8089`**

---

## ⚙️ Configuration personnalisée (`config/locust.conf`)

Vous pouvez modifier le fichier `config/locust.conf` pour définir les valeurs par défaut permanentes (hôte cible, nombre d'utilisateurs par défaut, temps d'exécution, etc.) afin d'éviter de devoir les saisir à chaque fois dans l'interface Web ou dans la console.
