export const ADMIN_DASHBOARD_MESSAGES = {
  bank: {
    validationError: 'Please fix the highlighted bank fields.',
    saveSuccess: 'Bank added successfully.',
    saveFailed: 'Failed to add bank.',
    localSaveFallback: 'Bank saved locally. API save can be retried when backend is available.',
  },
  recruitment: {
    bankRequired: 'Select a bank before adding recruitment.',
    validationError: 'Please fix the highlighted recruitment fields.',
    saveSuccess: 'Recruitment added successfully.',
    saveFailed: 'Failed to add recruitment.',
    updateSuccess: 'Recruitment updated successfully.',
    updateFailed: 'Failed to update recruitment.',
    publishSuccess: 'Recruitment published successfully.',
    publishFailed: 'Failed to publish recruitment.',
    loadFailed: 'Unable to load recruitments from the API.',
  },
} as const;
