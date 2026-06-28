import os
import sys
import subprocess
import venv

def log(message):
    print(f"\n[+] {message}")

def log_error(message):
    print(f"\n[-] ERROR: {message}", file=sys.stderr)

def main():
    log("Vérification de la version de Python...")
    if sys.version_info < (3, 10):
        log_error("Locust nécessite Python 3.10 ou supérieur. Veuillez installer une version plus récente.")
        sys.exit(1)

    template_dir = os.path.dirname(os.path.abspath(__file__))
    log(f"Configuration dans : {template_dir}")

    # 1. Création de l'environnement virtuel (.venv)
    venv_dir = os.path.join(template_dir, ".venv")
    if not os.path.exists(venv_dir):
        log("Création de l'environnement virtuel (.venv)...")
        try:
            venv.create(venv_dir, with_pip=True)
            log("Environnement virtuel créé avec succès.")
        except Exception as e:
            log_error(f"Impossible de créer le venv : {e}")
            sys.exit(1)
    else:
        log("L'environnement virtuel (.venv) existe déjà. Étape ignorée.")

    # Résolution des exécutables selon l'OS
    is_windows = os.name == 'nt'
    python_exe = os.path.join(venv_dir, "Scripts", "python.exe") if is_windows else os.path.join(venv_dir, "bin", "python")
    pip_exe = os.path.join(venv_dir, "Scripts", "pip.exe") if is_windows else os.path.join(venv_dir, "bin", "pip")

    # 2. Mise à jour de pip
    log("Mise à jour de pip...")
    try:
        subprocess.run([python_exe, "-m", "pip", "install", "--upgrade", "pip"], check=True)
    except:
        pass

    # 3. Installation des dépendances depuis requirements.txt
    req_file = os.path.join(template_dir, "requirements.txt")
    if os.path.exists(req_file):
        log("Installation des dépendances depuis requirements.txt...")
        try:
            subprocess.run([pip_exe, "install", "-r", req_file], check=True)
            log("Dépendances installées avec succès.")
        except subprocess.CalledProcessError as e:
            log_error(f"Échec de l'installation des dépendances : {e}")
            sys.exit(1)
    else:
        log("Installation de locust en direct (requirements.txt non trouvé)...")
        try:
            subprocess.run([pip_exe, "install", "locust"], check=True)
        except Exception as e:
            log_error(f"Erreur d'installation : {e}")
            sys.exit(1)

    print("\n" + "="*60)
    print(" CONFIGURATION COMPLÈTE AVEC SUCCÈS !".center(60))
    print("="*60)
    print("\nPour commencer à tester :")
    if is_windows:
        print("\n1. Activez l'environnement virtuel dans votre terminal :")
        print("   .venv\\Scripts\\Activate.ps1")
    else:
        print("\n1. Activez l'environnement virtuel dans votre terminal :")
        print("   source .venv/bin/activate")

    print("\n2. Exécutez l'un de vos scénarios de test :")
    print("   locust -f scenarios/basic_test.py")
    print("   OU")
    print("   locust -f scenarios/auth_test.py")
    print("\n3. Ouvrez http://localhost:8089 dans votre navigateur web.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
