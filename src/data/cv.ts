/**
 * Single source of truth for the landing content.
 *
 * Data consolidated from Braian's previous portfolio (bv-portfolio), his
 * LinkedIn profile and his GitHub account. Fields marked with `TODO(verify)`
 * could not be fully confirmed from those sources — fill/adjust them before
 * publishing rather than shipping guesses.
 *
 * Keeping content here (typed) means components stay dumb and the content can
 * be updated without touching markup.
 */

export interface SocialLink {
  /** Icon key resolved in components/Icon.astro. */
  key: 'github' | 'linkedin' | 'instagram' | 'email' | 'website';
  label: string;
  url: string;
  /** Shown next to the icon where useful (e.g. @handle). */
  handle?: string;
}

export interface ExperienceItem {
  role: string;
  company: string;  
  /** Path under /public (e.g. "/logos/globant.svg"). Monogram fallback when absent. */
  logo?: string;
}

/**
 * "Capacitaciones": formal education and certifications merged into a single
 * list — the section shows *where* Braian trained, so one entry per
 * institution/credential, newest first.
 */
export interface TrainingItem {
  institution: string;
  credential?: string; 
  /** Institution website, when known. */
  url?: string;
  /** Path under /public. Monogram fallback when absent. */
  logo?: string;
}

/**
 * Personal projects. Hand-authored (no GitHub API) so the section stays fast,
 * offline-safe and fully under editorial control — add/remove entries here.
 */
export interface ProjectItem {
  title: string;
  description?: string;
  /** GitHub repository URL. */
  url: string;
  /** Path under /public (e.g. "/logos/wine.svg"). Monogram fallback when absent. */
  logo?: string;
}

export interface SkillGroup {
  category: string;
  items: string[];
}

/** Sentinel for ongoing roles — kept as a constant to avoid magic strings. */
export const PRESENT = 'Presente';

export const profile = {
  name: 'Braian D. Vaylet',
  firstName: 'Braian',
  lastName: 'Vaylet',
  /** Short professional headline (also used in <title> and OG). */
  headline: 'Web UI Developer Senior',
  role: 'Web UI Developer Senior',
  company: 'Globant',
  location: 'Bahía Blanca, Buenos Aires, Argentina',
  email: 'braianvaylet@gmail.com',
  yearsOfExperience: 5,
  /** Availability signal for recruiters — flip to false when not looking. */
  openToWork: true,
  about: [
    "Desarrollador de Software con más de 6 años de experiencia creando productos digitales modernos, escalables y centrados en la experiencia del usuario. He colaborado con empresas y startups, desarrollando soluciones de alto impacto junto a equipos multidisciplinarios."
  ],
  social: [
    {
      key: 'github',
      label: 'GitHub',
      url: 'https://github.com/BraianVaylet',
      handle: '@BraianVaylet',
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      url: 'https://www.linkedin.com/in/braianvaylet',
      handle: 'in/braianvaylet',
    },
  ] satisfies SocialLink[],
} as const;

/**
 * Work experience, newest first. Dates mirror Braian's previous portfolio;
 * some overlap because agency/client roles ran in parallel.
 * TODO(verify): confirm the "Presente" roles are still current before publishing.
 * Company URLs only where unambiguous — never guessed.
 */
export const experience: ExperienceItem[] = [
  {
    role: 'Web UI Developer Senior',
    company: 'Globant',        
    logo: '/logos/globant.jpg',
  },
  {
    role: 'Full Stack Developer',
    company: 'Santander Argentina',        
    logo: '/logos/santander.jpg',
  },
  {
    role: 'Web Mobile Developer',
    company: 'Nera ex Galicia Agro',        
    logo: '/logos/nera.jpg',
  },
  {
    role: 'Frontend Developer & Referente Técnico',
    company: 'Telecom Argentina',            
    logo: '/logos/personal.jpg',
  },
  {
    role: 'React Tutor',
    company: 'Coderhouse',        
    logo: '/logos/coderhouse.jpg',
  },
  {
    role: 'React Developer',
    company: 'Sensie',
    logo: '/logos/sensie.jpg',
  },
  {
    role: 'Consultor Experimentado',    
    company: 'gA (Parabolt)',
    logo: '/logos/ga.jpg',
  },
  {
    role: 'Full Stack Developer',
    company: 'Eycon SA',    
    logo: '/logos/eycon.jpg',
  },
  {
    role: 'Full Stack Developer',
    company: 'Freelance',    
    logo: ""
  },
  {
    role: 'Full Stack Developer',
    company: 'NexoSmart',        
    logo: '/logos/nexosmart.jpg',
  },
];

/**
 * Capacitaciones, newest first. Cisco and Comunidad IT entries merge the
 * education + certification records from the previous portfolio (same
 * institution, one entry each).
 */
