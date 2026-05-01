import ApplicationWizard from '@/components/recruitment/ApplicationWizard';

type RecruitmentApplyPageProps = {
  searchParams?: Promise<{
    code?: string;
    name?: string;
    post?: string;
  }>;
};

export default async function RecruitmentApplyPage({ searchParams }: RecruitmentApplyPageProps) {
  const params = (await searchParams) ?? {};

  return (
    <ApplicationWizard
      initialRecruitment={{
        code: params.code ?? 'KM-016',
        name: params.name ?? 'Kolhapur District Urban Banks Association Recruitment',
        postName: params.post,
      }}
    />
  );
}
