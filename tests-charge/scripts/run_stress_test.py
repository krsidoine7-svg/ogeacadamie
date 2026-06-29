import os
import sys
import argparse
import subprocess
import csv
import json
from typing import Dict, Any

def parse_args():
    parser = argparse.ArgumentParser(description="Lancer un stress test Locust pour trouver le point de rupture et générer un dashboard interactif.")
    parser.add_argument("-f", "--file", required=True, help="Chemin du scénario de test (ex: scenarios/basic_test.py)")
    parser.add_argument("-u", "--max-users", type=int, default=50, help="Nombre max d'utilisateurs à injecter")
    parser.add_argument("-r", "--spawn-rate", type=int, default=2, help="Taux d'apparition des utilisateurs par seconde")
    parser.add_argument("-t", "--run-time", default="1m", help="Durée du test (ex: 1m, 2m, 5m)")
    parser.add_argument("--host", required=True, help="URL de l'application cible (ex: http://localhost:3000)")
    parser.add_argument("--max-latency", type=int, default=1500, help="Latence p95 max tolérée en ms (défaut: 1500)")
    parser.add_argument("--max-error-rate", type=float, default=2.0, help="Taux d'erreur max toléré en %% (défaut: 2.0)")
    return parser.parse_args()

def generate_html_dashboard(output_path, host, scenario, max_users, run_time, kpis, history_data, endpoints_data, failures_data):
    """
    Génère un dashboard HTML5 complet, interactif et ultra-design (Glassmorphism, Neon Dark Mode)
    contenant des graphiques (Chart.js) et un tableau croisé dynamique (Pivot Table).
    """
    html_template = f"""<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Rapport de Stress Test Locust</title>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;800&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        :root {{
            --bg-color: #0B0F19;
            --card-bg: rgba(17, 24, 39, 0.7);
            --card-border: rgba(255, 255, 255, 0.08);
            --text-primary: #F3F4F6;
            --text-secondary: #9CA3AF;
            --neon-blue: #00F0FF;
            --neon-purple: #9D4EDD;
            --neon-pink: #FF007F;
            --neon-green: #39FF14;
            --danger-red: #FF3333;
        }}

        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}

        body {{
            background-color: var(--bg-color);
            color: var(--text-primary);
            font-family: 'Outfit', sans-serif;
            padding: 40px 20px;
            background-image: radial-gradient(circle at 10% 20%, rgba(90, 40, 200, 0.15) 0%, transparent 40%),
                              radial-gradient(circle at 90% 80%, rgba(0, 240, 255, 0.12) 0%, transparent 45%);
            background-attachment: fixed;
        }}

        .container {{
            max-width: 1200px;
            margin: 0 auto;
        }}

        header {{
            text-align: center;
            margin-bottom: 40px;
        }}

        header h1 {{
            font-size: 2.8rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--neon-blue), var(--neon-purple));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            margin-bottom: 10px;
            letter-spacing: -1px;
        }}

        header p {{
            color: var(--text-secondary);
            font-size: 1.1rem;
        }}

        /* Grid des KPIs */
        .kpi-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }}

        .kpi-card {{
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
            transition: transform 0.3s ease, border-color 0.3s ease;
        }}

        .kpi-card:hover {{
            transform: translateY(-5px);
            border-color: rgba(0, 240, 255, 0.3);
        }}

        .kpi-card h3 {{
            color: var(--text-secondary);
            font-size: 0.9rem;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 12px;
        }}

        .kpi-card .value {{
            font-size: 2rem;
            font-weight: 800;
            color: #FFF;
            text-shadow: 0 0 10px rgba(255, 255, 255, 0.2);
        }}

        .kpi-card.breaking-point .value {{
            color: var(--neon-pink);
            text-shadow: 0 0 15px rgba(255, 0, 127, 0.4);
        }}

        .kpi-card.safe-limit .value {{
            color: var(--neon-green);
            text-shadow: 0 0 15px rgba(57, 255, 20, 0.4);
        }}

        .kpi-card .unit {{
            font-size: 0.9rem;
            font-weight: 400;
            color: var(--text-secondary);
            margin-left: 4px;
        }}

        /* Graphiques */
        .chart-row {{
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 20px;
            margin-bottom: 40px;
        }}

        @media (max-width: 900px) {{
            .chart-row {{
                grid-template-columns: 1fr;
            }}
        }}

        .card {{
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 16px;
            padding: 24px;
            backdrop-filter: blur(12px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
        }}

        .card h2 {{
            font-size: 1.4rem;
            font-weight: 600;
            margin-bottom: 20px;
            border-left: 4px solid var(--neon-blue);
            padding-left: 12px;
        }}

        .chart-container {{
            position: relative;
            height: 350px;
            width: 100%;
        }}

        .donut-container {{
            display: flex;
            justify-content: center;
            align-items: center;
            height: 350px;
        }}

        /* Tableau Croisé */
        .pivot-section {{
            margin-bottom: 40px;
        }}

        .pivot-controls {{
            display: flex;
            gap: 15px;
            margin-bottom: 15px;
            flex-wrap: wrap;
        }}

        .pivot-controls select, .pivot-controls input {{
            background: rgba(31, 41, 55, 0.8);
            border: 1px solid var(--card-border);
            color: #FFF;
            padding: 10px 16px;
            border-radius: 8px;
            font-family: inherit;
            outline: none;
        }}

        .pivot-table-container {{
            width: 100%;
            overflow-x: auto;
            border-radius: 12px;
            border: 1px solid var(--card-border);
        }}

        table {{
            width: 100%;
            border-collapse: collapse;
            text-align: left;
            font-size: 0.95rem;
            background: rgba(17, 24, 39, 0.4);
        }}

        th, td {{
            padding: 14px 18px;
            border-bottom: 1px solid var(--card-border);
        }}

        th {{
            background: rgba(31, 41, 55, 0.7);
            color: var(--text-secondary);
            font-weight: 600;
            text-transform: uppercase;
            font-size: 0.8rem;
            letter-spacing: 0.5px;
            cursor: pointer;
            user-select: none;
        }}

        th:hover {{
            color: #FFF;
        }}

        tr:hover td {{
            background: rgba(255, 255, 255, 0.02);
        }}

        td.code {{
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
        }}

        .badge {{
            display: inline-block;
            padding: 4px 8px;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 600;
        }}

        .badge.get {{ background: rgba(0, 240, 255, 0.15); color: var(--neon-blue); }}
        .badge.post {{ background: rgba(157, 78, 221, 0.15); color: var(--neon-purple); }}
        .badge.put {{ background: rgba(57, 255, 20, 0.15); color: var(--neon-green); }}
        .badge.delete {{ background: rgba(255, 0, 127, 0.15); color: var(--neon-pink); }}

        .text-right {{
            text-align: right;
        }}
    </style>
</head>
<body>
    <div class="container">
        <header>
            <h1>Rapport de Stress Test Locust</h1>
            <p>Hôte ciblé : <strong>{host}</strong> | Scénario : <strong>{scenario}</strong></p>
        </header>

        <!-- KPI Cards -->
        <div class="kpi-grid">
            <div class="kpi-card safe-limit">
                <h3>Limite de Sécurité</h3>
                <div class="value">{kpis['safe_users']}<span class="unit">users</span></div>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px;">Max supporté sans erreur</p>
            </div>
            <div class="kpi-card safe-limit">
                <h3>RPS Limite de Sécurité</h3>
                <div class="value">{kpis['safe_rps']}<span class="unit">req/s</span></div>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px;">Débit maximal stabilisé</p>
            </div>
            <div class="kpi-card breaking-point">
                <h3>Point de Rupture</h3>
                <div class="value">{kpis['break_users'] if kpis['break_users'] else 'Non atteint'}<span class="unit">users</span></div>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px;">Début de la dégradation</p>
            </div>
            <div class="kpi-card">
                <h3>RPS Maximum</h3>
                <div class="value">{kpis['max_rps']}<span class="unit">req/s</span></div>
                <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 8px;">Pic de requêtes brut atteint</p>
            </div>
        </div>

        <!-- Rangée des Graphiques -->
        <div class="chart-row">
            <!-- Courbe de charge et performances -->
            <div class="card">
                <h2>Courbe de Performance Globale</h2>
                <div class="chart-container">
                    <canvas id="performanceChart"></canvas>
                </div>
            </div>

            <!-- Camembert/Donut des requêtes (Succès vs Échecs) -->
            <div class="card">
                <h2>Statut des Requêtes</h2>
                <div class="donut-container">
                    <canvas id="statusChart"></canvas>
                </div>
            </div>
        </div>

        <!-- Section Tableau Croisé Dynamique -->
        <div class="card pivot-section">
            <h2>Tableau Croisé Dynamique des Requêtes</h2>
            <div class="pivot-controls">
                <input type="text" id="endpointSearch" placeholder="Rechercher une route..." onkeyup="filterPivot()">
                <select id="methodFilter" onchange="filterPivot()">
                    <option value="">Toutes les méthodes</option>
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                    <option value="PUT">PUT</option>
                    <option value="DELETE">DELETE</option>
                </select>
            </div>
            <div class="pivot-table-container">
                <table id="pivotTable">
                    <thead>
                        <tr>
                            <th onclick="sortTable(0)">Méthode</th>
                            <th onclick="sortTable(1)">Endpoint</th>
                            <th onclick="sortTable(2)" class="text-right">Requêtes</th>
                            <th onclick="sortTable(3)" class="text-right">Échecs</th>
                            <th onclick="sortTable(4)" class="text-right">Moyenne (ms)</th>
                            <th onclick="sortTable(5)" class="text-right">Min (ms)</th>
                            <th onclick="sortTable(6)" class="text-right">Max (ms)</th>
                            <th onclick="sortTable(7)" class="text-right">RPS</th>
                        </tr>
                    </thead>
                    <tbody id="pivotBody">
                        <!-- Rempli par JavaScript -->
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // Données injectées depuis Python
        const history = {json.dumps(history_data)};
        const endpoints = {json.dumps(endpoints_data)};
        const failures = {json.dumps(failures_data)};

        // 1. Initialisation du graphique de Performance
        const perfCtx = document.getElementById('performanceChart').getContext('2d');
        new Chart(perfCtx, {{
            type: 'line',
            data: {{
                labels: history.map(row => row.timestamp),
                datasets: [
                    {{
                        label: 'Utilisateurs actifs',
                        data: history.map(row => row.users),
                        borderColor: '#9D4EDD',
                        backgroundColor: 'rgba(157, 78, 221, 0.1)',
                        yAxisID: 'y-users',
                        borderWidth: 2,
                        tension: 0.3,
                        fill: true
                    }},
                    {{
                        label: 'RPS (Requêtes/s)',
                        data: history.map(row => row.rps),
                        borderColor: '#00F0FF',
                        yAxisID: 'y-rps',
                        borderWidth: 2,
                        tension: 0.3
                    }},
                    {{
                        label: 'Latence p95 (ms)',
                        data: history.map(row => row.p95),
                        borderColor: '#FF007F',
                        yAxisID: 'y-latency',
                        borderWidth: 1.5,
                        borderDash: [5, 5],
                        tension: 0.3
                    }}
                ]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                scales: {{
                    'y-users': {{
                        type: 'linear',
                        position: 'left',
                        grid: {{ color: 'rgba(255,255,255,0.05)' }},
                        ticks: {{ color: '#9CA3AF' }}
                    }},
                    'y-rps': {{
                        type: 'linear',
                        position: 'right',
                        grid: {{ drawOnChartArea: false }},
                        ticks: {{ color: '#9CA3AF' }}
                    }},
                    'y-latency': {{
                        type: 'linear',
                        position: 'right',
                        grid: {{ drawOnChartArea: false }},
                        ticks: {{ color: '#9CA3AF' }}
                    }}
                }},
                plugins: {{
                    legend: {{
                        labels: {{ color: '#F3F4F6', font: {{ family: 'Outfit' }} }}
                    }}
                }}
            }}
        }});

        // 2. Initialisation du graphique en Donut (Success vs Failures)
        const totalRequests = endpoints.reduce((sum, row) => sum + parseInt(row.requests), 0);
        const totalFailures = endpoints.reduce((sum, row) => sum + parseInt(row.failures), 0);
        const totalSuccess = totalRequests - totalFailures;

        const statusCtx = document.getElementById('statusChart').getContext('2d');
        new Chart(statusCtx, {{
            type: 'doughnut',
            data: {{
                labels: ['Succès', 'Échecs'],
                datasets: [{{
                    data: [totalSuccess, totalFailures],
                    backgroundColor: ['#39FF14', '#FF3333'],
                    borderColor: '#0B0F19',
                    borderWidth: 3
                }}]
            }},
            options: {{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {{
                    legend: {{
                        position: 'bottom',
                        labels: {{ color: '#F3F4F6', font: {{ family: 'Outfit' }} }}
                    }}
                }},
                cutout: '70%'
            }}
        }});

        // 3. Remplissage du tableau croisé dynamique
        const tableBody = document.getElementById('pivotBody');
        
        function renderTable(data) {{
            tableBody.innerHTML = '';
            data.forEach(row => {{
                const tr = document.createElement('tr');
                const badgeClass = row.method.toLowerCase();
                tr.innerHTML = `
                    <td><span class="badge ${{badgeClass}}">${{row.method}}</span></td>
                    <td class="code">${{row.name}}</td>
                    <td class="text-right">${{parseInt(row.requests).toLocaleString()}}</td>
                    <td class="text-right" style="color: ${{parseInt(row.failures) > 0 ? 'var(--danger-red)' : 'inherit'}}">${{parseInt(row.failures).toLocaleString()}}</td>
                    <td class="text-right">${{parseFloat(row.avg_response_time).toFixed(1)}}</td>
                    <td class="text-right">${{row.min_response_time}}</td>
                    <td class="text-right">${{row.max_response_time}}</td>
                    <td class="text-right">${{parseFloat(row.current_rps).toFixed(1)}}</td>
                `;
                tableBody.appendChild(tr);
            }});
        }}

        renderTable(endpoints);

        // Filtrage dynamique
        function filterPivot() {{
            const searchVal = document.getElementById('endpointSearch').value.toLowerCase();
            const methodVal = document.getElementById('methodFilter').value;
            
            const filtered = endpoints.filter(row => {{
                const matchesSearch = row.name.toLowerCase().includes(searchVal);
                const matchesMethod = methodVal === '' || row.method === methodVal;
                return matchesSearch && matchesMethod;
            }});
            
            renderTable(filtered);
        }}

        // Tri du tableau
        let sortDirection = false;
        function sortTable(columnIndex) {{
            sortDirection = !sortDirection;
            const keyMap = ['method', 'name', 'requests', 'failures', 'avg_response_time', 'min_response_time', 'max_response_time', 'current_rps'];
            const key = keyMap[columnIndex];

            endpoints.sort((a, b) => {{
                let valA = a[key];
                let valB = b[key];
                
                // Conversion numérique si nécessaire
                if (['requests', 'failures', 'avg_response_time', 'min_response_time', 'max_response_time', 'current_rps'].includes(key)) {{
                    valA = parseFloat(valA);
                    valB = parseFloat(valB);
                }}

                if (valA < valB) return sortDirection ? -1 : 1;
                if (valA > valB) return sortDirection ? 1 : -1;
                return 0;
            }});

            filterPivot();
        }}
    </script>
</body>
</html>
"""
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html_template)
    print(f"[+] Dashboard HTML interactif généré avec succès dans : {output_path}")

