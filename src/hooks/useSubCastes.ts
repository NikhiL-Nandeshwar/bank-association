import { useEffect, useState } from 'react';
import { getSubCastes } from '@/actions/api/master.actions';
import type { MasterOption } from '@/types/applicationSteps';
import { toMasterOptions } from '@/components/recruitment/helper/applicationStepsHelper';

export function useSubCastes(casteId?: number) {
  const [subCasteOptions, setSubCasteOptions] =
    useState<MasterOption[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSubCastes() {
      if (!casteId) {
        setSubCasteOptions([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await getSubCastes({
          casteId,
        }).catch(() => null);

        if (!isMounted) return;

        setSubCasteOptions(
          toMasterOptions(response?.data),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadSubCastes();

    return () => {
      isMounted = false;
    };
  }, [casteId]);

  return {
    subCasteOptions,
    isLoading,
  };
}