export const trainings: TrainingItem[] = [
  {
    institution: 'Universidad Nacional del Sur',    
    logo: "/logos/uns.jpg"
  },
  {
    institution: 'Universidad de Buenos Aires',    
    logo: "/logos/uba.jpg"
  },  
  {
    institution: 'Anthropic Academy',           
    logo: "/logos/anthropic.jpg"
  }, 
  {
    institution: 'Cognition/Devin Academy',    
    logo: "/logos/cognition.jpg"
  }, 
  {
    institution: 'DevTalles',    
    logo: "/logos/devtalles.jpg"
  }, 
  {
    institution: 'DeepLearning.ia',    
    logo: "/logos/deeplearning.jpg"
  }, 
  {
    institution: 'Globant Academy',    
    logo: "/logos/globant.jpg"
  }, 
  {
    institution: 'Udemy',
    logo: "/logos/udemy.jpg"
  }, 
  {
    institution: 'Big School',    
    logo: "/logos/bigschool.jpg"
  }, 
  {
    institution: 'KnowBe4',    
    logo: "/logos/knowbe.jpg"
  },
  {
    institution: 'Platzi',    
    logo: "/logos/platzi.jpg"
  },
  {
    institution: 'EducaciónIT',    
    logo: "/logos/educacionit.jpg"
  },
  {
    institution: 'buildspace',    
    logo: "/logos/buildspace.jpg"
  },
  {
    institution: 'Just JavaScript (Dan Abramov)',
    logo: ""
  },
  {
    institution: 'Coderhouse',    
    logo: "/logos/coderhouse.jpg"
  },
  {
    institution: 'Cisco Networking Academy',    
    logo: "/logos/cisco.jpg"
  },
  {
    institution: 'Comunidad IT',    
    logo: "/logos/comit.jpg"
  },
 
];

/**
 * Personal projects, newest first. Add a `logo` path (under /public) per entry
 * to replace the initials monogram fallback.
 */
export const projects: ProjectItem[] = [
  {
    title: 'BV Cross',
    description: "Web app para mi seguimiento de ejercicios, cargas y RMs en mis clases de CrossFit.",
    url: 'https://github.com/BraianVaylet/bv-cross',
    logo: "/logos/projects/bv-cross-512.png"
  },
  {
    title: 'BV Bow Sight',
    description: 'Web app para gestionar la mira de mi Arco Compuesto, me permite calcular distancias intermedias para diferentes sets de flechas.',
    url: 'https://github.com/BraianVaylet/bv-bow-sight',
    logo: "/logos/projects/bv-bow-sight-512.png"
  },
  {
    title: 'BV Easy Archery Battle',
    description: "Web app para la organizacion de torneos de arqueria amistosos (sala, aire libre, juego de campo y 3D).",
    url: 'https://github.com/BraianVaylet/bv-easy-archery-battle',
    logo: "/logos/projects/bv-easy-archery-battle.png"
  },
  {
    title: 'BV Personal Finances',
    description: "Web app para el seguimiento de nuestras finanzas personales, permite cargar ingresos, gastos, categorias y obtener estadisticas.",
    url: 'https://github.com/BraianVaylet/bv-personal-finances',
    logo: "/logos/projects/bv-personal-finances.png"
  },
  {
    title: 'BV My Investments',
    description: 'Web app para el seguimiento de nuestras inversiones.',
    url: 'https://github.com/BraianVaylet/bv-my-investments',
    logo: "/logos/projects/bv-my-investments.png"
  },
  {
    title: 'BV Wiki of Wine',
    description: 'Web app para registrar y calificar los vinos que compramos con mi pareja y recordar como era cada uno 🤣',
    url: 'https://github.com/BraianVaylet/bv-wiki-of-wine',
    logo: "/logos/projects/bv-wiki-of-wine.png"
  },
  {
    title: 'BV Medano UI',
    description: 'Sistema de diseño y librería de componentes propia utilizadas en mis proyectos.',
    url: 'https://github.com/BraianVaylet/bv-medano-ui',
    logo: "/logos/projects/bv-medano-ui.png"
  },  
];

/** Used for SEO keywords and the JSON-LD `knowsAbout` field. */
export const skillGroups: SkillGroup[] = [
  {
    category: 'Lenguajes',
    items: ['JavaScript', 'TypeScript', 'Solidity', 'HTML5', 'CSS3'],
  },
  {
    category: 'Frontend',
    items: [
      'React',
      'Next.js',
      'React Native',
      'Astro',
      'SCSS',
      'Styled Components',
      'Chakra UI',
    ],
  },
  {
    category: 'Backend & Data',
    items: ['Node.js', 'GraphQL', 'Firebase', 'MongoDB', 'MySQL', 'AWS'],
  },
  {
    category: 'Web3',
    items: ['Solidity', 'Smart Contracts', 'Ethereum', 'Web3'],
  },
  {
    category: 'Herramientas & Prácticas',
    items: ['Git', 'Docker', 'Jest', 'Metodologías Ágiles', 'Accesibilidad (WCAG)'],
  },
];
