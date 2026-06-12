import { useEffect, useState } from 'react';
import { getCastesByCategoryReligion } from '@/actions/api/master.actions';
import type { MasterOption } from '@/types/applicationSteps';
import { toMasterOptions } from '@/components/recruitment/helper/applicationStepsHelper';

export function useCastes(
  categoryId?: number,
  religionId?: number,
) {
  const [casteOptions, setCasteOptions] =
    useState<MasterOption[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadCastes() {
      if (!categoryId || !religionId) {
        setCasteOptions([]);
        return;
      }

      setIsLoading(true);

      try {
        const response =
          await getCastesByCategoryReligion({
            categoryId,
            religionId,
          }).catch(() => null);

        if (!isMounted) return;

        setCasteOptions(
          toMasterOptions(response?.data),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCastes();

    return () => {
      isMounted = false;
    };
  }, [categoryId, religionId]);

  return {
    casteOptions,
    isLoading,
  };
}