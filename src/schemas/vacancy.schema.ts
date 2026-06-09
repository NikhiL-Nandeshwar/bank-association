import { z } from 'zod';

const requiredPositiveNumberSchema = (requiredMessage: string, positiveMessage: string) =>
  z.preprocess(
    (value) => (value === '' ? undefined : value),
    z.coerce.number({ error: requiredMessage }).int(positiveMessage).positive(positiveMessage),
  );

const requiredMoneySchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.coerce.number({ error: 'Application fee is required.' }).min(0, 'Application fee cannot be negative.'),
);

const optionalPositiveNumberSchema = z.preprocess(
  (value) => (value === '' ? undefined : value),
  z.coerce.number().int('Enter a whole number.').positive('Enter a number greater than 0.').optional(),
);

const eligibilityCriteriaSchema = z.object({
  criteriaType: z.string().trim().min(1, 'Criteria type is required.'),
  criteriaValue: z.string().trim().min(1, 'Criteria value is required.'),
  groupTag: z.string().trim().min(1, 'Group tag is required.'),
  isMandatory: z.boolean(),
  declarationEng: z.string().trim().min(1, 'English declaration is required.'),
  declarationMrt: z.string().trim().min(1, 'Marathi declaration is required.'),
  sortOrder: z.coerce.number().int('Sort order must be a whole number.').nonnegative('Sort order must be non-negative.'),
  requiredDocumentType: z.string().optional(),
  requiredDocument: z.boolean().default(false),
});

export const createVacancySchema = z
  .object({
    bankId: requiredPositiveNumberSchema('Select a bank before adding recruitment.', 'Select a bank before adding recruitment.'),
    postName: z.string().trim().min(1, 'Post name is required.'),
    postNameMarathi: z.string().trim().optional(),
    totalSeats: requiredPositiveNumberSchema('Total seats is required.', 'Total seats must be greater than 0.'),
    applicationStartDate: z.string().trim().min(1, 'Application start date is required.'),
    applicationEndDate: z.string().trim().min(1, 'Application end date is required.'),
    applicationFee: requiredMoneySchema,
    minAge: optionalPositiveNumberSchema,
    maxAge: optionalPositiveNumberSchema,
    ageAsOnDate: z.string().trim().min(1, 'Age as on date is required.'),
    requiredCityDistrict: z.coerce.number().optional(),
    requiredStateId: z.coerce.number().optional(),
    requiredEducation: z.string().trim().min(1, 'Required education is required.'),
    isDomicileRequired: z.boolean(),
    isNCLRequired: z.boolean(),
    noticePdfUrl: z
      .string()
      .trim()
      .url('Enter a valid notice PDF URL.')
      .optional()
      .or(z.literal('')),
    noticePdfFileName: z.string().trim().optional(),
    eligibilityCriteria: z.array(eligibilityCriteriaSchema).optional(),
  })
  .refine((value) => value.applicationEndDate >= value.applicationStartDate, {
    path: ['applicationEndDate'],
    message: 'Application end date cannot be before start date.',
  })
  .refine((value) => !value.minAge || !value.maxAge || value.maxAge >= value.minAge, {
    path: ['maxAge'],
    message: 'Max age cannot be less than min age.',
  });

export type CreateVacancyRequest = z.infer<typeof createVacancySchema>;
export type UpdateVacancyRequest = CreateVacancyRequest & {
  vacancyId: number;
};
