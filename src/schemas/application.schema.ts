import { z } from 'zod';

const maybeBlankStringSchema = z.string();

const maybeIsoDateSchema = z.union([
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid passing date.'),
  z.null(),
]);

export const saveStep3EducationSchema = z.object({
  educationId: z.coerce.number().int('Education ID must be a whole number.').nonnegative('Education ID cannot be negative.'),
  educationLevel: z.string().trim(),
  specialization: maybeBlankStringSchema,
  organizationName: maybeBlankStringSchema,
  percentageOrCGPA: z.coerce.number().min(0, 'Percentage or CGPA cannot be negative.'),
  className: maybeBlankStringSchema,
  passedMonthYear: maybeBlankStringSchema,
  passedDate: maybeIsoDateSchema,
  sortOrder: z.coerce.number().int('Sort order must be a whole number.').nonnegative('Sort order cannot be negative.'),
});

const saveStep3EducationValidationSchema = saveStep3EducationSchema.extend({
  // This identifies the fixed UI card (e.g. Graduation), while educationLevel
  // contains the applicant's qualification (e.g. BTECH).
  educationCategory: z.string().trim(),
});

function hasEducationDetails(education: z.infer<typeof saveStep3EducationValidationSchema>) {
  return Boolean(
    education.educationLevel ||
      education.specialization.trim() ||
      education.organizationName.trim() ||
      education.percentageOrCGPA ||
      education.className.trim() ||
      education.passedMonthYear.trim() ||
      education.passedDate,
  );
}

export function createSaveStep3Schema(mandatoryEducationLevels: string[]) {
  return z
    .object({
      applicationId: z.coerce.number().int('Application ID must be a whole number.').nonnegative('Application ID cannot be negative.'),
      educations: z.array(saveStep3EducationValidationSchema).min(1, 'Add at least one education row.'),
    })
    .superRefine((value, ctx) => {
      value.educations.forEach((education, index) => {
        const isMandatory = mandatoryEducationLevels.includes(education.educationCategory);
        const hasDetails = hasEducationDetails(education);
        const entryPath = ['educations', index] as const;

        // Unused optional cards should not block the applicant from continuing.
        if (!isMandatory && !hasDetails) {
          return;
        }

        if (!education.educationLevel) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'educationLevel'],
            message: 'Education level is required.',
          });
        }

        if (!isMandatory) {
          return;
        }

        if (!education.organizationName.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'organizationName'],
            message: `${education.educationCategory} organization name is required.`,
          });
        }

        if (!education.passedMonthYear.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'passedMonthYear'],
            message: `${education.educationCategory} passed month/year is required.`,
          });
        }

        // if (education.passedDate === null) {
        //   ctx.addIssue({
        //     code: 'custom',
        //     path: [...entryPath, 'passedDate'],
        //     message: `${education.educationLevel} passed date is required.`,
        //   });
        // }

        if (!education.className.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'className'],
            message: `${education.educationCategory} class/grade is required.`,
          });
        }

        if (!education.specialization.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'specialization'],
            message: `${education.educationCategory} specialization is required.`,
          });
        }

        if (!education.percentageOrCGPA || education.percentageOrCGPA <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'percentageOrCGPA'],
            message: `${education.educationCategory} percentage or CGPA is required.`,
          });
        }
      });
    })
    .transform(({ applicationId, educations }) => ({
      applicationId,
      // The API receives only rows the applicant actually completed; the
      // category is client-side validation context and is not part of its contract.
      educations: educations
        .filter(hasEducationDetails)
        .map(({ educationCategory: _educationCategory, ...education }) => education),
    }));
}

export type SaveStep3EducationPayload = z.infer<typeof saveStep3EducationSchema>;
export type SaveStep3Payload = z.infer<ReturnType<typeof createSaveStep3Schema>>;

const experienceIsoDateSchema = z.string().refine(
  (value) => !Number.isNaN(Date.parse(value)),
  'Enter a valid date.',
);

export const saveStepExperienceItemSchema = z
  .object({
    experienceId: z.coerce.number().int('Experience ID must be a whole number.').nonnegative('Experience ID cannot be negative.'),
    organizationName: z.string().trim().min(1, 'Organization name is required.'),
    designation: z.string().trim().min(1, 'Designation is required.'),
    location: z.string().trim().min(1, 'Location is required.'),
    fromDate: experienceIsoDateSchema,
    toDate: experienceIsoDateSchema.nullable(),
    isCurrentJob: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.isCurrentJob && value.toDate === null) {
      ctx.addIssue({
        code: 'custom',
        path: ['toDate'],
        message: 'End date is required unless this is your current job.',
      });
    }
  });

export function createSaveStepExperienceSchema() {
  return z
    .object({
      applicationId: z.coerce.number().int('Application ID must be a whole number.').positive('Application ID is required.'),
      experiences: z.array(saveStepExperienceItemSchema),
    })
}

export type SaveStepExperienceItemPayload = z.infer<typeof saveStepExperienceItemSchema>;
export type SaveStepExperiencePayload = z.infer<ReturnType<typeof createSaveStepExperienceSchema>>;
