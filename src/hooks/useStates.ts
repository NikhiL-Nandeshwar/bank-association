import { useEffect, useState } from 'react';
import { getStates } from '@/actions/api/master.actions';
import type { MasterOption } from '@/types/applicationSteps';
import { toMasterOptions } from '@/components/recruitment/helper/applicationStepsHelper';

export function useStates(countryId?: number) {
  const [stateOptions, setStateOptions] = useState<MasterOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadStates() {
      if (!countryId) {
        setStateOptions([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await getStates({
          countryId,
        }).catch(() => null);

        if (!isMounted) return;

        setStateOptions(
          toMasterOptions(response?.data),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadStates();

    return () => {
      isMounted = false;
    };
  }, [countryId]);

  return {
    stateOptions,
    isLoading,
  };
}