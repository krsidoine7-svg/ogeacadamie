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
        log_error("Locust nécessite Python 3.10 ou supérieur.")
        sys.exit(1)

    template_dir = os.path.dirname(os.path.abspath(__file__))
    log(f"Configuration du dossier de tests OGE Académie : {template_dir}")

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

    is_windows = os.name == 'nt'
    python_exe = os.path.join(venv_dir, "Scripts", "python.exe") if is_windows else os.path.join(venv_dir, "bin", "python")
    pip_exe = os.path.join(venv_dir, "Scripts", "pip.exe") if is_windows else os.path.join(venv_dir, "bin", "pip")

    # 2. Mise à jour de pip
    log("Mise à jour de pip...")
    try:
        subprocess.run([python_exe, "-m", "pip", "install", "--upgrade", "pip"], check=True)
    except:
        pass

    # 3. Installation des dépendances
    req_file = os.path.join(template_dir, "requirements.txt")
    log("Installation de Locust...")
    try:
        subprocess.run([pip_exe, "install", "-r", req_file], check=True)
        log("Locust installé avec succès.")
    except subprocess.CalledProcessError as e:
        log_error(f"Échec de l'installation : {e}")
        sys.exit(1)

    print("\n" + "="*60)
    print(" CONFIGURATION OGE ACADÉMIE — TESTS DE CHARGE".center(60))
    print("="*60)
    print("\nPour lancer un test :")
    if is_windows:
        print("   .venv\\Scripts\\Activate.ps1")
    else:
        print("   source .venv/bin/activate")
    print("   locust -f scenarios/oge_public_test.py")
    print("   locust -f scenarios/oge_candidat_test.py")
    print("   locust -f scenarios/oge_manager_test.py")
    print("\nOuvrez http://localhost:8089 dans votre navigateur.")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
