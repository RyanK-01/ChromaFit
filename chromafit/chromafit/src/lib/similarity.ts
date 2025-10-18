/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) {
    return 0
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Calculate style similarity between two outfits
 */
export function calculateStyleSimilarity(
  outfitEmbedding1: number[],
  outfitEmbedding2: number[]
): number {
  const similarity = cosineSimilarity(outfitEmbedding1, outfitEmbedding2)
  // Convert to percentage and ensure it's between 0 and 1
  return Math.max(0, Math.min(1, (similarity + 1) / 2))
}

/**
 * Sort outfits by similarity to a reference outfit
 */
export function sortBySimilarity<T extends { outfit_embedding: number[] | null }>(
  outfits: T[],
  referenceEmbedding: number[]
): Array<T & { similarity_score: number }> {
  return outfits
    .filter(outfit => outfit.outfit_embedding !== null)
    .map(outfit => ({
      ...outfit,
      similarity_score: calculateStyleSimilarity(
        outfit.outfit_embedding!,
        referenceEmbedding
      )
    }))
    .sort((a, b) => b.similarity_score - a.similarity_score)
}
