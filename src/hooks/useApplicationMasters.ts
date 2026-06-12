import { useEffect, useState } from 'react';

import {
  getCategories,
  getCountries,
  getReligions,
} from '@/actions/api/master.actions';

import type { MasterOption } from '@/types/applicationSteps';
import { toCategoryOptions, toMasterOptions, toReligionOptions } from '@/components/recruitment/helper/applicationStepsHelper';

export function useApplicationMasters() {
  const [categoryOptions, setCategoryOptions] = useState<MasterOption[]>([]);
  const [religionOptions, setReligionOptions] = useState<MasterOption[]>([]);
  const [countryOptions, setCountryOptions] = useState<MasterOption[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMasters() {
      setIsLoading(true);

      try {
        const [
          categoriesResponse,
          religionsResponse,
          countriesResponse,
        ] = await Promise.all([
          getCategories().catch(() => null),
          getReligions().catch(() => null),
          getCountries().catch(() => null),
        ]);

        if (!isMounted) {
          return;
        }

        setCategoryOptions(
          toCategoryOptions(categoriesResponse?.data),
        );

        setReligionOptions(
          toReligionOptions(religionsResponse?.data),
        );

        setCountryOptions(
          toMasterOptions(countriesResponse?.data),
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadMasters();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    categoryOptions,
    religionOptions,
    countryOptions,
    isLoading,
  };
}