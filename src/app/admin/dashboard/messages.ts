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
  news: {
    validationError: 'Please fix the highlighted news fields.',
    saveSuccess: 'News added successfully.',
    saveFailed: 'Failed to add news.',
    localSaveFallback: 'News saved locally. API save can be retried when backend is available.',
    translationInfo: 'Note: Marathi translation can be entered manually or auto-translated.',
  },
  category: {
    validationError: 'Please fix the highlighted category fields.',
    saveSuccess: 'Category added successfully.',
    saveFailed: 'Failed to add category.',
  },
  author: {
    validationError: 'Please fix the highlighted author fields.',
    saveSuccess: 'Author added successfully.',
    saveFailed: 'Failed to add author.',
  },
  book: {
    validationError: 'Please fix the highlighted book fields.',
    saveSuccess: 'Book added successfully.',
    saveFailed: 'Failed to add book.',
  },
} as const;
