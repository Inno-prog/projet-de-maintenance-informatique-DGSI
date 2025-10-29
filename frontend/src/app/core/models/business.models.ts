export interface Contrat {
  id?: number;
  idContrat: string;
  typeContrat: string;
  dateDebut: string;
  dateFin: string;
  nomPrestataire: string;
  montant: number;
  statut: StatutContrat;
  prestataireId?: number;
}

export enum StatutContrat {
  ACTIF = 'ACTIF',
  SUSPENDU = 'SUSPENDU',
  TERMINE = 'TERMINE',
  EXPIRE = 'EXPIRE'
}

export interface OrdreCommande {
  // Required attributes (as requested)
  idOC: string;
  numeroOc?: string;
  max_prestations?: number;
  min_prestations?: number;
  prixUnitPrest?: number;
  montantOC?: number;
  statut: StatutCommande;
  observations?: string;

  // Relations
  prestations?: Prestation[];
  item?: Item;
  items?: Item[];

  // Optional helpers and legacy fields (kept for compatibility)
  id?: number;
  numeroCommande?: string;
  nomItem?: string;
  minArticles?: number;
  maxArticles?: number;
  nombreArticlesUtilise?: number;
  ecartArticles?: number;
  trimestre?: string;
  prestataireItem?: string;
  montant?: number;
  description?: string;
  dateCreation?: string;
  contratId?: number;
  penalites?: number;
}

// Shared business helper functions for OrdreCommande
export function calculer_ecart_item(ordre: OrdreCommande): number {
  if (ordre.prestations && ordre.prestations.length > 0) {
    const realized = ordre.prestations.length;
    const max = ordre.items && ordre.items.length > 0 ?
      Math.max(...ordre.items.map(item => item.quantiteMaxTrimestre || 0)) :
      ordre.max_prestations ?? ordre.maxArticles ?? realized;
    return Math.max(0, max - realized);
  }
  const max = ordre.max_prestations ?? ordre.maxArticles ?? 0;
  const used = ordre.nombreArticlesUtilise ?? 0;
  return Math.max(0, max - used);
}

export function calcul_montantTotal(ordre: OrdreCommande): number {
  if (ordre.prestations && ordre.prestations.length > 0) {
    return ordre.prestations.reduce((sum, p) => sum + (p.montantPrest || 0), 0);
  }
  if (typeof ordre.montantOC === 'number') return ordre.montantOC;
  const qty = ordre.max_prestations ?? ordre.maxArticles ?? 0;
  const prix = ordre.prixUnitPrest ?? ordre.montant ?? 0;
  return qty * prix;
}

export function calcul_penalite(ordre: OrdreCommande): number {
  if (ordre.prestations && ordre.prestations.length > 0) {
    const realizedAmount = ordre.prestations.reduce((sum, p) => sum + (p.montantPrest || 0), 0);
    const maxAmount = ordre.items && ordre.items.length > 0 ?
      ordre.items.reduce((sum, item) => sum + ((item.quantiteMaxTrimestre || 0) * (item.prix || 0)), 0) : 0;
    return Math.max(0, maxAmount - realizedAmount);
  }
  const ecart = calculer_ecart_item(ordre);
  const prix = ordre.prixUnitPrest ?? ordre.montant ?? 0;
  // Default penalty rule: 10% of unit price per missing prestation
  const penalite = Math.max(0, ecart) * prix * 0.1;
  return Math.round(penalite);
}

export enum StatutCommande {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  NON_APPROUVE = 'NON_APPROUVE',
  REJETE = 'REJETE',
  EN_COURS = 'EN_COURS',
  TERMINE = 'TERMINE'
}

export interface EvaluationTrimestrielle {
  id?: number;
  sessionId?: number;
  trimestre: string;
  lot: string;
  prestataireNom: string;
  dateEvaluation: string;
  evaluateurNom: string;
  correspondantId: number;
  techniciensListe?: string;
  techniciensCertifies?: boolean;
  rapportInterventionTransmis?: boolean;
  registreRempli?: boolean;
  horairesRespectes?: boolean;
  delaiReactionRespecte?: boolean;
  delaiInterventionRespecte?: boolean;
  vehiculeDisponible?: boolean;
  tenueDisponible?: boolean;
  obsTechniciens?: string;
  obsRapport?: string;
  obsRegistre?: string;
  obsHoraires?: string;
  obsDelaiReaction?: string;
  obsDelaiIntervention?: string;
  obsVehicule?: string;
  obsTenue?: string;
  prestationsVerifiees?: string;
  instancesNonResolues?: string;
  observationsGenerales?: string;
  appreciationRepresentant?: string;
  signatureRepresentant?: string;
  signatureEvaluateur?: string;
  preuves?: string;
  statut: string;
  penalitesCalcul?: number;
  noteFinale?: number;
  prestataireDeclasse?: boolean;
  dateCreation?: string;
  dateModification?: string;
  utilisateurCreation?: number;
  utilisateurModification?: number;
  fichierPdf?: string;
}

export enum Trimestre {
  T1 = 'T1',
  T2 = 'T2',
  T3 = 'T3',
  T4 = 'T4'
}


export interface PrestationItem {
  id?: number;
  numero: string;
  prestation: string;
  minArticles: number;
  maxArticles: number;
  prixUnitaire: number;
}

export interface FichePrestation {
  id?: number;
  idPrestation: string;
  nomPrestataire: string;
  nomItem: string;
  dateRealisation: string;
  statut: StatutFiche;
  quantite: number;
  commentaire?: string;
  fichiersContrat?: string;
  ordreCommande?: {
    id: number;
    numeroCommande: string;
    statut: StatutCommande;
  };
}

export enum StatutFiche {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  VALIDER = 'VALIDER',
  REJETER = 'REJETER'
}


export interface Item {
    id?: number;
    idItem?: number;
    nomItem: string;
    description?: string;
    prix: number;
    qteEquipDefini: number;
    quantiteMaxTrimestre: number;
  }

export interface Equipement {
  id?: number;
  nomEquipement: string;
  description?: string;
  typeEquipement: string;
  prixUnitaire: number;
  quantiteDisponible: number;
  statut: string;
  prestations?: Prestation[];
}

export interface TypeItem {
  id?: number;
  numero: string;
  prestation: string;
  minArticles: number;
  maxArticles: number;
  prixUnitaire: number;
  oc1Quantity?: number;
}

export interface Prestation {
  id?: number;
  nomPrestataire: string;
  nomPrestation: string;
  montantPrest: number;
  equipementsUtilises: Equipement[];
  quantiteItem?: number; // Kept for backward compatibility
  nbPrestRealise: number;
  trimestre: string;
  dateDebut: string;
  dateFin: string;
  statut: string;
  description?: string;
  ordreCommande?: OrdreCommande;
}

export interface RapportSuivi {
  id?: number;
  ordreCommandeId?: number;
  ordreCommande?: OrdreCommande;
  dateRapport: string;
  trimestre: string;
  prestataire: string;
  prestationsRealisees: number;
  observations?: string;
  statut: StatutRapport;
  dateCreation?: string;
  dateModification?: string;
}

export enum StatutRapport {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE'
}
