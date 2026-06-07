#!/usr/bin/env python3
"""
Garde-fou anti-contamination croisée pour les projets Vercel.
À exécuter avant chaque vercel deploy.
Vérifie que le repo courant correspond au bon projet Vercel.
"""
import json, subprocess, sys, os

# Mapping repo name → Vercel project ID
PROJECT_MAP = {
    'taka-inside': 'prj_8h5X7oZAbC02gjW6nIxw6rL5bToc',
    'solideat': 'prj_QPBgoDOlMaGlXQ5gnT02tvauaJJB',
}

def get_repo_name():
    try:
        result = subprocess.run(
            ['git', 'remote', 'get-url', 'origin'],
            capture_output=True, text=True, check=True
        )
        url = result.stdout.strip()
        for name in PROJECT_MAP:
            if name in url:
                return name
    except Exception:
        pass
    return None

def get_current_project_id():
    try:
        with open('.vercel/project.json') as f:
            data = json.load(f)
            return data.get('projectId', '')
    except Exception:
        return None

def main():
    repo = get_repo_name()
    if not repo:
        print("❌ ERREUR: Impossible de détecter le repo (ni taka-inside ni solideat)")
        sys.exit(1)
    
    expected = PROJECT_MAP.get(repo)
    current = get_current_project_id()
    
    if not current:
        print(f"❌ ERREUR: .vercel/project.json introuvable ou invalide")
        sys.exit(1)
    
    if current != expected:
        print(f"❌ ERREUR GRAVE — RISQUE DE CONTAMINATION")
        print(f"   Repo détecté    : {repo}")
        print(f"   Project attendu : {expected}")
        print(f"   Project actuel  : {current}")
        print("")
        print(f"   Auto-correction en cours...")
        
        try:
            with open('.vercel/project.json', 'w') as f:
                json.dump({
                    'projectId': expected,
                    'orgId': 'team_2TiT1AA6anAkAK8mgnDthhah',
                    'projectName': 'frontend' if repo == 'taka-inside' else 'solideat'
                }, f, indent=2)
            print(f"   ✅ Corrigé → {expected}")
            print(f"   Relancez la commande de déploiement.")
        except Exception as e:
            print(f"   ❌ Échec de la correction: {e}")
        sys.exit(1)
    
    print(f"✅ Vérification OK — {repo} → {expected}")
    return 0

if __name__ == '__main__':
    sys.exit(main())
