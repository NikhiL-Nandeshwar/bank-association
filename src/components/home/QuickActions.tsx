// React/Core
import Link from 'next/link';

const actions = [
  {
    title: 'Active Recruitments',
    description: '4 Open Positions',
    href: '/recruitment',
    icon: '📄',
  },
  {
    title: 'Notices & Circulars',
    description: 'Latest updates & instructions',
    href: '/notices',
    icon: '📢',
  },
  {
    title: 'Member Login',
    description: 'Login to member portal',
    href: '/auth/login',
    icon: '🔐',
  },
];

export default function QuickActions() {
  return (
    <section className="-mt-12 relative z-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">

          {actions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group rounded-xl bg-white p-6 shadow-md transition hover:shadow-lg"
            >
              <div className="flex items-start gap-4">
                
                {/* Icon placeholder */}
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-2xl">
                  {action.icon}
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-600">
                    {action.description}
                  </p>
                </div>

              </div>
            </Link>
          ))}

        </div>
      </div>
    </section>
  );
}
