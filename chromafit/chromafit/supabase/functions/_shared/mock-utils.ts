/**
 * Deterministic seeded random number generator
 * Based on the simple Linear Congruential Generator
 */
export class SeededRandom {
  private seed: number

  constructor(seed: number) {
    this.seed = seed
  }

  next(): number {
    this.seed = (this.seed * 1664525 + 1013904223) % 2**32
    return this.seed / 2**32
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min
  }

  nextFloat(min: number, max: number): number {
    return this.next() * (max - min) + min
  }

  choice<T>(array: T[]): T {
    return array[Math.floor(this.next() * array.length)]
  }
}

/**
 * Generate a deterministic embedding based on a seed string
 */
export function generateMockEmbedding(seed: string, dimensions: number = 768): number[] {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = new SeededRandom(hash)
  
  const embedding: number[] = []
  for (let i = 0; i < dimensions; i++) {
    embedding.push(random.nextFloat(-1, 1))
  }
  
  // Normalize the vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0))
  return embedding.map(val => val / magnitude)
}

/**
 * Generate mock SMPL parameters based on body metrics
 */
export function generateMockSMPLParams(bodyMetrics: any, seed: string): any {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = new SeededRandom(hash)
  
  // Generate 10 shape parameters (body shape variations)
  const shape = Array.from({ length: 10 }, () => random.nextFloat(-2, 2))
  
  // Generate 72 pose parameters (3 per joint, 24 joints)
  const pose = Array.from({ length: 72 }, () => random.nextFloat(-0.1, 0.1))
  
  return {
    shape,
    pose
  }
}

/**
 * Generate mock garment measurements based on category
 */
export function generateMockMeasurements(category: string, seed: string): any {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = new SeededRandom(hash)
  
  const baseMeasurements = {
    't-shirt': {
      chest: random.nextFloat(85, 105),
      length: random.nextFloat(60, 75),
      sleeve_length: random.nextFloat(20, 25)
    },
    'jeans': {
      waist: random.nextFloat(70, 85),
      hips: random.nextFloat(90, 110),
      inseam: random.nextFloat(75, 85)
    },
    'dress': {
      chest: random.nextFloat(80, 100),
      waist: random.nextFloat(65, 80),
      hips: random.nextFloat(85, 105),
      length: random.nextFloat(90, 120)
    },
    'shirt': {
      chest: random.nextFloat(90, 110),
      length: random.nextFloat(70, 80),
      sleeve_length: random.nextFloat(55, 65)
    },
    'pants': {
      waist: random.nextFloat(70, 90),
      hips: random.nextFloat(90, 115),
      inseam: random.nextFloat(75, 85)
    },
    'shorts': {
      waist: random.nextFloat(70, 85),
      hips: random.nextFloat(90, 110),
      length: random.nextFloat(40, 50)
    },
    'jacket': {
      chest: random.nextFloat(95, 115),
      length: random.nextFloat(65, 75),
      sleeve_length: random.nextFloat(55, 65)
    },
    'sweater': {
      chest: random.nextFloat(90, 110),
      length: random.nextFloat(60, 75),
      sleeve_length: random.nextFloat(55, 65)
    },
    'skirt': {
      waist: random.nextFloat(65, 80),
      hips: random.nextFloat(85, 105),
      length: random.nextFloat(40, 80)
    },
    'shoes': {
      length: random.nextFloat(25, 30)
    },
    'accessories': {}
  }
  
  const measurements = baseMeasurements[category as keyof typeof baseMeasurements] || {}
  return {
    ...measurements,
    unit: 'cm'
  }
}

/**
 * Generate mock fit score and explanation
 */
export function generateMockFitScore(seed: string): { fitScore: number; explanation: any } {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = new SeededRandom(hash)
  
  const fitScore = random.nextFloat(0.65, 0.95)
  
  const explanations = [
    {
      fit: "The garment fits well around your body type with appropriate sizing.",
      style: "The style complements your proportions and personal aesthetic.",
      comfort: "The fabric and cut provide good comfort and freedom of movement."
    },
    {
      fit: "Good overall fit with minor adjustments needed in the waist area.",
      style: "The silhouette works well with your body shape and style preferences.",
      comfort: "Comfortable fit with breathable fabric and appropriate looseness."
    },
    {
      fit: "Excellent fit that follows your natural body contours perfectly.",
      style: "This piece enhances your style and creates a flattering silhouette.",
      comfort: "Very comfortable with excellent range of motion and soft fabric."
    }
  ]
  
  const explanation = random.choice(explanations)
  
  return { fitScore, explanation }
}

/**
 * Generate mock garment category based on image URL
 */
export function generateMockCategory(imageUrl: string): string {
  const categories = ['t-shirt', 'jeans', 'dress', 'shirt', 'pants', 'shorts', 'jacket', 'sweater', 'skirt', 'shoes', 'accessories']
  const hash = imageUrl.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const random = new SeededRandom(hash)
  return random.choice(categories)
}
