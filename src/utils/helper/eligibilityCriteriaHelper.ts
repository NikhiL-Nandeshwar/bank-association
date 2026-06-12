import { EligibilityCriteria } from "@/types/api.types";

export function normalizeEligibilityCriteriaResponse(data: unknown): EligibilityCriteria[] {
  if (Array.isArray(data)) {
    return data;
  }

  if (data && typeof data === 'object') {
    const nested = data as {
      items?: unknown;
      eligibilityCriteria?: unknown;
      declarations?: unknown;
    };

    if (Array.isArray(nested.items)) {
      return nested.items as EligibilityCriteria[];
    }

    if (Array.isArray(nested.eligibilityCriteria)) {
      return nested.eligibilityCriteria as EligibilityCriteria[];
    }

    if (Array.isArray(nested.declarations)) {
      return nested.declarations.map((item) => {
        const declaration = item as Partial<EligibilityCriteria> & {
          criteriaId?: number;
          requiredDocumentType?: string;
          requiredDocument?: boolean;
        };

        return {
          criteriaType: declaration.criteriaType ?? '',
          criteriaValue: declaration.criteriaValue ?? '',
          groupTag: declaration.groupTag ?? '',
          isMandatory: Boolean(declaration.isMandatory),
          declarationEng: declaration.declarationEng ?? '',
          declarationMrt: declaration.declarationMrt ?? '',
          sortOrder: Number(declaration.sortOrder ?? 0),
        };
      });
    }
  }

  return [];
}