
import { KnowledgeEntry } from '../types';

export const LEGAL_GLOSSARY: KnowledgeEntry[] = [
  {
    term: "Communauté réduite aux acquêts",
    definition: "Le régime légal par défaut. Tout ce qui est acheté pendant le mariage appartient aux deux. Ce qui est possédé avant ou reçu par héritage reste un bien propre.",
    category: "Civil",
    lawReference: "Code Civil Art. 1401"
  },
  {
    term: "Communauté Universelle",
    definition: "Tous les biens (propres ou communs) sont mis en commun. Souvent assorti d'une clause d'attribution intégrale pour protéger le conjoint survivant.",
    category: "Civil",
    lawReference: "Code Civil Art. 1526"
  },
  {
    term: "Participation aux acquêts",
    definition: "Hybride : fonctionne comme une séparation de biens pendant le mariage, mais au divorce ou au décès, on calcule l'enrichissement de chacun pour le partager.",
    category: "Civil",
    lawReference: "Code Civil Art. 1569"
  },
  {
    term: "Séparation de biens",
    definition: "Chacun reste propriétaire de ce qu'il achète et de ses revenus. Idéal pour les entrepreneurs afin de protéger le patrimoine familial des risques pro.",
    category: "Civil",
    lawReference: "Code Civil Art. 1536"
  },
  {
    term: "PACS (Indivision)",
    definition: "Les biens acquis pendant le PACS sont réputés appartenir pour moitié à chacun, quel que soit le financement réel.",
    category: "Civil",
    lawReference: "Code Civil Art. 515-5-1"
  },
  {
    term: "Contrat de Capitalisation démembré",
    definition: "Contrairement à l'assurance-vie, le contrat de capitalisation est un produit de droit commun qui peut être transmis par donation. Le démembrement permet de donner la nue-propriété du contrat tout en conservant l'usufruit pour percevoir les revenus ou procéder à des rachats partiels.",
    example: "Vous avez 65 ans et un contrat de 200 000 € (dont 50 000 € de plus-values). 1. À la donation : La valeur de la nue-propriété est de 60% (Art. 669 CGI), soit 120 000 €. Vous ne payez des droits que sur cette base. Les plus-values latentes sont 'purgées' fiscalement pour les donataires. 2. Au décès : Vos enfants récupèrent la pleine propriété automatiquement. La valeur du contrat (ex: 250 000 €) leur revient sans aucun droit de succession supplémentaire.",
    category: "Fiscal",
    lawReference: "CGI Art. 757"
  },
  {
    term: "Clause Bénéficiaire Démembrée",
    definition: "Stratégie d'assurance-vie où, au décès de l'assuré, le capital est séparé : le conjoint reçoit l'usufruit (quasi-usufruit) et les enfants la nue-propriété (créance de restitution).",
    example: "Au décès de l'assuré, le capital de 400 000 € est versé au conjoint survivant. Fiscalement, l'abattement de 152 500 € est partagé entre l'usufruitier et les nus-propriétaires. Le conjoint (usufruitier) peut utiliser l'intégralité des 400 000 €. Au décès du conjoint, les enfants font valoir leur 'créance de restitution' sur sa succession.",
    category: "Civil"
  },
  {
    term: "Quasi-usufruit",
    definition: "Droit d'usufruit portant sur des choses consomptibles (argent). L'usufruitier peut disposer des fonds librement à charge de rendre une somme équivalente à la fin de l'usufruit.",
    category: "Civil",
    lawReference: "Code Civil Art. 587"
  }
];
