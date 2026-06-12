import { useEffect, useState } from 'react';
import { getDistricts } from '@/actions/api/master.actions';
import type { MasterOption } from '@/types/applicationSteps';
import { toMasterOptions } from '@/components/recruitment/helper/applicationStepsHelper';

export function useDistricts(stateId?: number) {
  const [districtOptions, setDistrictOptions] =
    useState<MasterOption[]>([]);

  const [isLoading, setIsLoading] =
    useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadDistricts() {
      if (!stateId) {
        setDistrictOptions([]);
        return;
      }

      setIsLoading(true);

      try {
        const response = await getDistricts({
          stateId,
        }).catch(() => null);

        if (!isMounted) return;

        setDistrictOptions(
          toMasterOptions(response?.data),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadDistricts();

    return () => {
      isMounted = false;
    };
  }, [stateId]);

  return {
    districtOptions,
    isLoading,
  };
}