import { useEffect, useState } from 'react';
import { getTalukas } from '@/actions/api/master.actions';
import type { MasterOption } from '@/types/applicationSteps';
import { toMasterOptions } from '@/components/recruitment/helper/applicationStepsHelper';

export function useTalukas(
  districtId?: number,
  stateId?: number,
) {
  const [talukaOptions, setTalukaOptions] =
    useState<MasterOption[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadTalukas() {
      if (!districtId) {
        setTalukaOptions([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await getTalukas({
          districtId,
          stateId,
        }).catch(() => null);

        if (!isMounted) return;

        setTalukaOptions(
          toMasterOptions(response?.data),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadTalukas();

    return () => {
      isMounted = false;
    };
  }, [districtId, stateId]);

  return {
    talukaOptions,
    isLoading,
  };
}