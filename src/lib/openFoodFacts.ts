export interface BarcodeScanResult {
  name: string
  brand?: string
  calories: number
  proteinG: number
  carbsG: number
  fatG: number
  notes: string
}

interface OpenFoodFactsProduct {
  product_name?: string
  product_name_en?: string
  brands?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    proteins_100g?: number
    carbohydrates_100g?: number
    fat_100g?: number
  }
}

/**
 * Looks up a product by barcode on Open Food Facts — a free, public,
 * community-maintained food database (no API key required). Values
 * returned are per 100g of product, since that's what the database stores;
 * the caller should make that clear to the person, since a barcode alone
 * doesn't tell us how much of the product they're actually eating.
 */
export async function lookupBarcode(barcode: string): Promise<BarcodeScanResult> {
  let res: Response
  try {
    res = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,product_name_en,brands,nutriments`,
    )
  } catch {
    throw new Error('Network error — check your connection and try again.')
  }

  if (!res.ok) {
    throw new Error('Could not reach the product database. Please try again.')
  }

  const data = (await res.json()) as { status: number; product?: OpenFoodFactsProduct }

  if (data.status !== 1 || !data.product) {
    throw new Error("No product found for that barcode. You can still add the meal manually.")
  }

  const p = data.product
  const n = p.nutriments ?? {}
  const name = p.product_name_en || p.product_name
  if (!name) {
    throw new Error('That product has no name on file — add this meal manually instead.')
  }

  return {
    name,
    brand: p.brands,
    calories: Math.max(0, Math.round(n['energy-kcal_100g'] ?? 0)),
    proteinG: Math.max(0, Math.round(n.proteins_100g ?? 0)),
    carbsG: Math.max(0, Math.round(n.carbohydrates_100g ?? 0)),
    fatG: Math.max(0, Math.round(n.fat_100g ?? 0)),
    notes: 'Values per 100g from Open Food Facts — adjust the numbers below for your actual portion.',
  }
}
