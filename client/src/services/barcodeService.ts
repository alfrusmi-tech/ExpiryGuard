
export interface BarcodeProduct {
  id: string;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: string;
  reorderLevel: number;
}

interface ApiBarcodeProduct {
  id: number;
  name: string;
  sku: string;
  barcode: string | null;
  categoryId: number;
  reorderLevel: number;
}

export const barcodeService = {

  async findByCode(
    code: string
  ): Promise<BarcodeProduct | null> {

    const cleanCode = code.trim();

    // Only simple barcodes and SKUs in this version.
    // Structured GS1/QR payloads need separate parsing.
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(cleanCode)) {
      throw new Error(
        'Unsupported code format. Use manual entry for structured QR/GS1 codes.'
      );
    }

    const response = await fetch(
      `/api/products/lookup?code=${encodeURIComponent(cleanCode)}`,
      {
        credentials: 'same-origin'
      }
    );

    if (response.status === 404) {
      return null;
    }

    if (response.status === 401) {
      throw new Error('Please log in again');
    }

    if (response.status === 403) {
      throw new Error(
        'You do not have permission to search products'
      );
    }

    if (!response.ok) {
      throw new Error(
        `Barcode lookup failed: HTTP ${response.status}`
      );
    }

    const product: ApiBarcodeProduct =
      await response.json();

    return {
      id: String(product.id),
      name: product.name,
      sku: product.sku,
      barcode: product.barcode,
      categoryId: String(product.categoryId),
      reorderLevel: product.reorderLevel
    };
  }
};
