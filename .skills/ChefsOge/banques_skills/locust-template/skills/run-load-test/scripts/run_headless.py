import os
import sys
import argparse
import subprocess
import csv

def parse_args():
    parser = argparse.ArgumentParser(description="Lancer un test de charge en mode headless et analyser le CSV généré.")
    parser.add_argument("-f", "--file", required=True, help="Chemin du scénario de test (ex: scenarios/basic_test.py)")
    parser.add_argument("-u", "--users", type=int, default=10, help="Nombre d'utilisateurs simulés")
    parser.add_argument("-r", "--spawn-rate", type=int, default=2, help="Taux d'apparition des utilisateurs par seconde")
    parser.add_argument("-t", "--run-time", default="30s", help="Durée du test (ex: 30s, 2m, 1h)")
    parser.add_argument("--host", required=True, help="URL de l'application cible (ex: http://localhost:3000)")
    parser.add_argument("-o", "--output", help="Chemin du fichier Markdown pour écrire le résumé")
    return parser.parse_args()

def main():
    args = parse_args()
    
    # Prefix for outputs
    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    csv_prefix = os.path.join(output_dir, "temp_results")
    html_report = os.path.join(output_dir, "report.html")
    
    cmd = [
        "locust",
        "-f", args.file,
        "--headless",
        "-u", str(args.users),
        "-r", str(args.spawn_rate),
        "-t", args.run_time,
        "--host", args.host,
        f"--csv={csv_prefix}",
        f"--html={html_report}"
    ]
    
    print(f"\n[+] Lancement de Locust en mode Headless...")
    print(f"    Commande : {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
    except FileNotFoundError:
        print("[!] Commande 'locust' non trouvée directement, tentative avec 'python -m locust'...")
        cmd_fallback = ["python", "-m"] + cmd
        try:
            subprocess.run(cmd_fallback, check=True)
        except Exception as e:
            print(f"[-] Erreur lors du lancement de Locust : {e}")
            sys.exit(1)
    except Exception as e:
        print(f"[-] Erreur lors de l'exécution du test : {e}")
        sys.exit(1)
        
    print("\n[+] Test de charge terminé. Analyse des résultats...")
    
    # Locate stats CSV file
    stats_file = f"{csv_prefix}_stats.csv"
    if not os.path.exists(stats_file):
        print(f"[-] Erreur : Le fichier de résultats {stats_file} n'a pas été trouvé.")
        sys.exit(1)
        
    summary_data = {}
    try:
        with open(stats_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Target the aggregated row summarizing everything
                if row.get('Name') == 'Aggregated' or row.get('Type') == '':
                    summary_data = row
                    break
    except Exception as e:
        print(f"[-] Impossible de lire les statistiques du fichier CSV : {e}")
        sys.exit(1)
        
    if not summary_data:
        print("[-] Erreur : Ligne de résumé global (Aggregated) introuvable dans le CSV.")
        sys.exit(1)
        
    # Extract metrics
    req_count = summary_data.get('Request Count', '0')
    fail_count = summary_data.get('Failure Count', '0')
    median_latency = summary_data.get('50%', '0')
    p95_latency = summary_data.get('95%', '0')
    avg_latency = summary_data.get('Average Response Time', '0')
    rps_avg = summary_data.get('Current RPS', '0')
    
    # Calculate error rate
    try:
        reqs = int(req_count)
        fails = int(fail_count)
        fail_rate = (fails / reqs * 100) if reqs > 0 else 0
    except:
        fail_rate = 0.0
        
    summary_md = (
        f"# Résumé du Test de Charge Locust\n\n"
        f"| Métrique | Valeur |\n"
        f"| --- | --- |\n"
        f"| **Hôte testé** | {args.host} |\n"
        f"| **Scénario exécuté** | {args.file} |\n"
        f"| **Utilisateurs simulés** | {args.users} |\n"
        f"| **Durée du test** | {args.run_time} |\n"
        f"| **Requêtes totales** | {req_count} |\n"
        f"| **Requêtes en échec** | {fail_count} ({fail_rate:.2f}%) |\n"
        f"| **RPS Moyen** | {rps_avg} req/s |\n"
        f"| **Temps de réponse Moyen** | {avg_latency} ms |\n"
        f"| **Temps de réponse p50 (Médiane)** | {median_latency} ms |\n"
        f"| **Temps de réponse p95** | {p95_latency} ms |\n\n"
    )
    
    # Simple check on latency and error rate
    status = "SUCCÈS"
    notes = []
    if fail_rate > 1.0:
        status = "ÉCHEC"
        notes.append(f"Le taux de requêtes en échec est anormalement élevé ({fail_rate:.2f}%).")
    try:
        p95_val = float(p95_latency)
        if p95_val > 1000:
            status = "ATTENTION"
            notes.append(f"Le temps de réponse p95 ({p95_latency} ms) dépasse 1 seconde.")
    except:
        pass
        
    summary_md += f"### Statut Global : **{status}**\n"
    if notes:
        summary_md += "\nRemarques :\n"
        for note in notes:
            summary_md += f"* {note}\n"
    else:
        summary_md += "\nLe système a supporté la charge avec succès sans erreur significative.\n"
        
    print("\n" + "="*50)
    print(" RÉSULTATS DU TEST ".center(50, "="))
    print(f"Hôte : {args.host}")
    print(f"Requêtes : {req_count} | Échecs : {fail_count} ({fail_rate:.2f}%)")
    print(f"RPS : {rps_avg} | p50 : {median_latency} ms | p95 : {p95_latency} ms")
    print(f"Statut : {status}")
    print("="*50 + "\n")
    
    if args.output:
        try:
            with open(args.output, 'w', encoding='utf-8') as out_f:
                out_f.write(summary_md)
            print(f"[+] Résumé Markdown enregistré dans : {args.output}")
        except Exception as e:
            print(f"[-] Impossible d'enregistrer le résumé : {e}")
            
if __name__ == "__main__":
    main()
