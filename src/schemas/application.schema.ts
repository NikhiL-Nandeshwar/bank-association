import { z } from 'zod';

const maybeBlankStringSchema = z.string();

const maybeIsoDateSchema = z.union([
  z.string().refine((value) => !Number.isNaN(Date.parse(value)), 'Enter a valid passing date.'),
  z.null(),
]);

export const saveStep3EducationSchema = z.object({
  educationId: z.coerce.number().int('Education ID must be a whole number.').nonnegative('Education ID cannot be negative.'),
  educationLevel: z.string().trim().min(1, 'Education level is required.'),
  specialization: maybeBlankStringSchema,
  organizationName: maybeBlankStringSchema,
  percentageOrCGPA: z.coerce.number().min(0, 'Percentage or CGPA cannot be negative.'),
  className: maybeBlankStringSchema,
  passedMonthYear: maybeBlankStringSchema,
  passedDate: maybeIsoDateSchema,
  sortOrder: z.coerce.number().int('Sort order must be a whole number.').nonnegative('Sort order cannot be negative.'),
});

export function createSaveStep3Schema(mandatoryEducationLevels: string[]) {
  return z
    .object({
      applicationId: z.coerce.number().int('Application ID must be a whole number.').nonnegative('Application ID cannot be negative.'),
      educations: z.array(saveStep3EducationSchema).min(1, 'Add at least one education row.'),
    })
    .superRefine((value, ctx) => {
      value.educations.forEach((education, index) => {
        if (!mandatoryEducationLevels.includes(education.educationLevel)) {
          return;
        }

        const entryPath = ['educations', index] as const;

        if (!education.organizationName.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'organizationName'],
            message: `${education.educationLevel} organization name is required.`,
          });
        }

        if (!education.passedMonthYear.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'passedMonthYear'],
            message: `${education.educationLevel} passed month/year is required.`,
          });
        }

        if (education.passedDate === null) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'passedDate'],
            message: `${education.educationLevel} passed date is required.`,
          });
        }

        if (!education.className.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'className'],
            message: `${education.educationLevel} class/grade is required.`,
          });
        }

        if (!education.specialization.trim()) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'specialization'],
            message: `${education.educationLevel} specialization is required.`,
          });
        }

        if (!education.percentageOrCGPA || education.percentageOrCGPA <= 0) {
          ctx.addIssue({
            code: 'custom',
            path: [...entryPath, 'percentageOrCGPA'],
            message: `${education.educationLevel} percentage or CGPA is required.`,
          });
        }
      });
    });
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

export function createSaveStepExperienceSchema(isFresher: boolean) {
  return z
    .object({
      applicationId: z.coerce.number().int('Application ID must be a whole number.').positive('Application ID is required.'),
      experiences: z.array(saveStepExperienceItemSchema),
    })
    .superRefine((value, ctx) => {
      if (!isFresher && value.experiences.length === 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['experiences'],
          message: 'Add at least one complete experience row.',
        });
      }
    });
}

export type SaveStepExperienceItemPayload = z.infer<typeof saveStepExperienceItemSchema>;
export type SaveStepExperiencePayload = z.infer<ReturnType<typeof createSaveStepExperienceSchema>>;
