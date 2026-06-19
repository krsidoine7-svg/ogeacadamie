# DB_SCHEMA.md
## OGE Académie — Schéma Base de Données Supabase

---

## Script SQL complet

```sql
-- =============================================
-- EXTENSIONS
-- =============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- ENUM TYPES
-- =============================================
CREATE TYPE user_role AS ENUM ('user', 'manager_zone', 'admin', 'super_admin');
CREATE TYPE zone_name AS ENUM ('yamoussoukro', 'yopougon', 'abobo', 'cocody', 'port-bouet', 'bouake');
CREATE TYPE mode_formation AS ENUM ('presentiel', 'en_ligne');
CREATE TYPE concours_type AS ENUM ('inphb', 'esatic', 'cme');
CREATE TYPE paiement_statut AS ENUM ('en_attente', 'en_cours', 'valide', 'rejete');
CREATE TYPE document_type AS ENUM ('cours', 'exercice', 'corrige');
CREATE TYPE notif_type AS ENUM ('info', 'alerte', 'cours');

-- =============================================
-- TABLE PROFILES
-- =============================================
CREATE TABLE profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nom             text NOT NULL,
  prenom          text NOT NULL,
  email           text UNIQUE NOT NULL,
  whatsapp        text,
  serie_bac       text,
  zone            zone_name,
  mode_formation  mode_formation,
  role            user_role DEFAULT 'user',
  is_active       boolean DEFAULT false,
  avatar_url      text,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  deleted_at      timestamptz  -- soft delete
);

CREATE INDEX idx_profiles_zone   ON profiles(zone)   WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_role   ON profiles(role)   WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_active ON profiles(is_active) WHERE deleted_at IS NULL;

-- =============================================
-- TABLE CONCOURS INSCRITS
-- =============================================
CREATE TABLE concours_inscrits (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  concours    concours_type NOT NULL,
  created_at  timestamptz DEFAULT now(),
  deleted_at  timestamptz,
  UNIQUE(user_id, concours)
);

CREATE INDEX idx_concours_user ON concours_inscrits(user_id) WHERE deleted_at IS NULL;

-- =============================================
-- TABLE PAIEMENTS
-- =============================================
CREATE TABLE paiements (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  zone          zone_name NOT NULL,
  montant       integer DEFAULT 15000,
  statut        paiement_statut DEFAULT 'en_attente',
  capture_url   text,
  valide_par    uuid REFERENCES profiles(id),
  valide_at     timestamptz,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX idx_paiements_statut  ON paiements(statut)  WHERE deleted_at IS NULL;
CREATE INDEX idx_paiements_zone    ON paiements(zone)    WHERE deleted_at IS NULL;
CREATE INDEX idx_paiements_user    ON paiements(user_id) WHERE deleted_at IS NULL;

-- =============================================
-- TABLE DOCUMENTS
-- =============================================
CREATE TABLE documents (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre         text NOT NULL,
  description   text,
  fichier_url   text,
  concours      text DEFAULT 'tous',  -- inphb, esatic, cme, tous
  type          document_type DEFAULT 'cours',
  ordre         integer DEFAULT 0,
  is_active     boolean DEFAULT true,
  created_by    uuid REFERENCES profiles(id),
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX idx_documents_concours ON documents(concours) WHERE deleted_at IS NULL AND is_active = true;

-- =============================================
-- TABLE ACCES DOCUMENTS
-- =============================================
CREATE TABLE acces_documents (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  document_id   uuid NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, document_id)
);

-- =============================================
-- TABLE NOTIFICATIONS
-- =============================================
CREATE TABLE notifications (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  destinataire_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  titre           text NOT NULL,
  message         text NOT NULL,
  type            notif_type DEFAULT 'info',
  lu              boolean DEFAULT false,
  lien            text,
  created_at      timestamptz DEFAULT now(),
  deleted_at      timestamptz
);

CREATE INDEX idx_notifs_user ON notifications(destinataire_id, lu) WHERE deleted_at IS NULL;

-- =============================================
-- TABLE BLOG ARTICLES
-- =============================================
CREATE TABLE blog_articles (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  titre         text NOT NULL,
  slug          text UNIQUE NOT NULL,
  contenu       text,
  extrait       text,
  image_url     text,
  concours      text DEFAULT 'general',
  auteur_id     uuid REFERENCES profiles(id),
  is_published  boolean DEFAULT false,
  published_at  timestamptz,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  deleted_at    timestamptz
);

CREATE INDEX idx_blog_published ON blog_articles(is_published, published_at) WHERE deleted_at IS NULL;

-- =============================================
-- TABLE PAGE SECTIONS (CMS)
-- =============================================
CREATE TABLE page_sections (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  cle         text UNIQUE NOT NULL,  -- hero, historique, formation, resultats, temoignages
  titre       text,
  contenu     jsonb DEFAULT '{}',
  ordre       integer DEFAULT 0,
  is_active   boolean DEFAULT true,
  updated_at  timestamptz DEFAULT now()
);

-- Données initiales
INSERT INTO page_sections (cle, titre, ordre, is_active) VALUES
  ('hero',         'Section Héro',          1, true),
  ('historique',   'Notre Histoire',         2, true),
  ('formation',    'Nos Formations',         3, true),
  ('resultats',    'Nos Résultats',          4, true),
  ('temoignages',  'Témoignages',            5, true),
  ('inscription',  'Section Inscription',   6, true),
  ('footer',       'Pied de page',          7, true);

-- =============================================
-- TABLE ZONE CONFIG
-- =============================================
CREATE TABLE zone_config (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone        zone_name UNIQUE NOT NULL,
  manager_id  uuid REFERENCES profiles(id),
  lien_wave   text,
  lien_momo   text,
  adresse     text,
  telephone   text,
  updated_at  timestamptz DEFAULT now()
);

-- Zones initiales
INSERT INTO zone_config (zone) VALUES
  ('yamoussoukro'),
  ('yopougon'),
  ('abobo'),
  ('cocody'),
  ('port-bouet'),
  ('bouake');

-- =============================================
-- TABLE TEMOIGNAGES
-- =============================================
CREATE TABLE temoignages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom         text NOT NULL,
  prenom      text,
  zone        zone_name,
  concours    concours_type,
  message     text NOT NULL,
  note        integer DEFAULT 5,
  photo_url   text,
  is_active   boolean DEFAULT true,
  created_at  timestamptz DEFAULT now(),
  deleted_at  timestamptz
);

-- =============================================
-- TRIGGERS — updated_at automatique
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_paiements_updated_at
  BEFORE UPDATE ON paiements
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Activer RLS sur toutes les tables
ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE concours_inscrits ENABLE ROW LEVEL SECURITY;
ALTER TABLE paiements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE temoignages       ENABLE ROW LEVEL SECURITY;

-- Profiles : chaque user voit seulement son profil
CREATE POLICY "user_own_profile" ON profiles
  FOR ALL USING (auth.uid() = id AND deleted_at IS NULL);

-- Profiles : admin voit tout
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p 
      WHERE p.id = auth.uid() 
      AND p.role IN ('admin', 'super_admin')
      AND p.deleted_at IS NULL
    )
  );

-- Paiements : user voit son paiement
CREATE POLICY "user_own_paiement" ON paiements
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Paiements : manager voit sa zone
CREATE POLICY "manager_zone_paiements" ON paiements
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      JOIN zone_config zc ON zc.manager_id = p.id
      WHERE p.id = auth.uid()
      AND zc.zone = paiements.zone
    )
  );

-- Documents : accessibles aux users actifs avec paiement validé
CREATE POLICY "user_active_documents" ON documents
  FOR SELECT USING (
    is_active = true
    AND deleted_at IS NULL
    AND EXISTS (
      SELECT 1 FROM profiles p
      JOIN paiements pay ON pay.user_id = p.id
      WHERE p.id = auth.uid()
      AND p.is_active = true
      AND pay.statut = 'valide'
    )
  );

-- =============================================
-- AUTOMATIC PROFILE CREATION TRIGGER
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, nom, prenom, email, role, is_active)
  VALUES (
    new.id,
    coalesce(new.raw_user_meta_data->>'nom', ''),
    coalesce(new.raw_user_meta_data->>'prenom', ''),
    new.email,
    'user'::user_role,
    false
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```
