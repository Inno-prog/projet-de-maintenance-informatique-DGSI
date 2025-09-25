export interface Contrat {
  id?: number;
  idContrat: string;
  typeContrat: string;
  dateDebut: string;
  dateFin: string;
  nomPrestataire: string;
  montant: number;
  prestataireId?: number;
}

export interface OrdreCommande {
  id?: number;
  numeroCommande: string;
  idOC?: string;
  nomItem: string;
  minArticles: number;
  maxArticles: number;
  nombreArticlesUtilise: number;
  ecartArticles: number;
  trimestre: string;
  prestataireItem: string;
  montant: number;
  description?: string;
  dateCreation?: string;
  statut: StatutCommande;
  contratId?: number;
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

export interface DemandeIntervention {
  id?: number;
  idDemande: string;
  dateDemande: string;
  prestataireNom: string;
  prestataireContact: string;
  objet: string;
  description: string;
  categorie: string;
  statut: StatutDemande;
  technicienAssigne?: string;
  fichiersContrat?: string;
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
}

export enum StatutFiche {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  VALIDER = 'VALIDER',
  REJETER = 'REJETER'
}

export enum StatutDemande {
  SOUMISE = 'SOUMISE',
  EN_COURS = 'EN_COURS',
  TERMINEE = 'TERMINEE',
  ANNULEE = 'ANNULEE'
}

export interface Item {
  id?: number;
  codeItem: string;
  libelle: string;
  type: TypeItem;
  prix: number;
  ordreCommandeId?: number;
}

export enum TypeItem {
  MATERIEL = 'MATERIEL',
  SERVICE = 'SERVICE',
  LOGICIEL = 'LOGICIEL'
}