def main():
    args = parse_args()
    
    output_dir = "results"
    os.makedirs(output_dir, exist_ok=True)
    csv_prefix = os.path.join(output_dir, "stress_results")
    html_report = os.path.join(output_dir, "locust_raw_report.html")
    dashboard_path = os.path.join(output_dir, "stress_dashboard.html")
    summary_csv = os.path.join(output_dir, "kpi_rupture_stats.csv")

    cmd = [
        sys.executable,
        "-m", "locust",
        "-f", args.file,
        "--headless",
        "-u", str(args.max_users),
        "-r", str(args.spawn_rate),
        "-t", args.run_time,
        "--host", args.host,
        f"--csv={csv_prefix}",
        f"--html={html_report}"
    ]
    
    print(f"\n[+] Lancement du Stress Test Locust (Injection progressive)...")
    print(f"    Cible : {args.host}")
    print(f"    Charge max : {args.max_users} utilisateurs avec un pas de {args.spawn_rate} users/sec")
    print(f"    Commande : {' '.join(cmd)}")
    
    try:
        subprocess.run(cmd, check=True)
    except Exception as e:
        print(f"[-] Erreur lors du lancement de Locust : {e}")
        sys.exit(1)

    print("\n[+] Analyse de la courbe de charge et calcul du point de rupture...")
    
    history_file = f"{csv_prefix}_stats_history.csv"
    stats_file = f"{csv_prefix}_stats.csv"
    failures_file = f"{csv_prefix}_failures.csv"

    if not os.path.exists(history_file):
        print(f"[-] Erreur : Le fichier d'historique {history_file} n'a pas été généré.")
        sys.exit(1)

    # 1. Lire l'historique temporel pour trouver le point de rupture
    history_data = []
    break_users_val: Any = None
    break_rps_val: Any = None
    kpis: Dict[str, Any] = {
        "max_rps": 0.0,
        "break_users": break_users_val,
        "break_rps": break_rps_val,
        "safe_users": int(args.max_users),
        "safe_rps": 0.0
    }

    try:
        with open(history_file, mode='r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            first_row = True
            for row in reader:
                # Filtrer les lignes vides ou incomplètes
                if not row.get('Timestamp') or not row.get('User Count'):
                    continue
                
                try:
                    user_count = int(row['User Count'])
                    # Certaines versions de Locust utilisent differentes en-têtes
                    rps = float(row.get('Current RPS', row.get('Requests/s', 0.0)))
                    failures_s = float(row.get('Current Failures/s', row.get('Failures/s', 0.0)))
                    p95 = float(row.get('95%', row.get('95% Response Time', 0.0)))
                    p50 = float(row.get('50%', row.get('Median Response Time', 0.0)))
                except (ValueError, KeyError) as e:
                    continue

                # Consigner le pic de RPS
                if rps > kpis["max_rps"]:
                    kpis["max_rps"] = rps

                # Calculer le taux d'erreur sur ce pas
                error_rate = (failures_s / rps * 100) if rps > 0 else 0.0

                # Formater le timestamp pour l'affichage (récupérer juste l'heure)
                # Timestamp est généralement au format Unix ou datetime
                raw_time = row['Timestamp']
                if " " in raw_time:
                    time_label = raw_time.split(" ")[1].split(".")[0]
                else:
                    import datetime
                    try:
                        time_label = datetime.datetime.fromtimestamp(float(raw_time)).strftime('%H:%M:%S')
                    except:
                        time_label = raw_time

                history_data.append({
                    "timestamp": time_label,
                    "users": user_count,
                    "rps": rps,
                    "failures_s": failures_s,
                    "p50": p50,
                    "p95": p95,
                    "error_rate": error_rate
                })

                # Vérifier si les seuils de rupture sont franchis
                is_broken = (error_rate > args.max_error_rate) or (p95 > args.max_latency)
                if is_broken and kpis["break_users"] is None:
                    kpis["break_users"] = user_count
                    kpis["break_rps"] = rps
                    # La limite de sécurité est le pas juste avant la rupture
                    # Si c'est la toute première ligne, la limite est 0, sinon le dernier pas consigné
                    if len(history_data) > 1:
                        prev_step = history_data[-2]
                        kpis["safe_users"] = int(prev_step["users"])
                        kpis["safe_rps"] = float(prev_step["rps"])
                    else:
                        kpis["safe_users"] = 0
                        kpis["safe_rps"] = 0.0

            # Si le point de rupture n'a pas été atteint
            if kpis["break_users"] is None:
                # Tout s'est bien passé, la limite de sécurité est la charge max testée
                if history_data:
                    last_step = history_data[-1]
                    kpis["safe_users"] = int(last_step["users"])
                    kpis["safe_rps"] = float(last_step["rps"])
    except Exception as e:
        print(f"[-] Erreur lors de l'analyse de l'historique : {e}")
        sys.exit(1)

    # 2. Lire les statistiques par endpoint
    endpoints_data = []
    if os.path.exists(stats_file):
        try:
            with open(stats_file, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Ne pas inclure la ligne de résumé dans les endpoints du tableau
                    if row.get('Name') == 'Aggregated' or row.get('Type') == '':
                        continue
                    endpoints_data.append({
                        "method": row.get('Type', 'GET'),
                        "name": row.get('Name', '/'),
                        "requests": row.get('Request Count', '0'),
                        "failures": row.get('Failure Count', '0'),
                        "avg_response_time": row.get('Average Response Time', '0'),
                        "min_response_time": row.get('Min Response Time', '0'),
                        "max_response_time": row.get('Max Response Time', '0'),
                        "current_rps": row.get('Current RPS', '0.0')
                    })
        except Exception as e:
            print(f"[-] Erreur lors de la lecture des stats endpoints : {e}")

    # 3. Lire les pannes/failures
    failures_data = []
    if os.path.exists(failures_file):
        try:
            with open(failures_file, mode='r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    failures_data.append({
                        "method": row.get('Method', 'GET'),
                        "name": row.get('Name', '/'),
                        "error": row.get('Error', 'Timeout'),
                        "occurrences": row.get('Occurrences', '1')
                    })
        except Exception as e:
            print(f"[-] Erreur lors de la lecture des erreurs : {e}")

    # 4. Générer le Dashboard HTML
    generate_html_dashboard(dashboard_path, args.host, args.file, args.max_users, args.run_time, kpis, history_data, endpoints_data, failures_data)

    # 5. Enregistrer le fichier de statistiques de rupture en CSV (Tableau Croisé / KPI résumé)
    try:
        with open(summary_csv, mode='w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(["Métrique de Rupture", "Valeur", "Description"])
            writer.writerow(["Hôte testé", args.host, "Serveur web analysé"])
            writer.writerow(["Scénario", args.file, "Scénario Locust exécuté"])
            writer.writerow(["Nombre d'utilisateurs Max", args.max_users, "Charge maximale demandée"])
            writer.writerow(["RPS Max brut atteint", f"{kpis['max_rps']:.2f}", "Débit maximal brut enregistré"])
            writer.writerow(["Point de rupture (Users)", kpis['break_users'] if kpis['break_users'] else "Non atteint", "Nombre d'utilisateurs simultanés ayant provoqué l'échec"])
            writer.writerow(["Point de rupture (RPS)", f"{kpis['break_rps']:.2f}" if kpis['break_rps'] else "Non atteint", "RPS à la rupture"])
            writer.writerow(["Limite de sécurité (Users)", kpis['safe_users'], "Charge maximale supportée de façon stable"])
            writer.writerow(["Limite de sécurité (RPS)", f"{kpis['safe_rps']:.2f}", "Débit maximal supporté de façon stable"])
        print(f"[+] Statistiques de rupture enregistrées dans : {summary_csv}")
    except Exception as e:
        print(f"[-] Impossible d'enregistrer le CSV de rupture : {e}")

    print("\n" + "="*60)
    print(" ANALYSE DE LA LIMITE COMPLÈTE ".center(60, "="))
    print(f"Cible : {args.host}")
    print(f"Charge maximale stable (Limite) : {kpis['safe_users']} utilisateurs simultanés")
    print(f"Débit maximal stable (Limite)   : {kpis['safe_rps']:.2f} RPS (requêtes/sec)")
    if kpis['break_users']:
        print(f"Point de rupture détecté à       : {kpis['break_users']} utilisateurs ({kpis['break_rps']:.2f} RPS)")
    else:
        print("Point de rupture détecté à       : Non atteint (Le système a tout supporté)")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
