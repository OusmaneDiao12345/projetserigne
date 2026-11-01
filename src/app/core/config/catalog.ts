import { ServicePlan } from '../models/plan.model';

export const SERVICE_PLANS: ServicePlan[] = [
  {
    id: 'adhesion',
    title: 'Adhésion membre',
    price: 5000,
    currency: 'XOF',
    subtitle: 'Un accès membre à la plateforme GRF CONSULTING',
    features: ['Accès à votre espace membre', 'Questions juridiques incluses pendant un an', 'Carte de membre valable un an'],
    recommended: true,
    grantsAccess: true,
    responseSlaHours: null
  },
  {
    id: 'ia',
    title: 'Réponse rapide',
    price: 1000,
    currency: 'XOF',
    subtitle: 'Posez une question sans adhérer et recevez une réponse après paiement',
    features: ['Sans compte ni adhésion', '1 000 FCFA par question', 'Réponse après confirmation du paiement'],
    grantsAccess: false,
    responseSlaHours: 0
  },
];

export const LEGAL_DOMAINS = [
  { slug: 'travail', title: 'Droit du travail', detail: 'Contrats, licenciement, congés, sécurité sociale', icon: 'briefcase' },
  { slug: 'foncier', title: 'Droit foncier', detail: 'Propriété, bail, occupation des terres', icon: 'landmark' },
  { slug: 'affaires', title: 'Droit des affaires', detail: "Création d'entreprise, contrats commerciaux, fiscalité", icon: 'building' },
  { slug: 'famille', title: 'Droit de la famille', detail: 'Mariage, divorce, succession, filiation', icon: 'users' },
  { slug: 'civil', title: 'Droit civil', detail: 'Obligations, responsabilité, contrats', icon: 'scale' },
  { slug: 'penal', title: 'Droit pénal', detail: 'Infractions, procédure, droits de la défense', icon: 'shield' },
  { slug: 'administratif', title: 'Droit administratif', detail: 'Actes administratifs, recours, service public', icon: 'file' }
] as const;

export const FAQS = [
  {
    q: 'Quels domaines du droit sont couverts par GRF CONSULTING ?',
    a: "GRF CONSULTING couvre l'ensemble des principaux domaines du droit sénégalais : droit du travail, droit foncier, droit des affaires, droit de la famille, droit civil, droit pénal et droit administratif."
  },
  {
    q: 'Combien de temps faut-il pour obtenir une réponse ?',
    a: "Notre assistant IA fournit une réponse immédiate. Pour les questions soumises via le formulaire de soumission de dossier, nous garantissons une réponse sous 24 heures."
  },
  {
    q: 'Est-ce que GRF CONSULTING remplace un avocat ?',
    a: "Non. GRF CONSULTING ne se substitue pas aux avocats, notaires, huissiers ou autres professionnels habilités lorsque leur intervention est légalement nécessaire. Notre rôle est de faciliter le premier accès à l'information et à l'orientation juridique, et de vous orienter vers un professionnel lorsque la situation l'exige."
  },
  {
    q: 'Mes informations sont-elles confidentielles ?',
    a: "Oui. La confidentialité est l'une de nos valeurs fondamentales. Vos questions et documents sont traités en toute confidentialité."
  },
  {
    q: "Comment fonctionne la soumission d'un dossier ?",
    a: "Vous soumettez votre problématique via notre formulaire en ligne, en fournissant les informations nécessaires et optionnellement des documents. Nous analysons votre situation et vous fournissons une réponse ou une orientation adaptée dans un délai de 24 heures."
  },
  {
    q: 'Quels types de documents puis-je joindre ?',
    a: 'Vous pouvez joindre tout document pertinent pour votre situation : contrats, courriers, décisions, actes, etc. Les formats courants (PDF, images, documents) sont acceptés.'
  }
];

export const VALUES = [
  {
    title: 'ACCESSIBILITÉ',
    text: 'Une information juridique claire, à un coût accessible, sans déplacement. Le droit à la portée de tous.',
    icon: 'scale'
  },
  {
    title: 'RAPIDITÉ',
    text: 'Une réponse ou orientation dans des délais courts. Garantie de réponse sous 24h pour les dossiers soumis.',
    icon: 'bolt'
  },
  {
    title: 'CONFIDENTIALITÉ',
    text: 'Vos questions et documents traités en toute confidentialité. Vos données sont protégées.',
    icon: 'shield'
  }
];
