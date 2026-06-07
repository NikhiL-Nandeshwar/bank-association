export const emptyBankForm = {
  bankName: '',
  bankNameMarathi: '',
  bankCode: '',
  address: '',
  contactEmail: '',
  contactPhone: '',
  logoUrl: '',
};

export const emptyRecruitmentForm = {
  bankId: '',
  postName: '',
  postNameMarathi: '',
  totalSeats: '',
  applicationStartDate: '',
  applicationEndDate: '',
  applicationFee: '',
  minAge: '',
  maxAge: '',
  ageAsOnDate: '',
  requiredCityDistrict: '',
  requiredStateId: '',
  requiredEducation: '',
  isDomicileRequired: false,
  isNCLRequired: false,
  noticePdfUrl: '',
  noticePdfFileName: '',
  eligibilityCriteria: [] as Array<{
    criteriaType: string;
    criteriaValue: string;
    groupTag: string;
    isMandatory: boolean;
    declarationEng: string;
    declarationMrt: string;
    sortOrder: number;
  }>,
};

export const emptyNewsForm = {
  newsEng: '',
  newsMrt: '',
};

export const ELIGIBILITY_CRITERIA_TYPES = ['EDUCATION', 'COURSE', 'EXPERIENCE', 'CERTIFICATION'];

export const ELIGIBILITY_CRITERIA_VALUES = {
  EDUCATION: [
    'SSC_10TH',
    'HSC_12TH',
    'GRADUATION',
    'POST_GRADUATION',
    'DIPLOMA',
  ],
  COURSE: [
    'MSCIT',
    'CCC',
    'TALLY',
    'OFFICE_SUITE',
  ],
  EXPERIENCE: [
    'FRESHER',
    '1_YEAR',
    '2_YEARS',
    '5_YEARS',
  ],
  CERTIFICATION: [
    'CA',
    'ICWA',
    'CS',
    'BANK_CERTIFICATION',
  ],
};

export const ELIGIBILITY_CRITERIA_DEFAULT_DECLARATIONS = {
  SSC_10TH: {
    declarationEng: 'I have passed Secondary School Certificate (10th) examination.',
    declarationMrt: 'मी माध्यमिक शालान्त प्रमाणपत्र (१०वी) परीक्षा उत्तीर्ण केली आहे.',
  },
  HSC_12TH: {
    declarationEng: 'I have passed Higher Secondary Certificate (12th) examination.',
    declarationMrt: 'मी उच्च माध्यमिक शालान्त प्रमाणपत्र (१२वी) परीक्षा उत्तीर्ण केली आहे.',
  },
  GRADUATION: {
    declarationEng: 'I have completed Graduation from a recognized university.',
    declarationMrt: 'मी मान्यताप्राप्त विद्यापीठातून पदवी पूर्ण केली आहे.',
  },
  POST_GRADUATION: {
    declarationEng: 'I have completed Post Graduation from a recognized university.',
    declarationMrt: 'मी मान्यताप्राप्त विद्यापीठातून पोस्ट ग्रेजुएशन पूर्ण केली आहे.',
  },
  DIPLOMA: {
    declarationEng: 'I have completed a Diploma course.',
    declarationMrt: 'मी डिप्लोमा अभ्यासक्रम पूर्ण केला आहे.',
  },
  MSCIT: {
    declarationEng: 'I have completed MS-CIT or equivalent computer course.',
    declarationMrt: 'मी एमएस-सीआयटी किंवा समकक्ष संगणक अभ्यासक्रम पूर्ण केला आहे.',
  },
  CCC: {
    declarationEng: 'I have completed CCC (Course on Computer Concepts).',
    declarationMrt: 'मी सीसीसी (कोर्स ऑन कंप्यूटर कॉन्सेप्ट्स) पूर्ण केला आहे.',
  },
  TALLY: {
    declarationEng: 'I have completed Tally certification.',
    declarationMrt: 'मी टाली प्रमाणपत्र पूर्ण केले आहे.',
  },
  OFFICE_SUITE: {
    declarationEng: 'I have completed Office Suite certification.',
    declarationMrt: 'मी ऑफिस स्यूट प्रमाणपत्र पूर्ण केले आहे.',
  },
  FRESHER: {
    declarationEng: 'I am a fresher with no prior work experience.',
    declarationMrt: 'मी कोणतेही पूर्व कार्य अनुभव न करता ताजा प्रवेशक आहे.',
  },
  '1_YEAR': {
    declarationEng: 'I have at least 1 year of relevant work experience.',
    declarationMrt: 'मेरे पास कमीतकमी 1 वर्ष का संबंधित कार्य अनुभव है।',
  },
  '2_YEARS': {
    declarationEng: 'I have at least 2 years of relevant work experience.',
    declarationMrt: 'मेरे पास कमीतकमी 2 साल का संबंधित कार्य अनुभव है।',
  },
  '5_YEARS': {
    declarationEng: 'I have at least 5 years of relevant work experience.',
    declarationMrt: 'मेरे पास कमीतकमी 5 साल का संबंधित कार्य अनुभव है।',
  },
  CA: {
    declarationEng: 'I am a Chartered Accountant (CA).',
    declarationMrt: 'मी प्रमाणित लेखाकार (सीए) आहे.',
  },
  ICWA: {
    declarationEng: 'I am a Cost Management Accountant (CMA/ICWA).',
    declarationMrt: 'मी खर्च व्यवस्थापन लेखाकार (सीएमए/आयसीडब्लूए) आहे.',
  },
  CS: {
    declarationEng: 'I am a Company Secretary (CS).',
    declarationMrt: 'मी कंपनी सचिव (सीएस) आहे.',
  },
  BANK_CERTIFICATION: {
    declarationEng: 'I have completed bank certification courses.',
    declarationMrt: 'मी बँक प्रमाणपत्र अभ्यासक्रम पूर्ण केले आहे.',
  },
} as const;