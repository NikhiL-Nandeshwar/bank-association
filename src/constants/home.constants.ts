import { ROUTES } from '@/constants/routes.constants';

export const ANNOUNCEMENT_COPY = {
  en: {
    label: 'Notice',
    message: 'Welcome to the Kolhapur District Urban Banks Association portal. Check the latest announcements and recruitment updates here.',
  },
  mr: {
    label: '\u0938\u0942\u091a\u0928\u093e',
    message: '\u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930 \u091c\u093f\u0932\u094d\u0939\u093e \u0928\u093e\u0917\u0930\u0940 \u092c\u0945\u0902\u0915\u094d\u0938 \u0938\u0939\u0915\u093e\u0930\u0940 \u0905\u0938\u094b\u0938\u093f\u090f\u0936\u0928 \u0932\u093f. \u092e\u0927\u094d\u092f\u0947 \u0906\u092a\u0932\u0947 \u0938\u094d\u0935\u093e\u0917\u0924 \u0906\u0939\u0947. \u0911\u0928\u0932\u093e\u0907\u0928 \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0935 \u092d\u0930\u0924\u0940 \u092a\u094b\u0930\u094d\u091f\u0932\u0935\u0930\u0940\u0932 \u0924\u093e\u091c\u094d\u092f\u093e \u0938\u0942\u091a\u0928\u093e \u092f\u0947\u0925\u0947 \u092a\u093e\u0939\u093e.',
  },
} as const;

export const ASSOCIATION_COMMITMENT_COPY = {
  en: {
    badge: 'Our Commitment',
    title: 'Strong support for member banks',
    description:
      'Kolhapur District Urban Banks Association helps member institutions with planning, training, and implementation support so they can build stronger, more people-focused banking operations.',
    focusAreas: [
      {
        title: 'Guidance and policy support',
        description:
          'We help member banks with regulatory clarity, operational direction, and policy guidance for day-to-day administration and better decision-making.',
      },
      {
        title: 'Training and capability building',
        description:
          'Practical training programs for directors, officers, and staff improve institutional capability and strengthen service delivery.',
      },
      {
        title: 'Recovery and coordination assistance',
        description:
          'We support overdue and recovery-related matters through coordination, process guidance, and documentation assistance to move action forward effectively.',
      },
      {
        title: 'Rebuilding and revival support',
        description:
          'Banks facing operational challenges receive structured guidance on revival planning, risk control, and external technical support where needed.',
      },
    ],
  },
  mr: {
    badge: '\u0906\u092e\u091a\u0940 \u092c\u093e\u0902\u0927\u093f\u0932\u0915\u0940',
    title: '\u0938\u0926\u0938\u094d\u092f \u092c\u0901\u0915\u093e\u0902\u0938\u093e\u0920\u0940 \u0920\u094b\u0938 \u0938\u093e\u0925',
    description:
      '\u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930 \u091c\u093f\u0932\u094d\u0939\u093e \u0928\u093e\u0917\u0930\u0940 \u092c\u0901\u0915\u094d\u0938 \u0938\u0939\u0915\u093e\u0930\u0940 \u0905\u0938\u094b\u0938\u093f\u090f\u0936\u0928 \u0938\u0926\u0938\u094d\u092f \u0938\u0902\u0938\u094d\u0925\u093e\u0902\u0928\u093e \u0928\u093f\u092f\u094b\u091c\u0928, \u092a\u094d\u0930\u0936\u093f\u0915\u094d\u0937\u0923 \u0906\u0923\u093f \u0905\u0902\u092e\u0932\u092c\u091c\u093e\u0935\u0923\u0940 \u092f\u093e \u0924\u093f\u0928\u094d\u0939\u0940 \u0938\u094d\u0924\u0930\u093e\u0902\u0935\u0930 \u0920\u094b\u0938 \u0938\u0939\u093e\u092f\u094d\u092f \u0926\u0947\u090a\u0928 \u0905\u0927\u093f\u0915 \u0938\u0915\u094d\u0937\u092e \u0906\u0923\u093f \u0932\u094b\u0915\u093e\u092d\u093f\u092e\u0941\u0916 \u092c\u0901\u0915\u093f\u0902\u0917 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u0947\u0915\u0921\u0947 \u0935\u093e\u091f\u091a\u093e\u0932 \u0918\u0921\u0935\u0924\u0947.',
    focusAreas: [
      {
        title: '\u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0906\u0923\u093f \u0927\u094b\u0930\u0923 \u0938\u0939\u093e\u092f\u094d\u092f',
        description:
          '\u0938\u0926\u0938\u094d\u092f \u092c\u0901\u0915\u093e\u0902\u0928\u093e \u0928\u093f\u092f\u092e\u092a\u093e\u0932\u0928, \u092a\u094d\u0930\u0936\u093e\u0938\u0915\u0940\u092f \u0928\u093f\u0930\u094d\u0923\u092f \u0906\u0923\u093f \u0926\u0948\u0928\u0902\u0926\u093f\u0928 \u0935\u094d\u092f\u0935\u0938\u094d\u0925\u093e\u092a\u0928\u093e\u0924 \u0938\u094d\u092a\u0937\u094d\u091f \u0926\u093f\u0936\u093e \u092e\u093f\u0933\u093e\u0935\u0940 \u092f\u093e\u0938\u093e\u0920\u0940 \u0924\u091c\u094d\u091c\u094d\u091e \u0938\u0932\u094d\u0932\u093e \u0926\u093f\u0932\u093e \u091c\u093e\u0924\u094b.',
      },
      {
        title: '\u092a\u094d\u0930\u0936\u093f\u0915\u094d\u0937\u0923 \u0906\u0923\u093f \u0915\u094c\u0936\u0932\u094d\u092f \u0935\u093f\u0915\u093e\u0938',
        description:
          '\u0938\u0902\u091a\u093e\u0932\u0915, \u0905\u0927\u093f\u0915\u093e\u0930\u0940 \u0906\u0923\u093f \u0915\u0930\u094d\u092e\u091a\u093e\u0930\u0940 \u092f\u093e\u0902\u091a\u094d\u092f\u093e\u0938\u093e\u0920\u0940 \u0935\u094d\u092f\u0935\u0939\u093e\u0930\u094d\u092f \u092a\u094d\u0930\u0936\u093f\u0915\u094d\u0937\u0923 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e \u0930\u093e\u092c\u0935\u0942\u0928 \u0938\u0902\u0938\u094d\u0925\u0947\u091a\u0940 \u0915\u093e\u092e\u0917\u093f\u0930\u0940 \u0905\u0927\u093f\u0915 \u0938\u0915\u094d\u0937\u092e \u0915\u0947\u0932\u0940 \u091c\u093e\u0924\u0947.',
      },
      {
        title: '\u0935\u0938\u0941\u0932\u0940 \u0935 \u0938\u092e\u0928\u094d\u0935\u092f \u092e\u0926\u0924',
        description:
          '\u0925\u0915\u092c\u093e\u0915\u0940 \u092a\u094d\u0930\u0915\u0930\u0923\u093e\u0902\u092e\u0927\u094d\u092f\u0947 \u0938\u092e\u0928\u094d\u0935\u092f, \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e\u0924\u094d\u092e\u0915 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0906\u0923\u093f \u0906\u0935\u0936\u094d\u092f\u0915 \u0915\u093e\u0917\u0926\u092a\u0924\u094d\u0930\u0940\u092f \u0938\u0939\u093e\u092f\u094d\u092f \u0926\u0947\u090a\u0928 \u092a\u0930\u093f\u0923\u093e\u092e\u0915\u093e\u0930\u0915 \u0915\u0943\u0924\u0940\u0938 \u0917\u0924\u0940 \u0926\u093f\u0932\u0940 \u091c\u093e\u0924\u0947.',
      },
      {
        title: '\u092a\u0941\u0928\u0930\u094d\u092c\u093e\u0902\u0927\u0923\u0940 \u0935 \u092a\u0941\u0928\u0930\u0941\u091c\u094d\u091c\u0940\u0935\u0928 \u0938\u092e\u0930\u094d\u0925\u0928',
        description:
          '\u0905\u0921\u091a\u0923\u0940\u0924 \u0905\u0938\u0932\u0947\u0932\u094d\u092f\u093e \u092c\u0901\u0915\u093e\u0902\u0938\u093e\u0920\u0940 \u091f\u092a\u094d\u092a\u094d\u092f\u093e\u091f\u092a\u094d\u092a\u094d\u092f\u093e\u0928\u0947 \u092a\u0941\u0928\u0930\u094d\u092c\u093e\u0902\u0927\u0923\u0940 \u0906\u0930\u093e\u0916\u0921\u093e, \u091c\u094b\u0916\u0940\u092e \u0928\u093f\u092f\u0902\u0924\u094d\u0930\u0923 \u0906\u0923\u093f \u092c\u093e\u0939\u094d\u092f \u0924\u093e\u0902\u0924\u094d\u0930\u093f\u0915 \u092e\u0926\u0924\u0940\u091a\u0947 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0915\u0947\u0932\u0947 \u091c\u093e\u0924\u0947.',
      },
    ],
  },
} as const;

export const HERO_COPY = {
  en: {
    titleLineOne: 'Online Application Portal 2026-27',
    titleLineTwo: 'Recruitment Process',
    description: 'Submit online applications for recruitment opportunities across member cooperative banks.',
    about: 'About Us',
    recruitment: 'Recruitment Updates',
  },
  mr: {
    titleLineOne: '\u0911\u0928\u0932\u093e\u0907\u0928 \u0905\u0930\u094d\u091c \u092a\u094b\u0930\u094d\u091f\u0932 2026-27 \u0938\u093e\u0920\u0940',
    titleLineTwo: '\u092d\u0930\u0924\u0940 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e',
    description: '\u0938\u0926\u0938\u094d\u092f \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915\u093e\u0902\u091a\u094d\u092f\u093e \u092a\u0926 \u092d\u0930\u0924\u0940 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u0947\u0938\u093e\u0920\u0940 \u0911\u0928\u0932\u093e\u0907\u0928 \u0905\u0930\u094d\u091c \u0938\u093e\u0926\u0930 \u0915\u0930\u093e.',
    about: '\u0906\u092e\u091a\u094d\u092f\u093e\u092c\u0926\u094d\u0926\u0932',
    recruitment: '\u092d\u0930\u0924\u0940 \u0905\u0926\u094d\u092f\u0924\u0928\u0947',
  },
} as const;

export const LATEST_UPDATES_COPY = {
  en: {
    noticesTitle: 'Latest Notices',
    viewAll: 'View All',
    notices: [
      'Recruitment 2026-27 online form window extended till 15 March 2026.',
      'Exam center allocation notice published for KM-015.',
      'Document verification guidelines updated for shortlisted candidates.',
    ],
    eventsTitle: 'Upcoming Events',
    events: [
      { title: 'Mock Test Window', date: '05 Mar 2026' },
      { title: 'KM-015 Online Exam', date: '12 Mar 2026' },
      { title: 'Interview Guidance Session', date: '18 Mar 2026' },
    ],
  },
  mr: {
    noticesTitle: '\u0928\u0935\u0940\u0928\u0924\u092e \u0938\u0942\u091a\u0928\u093e',
    viewAll: '\u0938\u0930\u094d\u0935 \u092a\u0939\u093e',
    notices: [
      '\u092d\u0930\u0924\u0940 2026-27 \u0905\u0911\u0928\u0932\u093e\u0907\u0928 \u0905\u0930\u094d\u091c \u0935\u093f\u0902\u0921\u094b 15 \u092e\u093e\u0930\u094d\u091a 2026 \u092a\u0930\u094d\u092f\u0902\u0924 \u0935\u093e\u0922\u0935\u0923\u094d\u092f\u093e\u0924 \u0906\u0932\u0940 \u0906\u0939\u0947.',
      'KM-015 \u0938\u093e\u0920\u0940 \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0915\u0947\u0902\u0926\u094d\u0930 \u0935\u093e\u091f\u092a \u0938\u0942\u091a\u0928\u093e \u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u091d\u093e\u0932\u0940 \u0906\u0939\u0947.',
      '\u0928\u093f\u0935\u0921\u0932\u0947\u0932\u094d\u092f\u093e \u0909\u092e\u0947\u0926\u0935\u093e\u0930\u093e\u0902\u0938\u093e\u0920\u0940 \u0915\u093e\u0917\u0926\u092a\u0924\u094d\u0930 \u092a\u0921\u0924\u093e\u0933\u0923\u0940 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0915 \u0938\u0942\u091a\u0928\u093e \u0905\u0926\u094d\u092f\u0924\u0928\u093f\u0924 \u0915\u0930\u0923\u094d\u092f\u093e\u0924 \u0906\u0932\u094d\u092f\u093e \u0906\u0939\u0947\u0924.',
    ],
    eventsTitle: '\u0906\u0917\u093e\u092e\u0940 \u0915\u093e\u0930\u094d\u092f\u0915\u094d\u0930\u092e',
    events: [
      { title: '\u092e\u0949\u0915 \u091f\u0947\u0938\u094d\u091f \u0935\u093f\u0902\u0921\u094b', date: '05 Mar 2026' },
      { title: 'KM-015 \u0911\u0928\u0932\u093e\u0907\u0928 \u092a\u0930\u0940\u0915\u094d\u0937\u093e', date: '12 Mar 2026' },
      { title: '\u092e\u0941\u0932\u093e\u0916\u0924 \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0938\u0924\u094d\u0930', date: '18 Mar 2026' },
    ],
  },
} as const;

export const PORTAL_HIGHLIGHTS_COPY = {
  en: {
    badge: 'Candidate Services',
    title: 'Essential tools for every applicant journey',
    description: 'From exam schedules to helpdesk support, this section gives candidates faster access to the most-used recruitment actions in a clear and structured way.',
    explore: 'Explore All Services',
    cards: [
      {
        title: 'Exam Calendar',
        description: 'Track upcoming exam schedules, bank-wise windows, and important candidate timelines in one place.',
        href: ROUTES.recruitment,
        cta: 'View Schedule',
        eyebrow: 'Planning',
        badge: '01',
      },
      {
        title: 'Download Admit Card',
        description: 'Access hall tickets and candidate instructions for active recruitment cycles without the extra clutter.',
        href: ROUTES.recruitment,
        cta: 'Download Card',
        eyebrow: 'Access',
        badge: '02',
      },
      {
        title: 'Results & Merit List',
        description: 'Check published results, shortlist updates, and next-stage announcements with clearer status visibility.',
        href: ROUTES.recruitment,
        cta: 'Check Results',
        eyebrow: 'Results',
        badge: '03',
      },
      {
        title: 'Candidate Helpdesk',
        description: 'Find FAQs, process guidance, and support contact details for issues related to forms and recruitment notices.',
        href: ROUTES.about,
        cta: 'Get Support',
        eyebrow: 'Support',
        badge: '04',
      },
    ],
  },
  mr: {
    badge: '\u0909\u092e\u0947\u0926\u0935\u093e\u0930 \u0938\u0947\u0935\u093e',
    title: '\u092a\u094d\u0930\u0924\u094d\u092f\u0947\u0915 \u0905\u0930\u094d\u091c\u0926\u093e\u0930\u093e\u091a\u094d\u092f\u093e \u092a\u094d\u0930\u0935\u093e\u0938\u093e\u0938\u093e\u0920\u0940 \u0906\u0935\u0936\u094d\u092f\u0915 \u0938\u093e\u0927\u0928\u0947',
    description: '\u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0935\u0947\u0933\u093e\u092a\u0924\u094d\u0930\u0915\u093e\u092a\u093e\u0938\u0942\u0928 \u0939\u0947\u0932\u094d\u092a\u0921\u0947\u0938\u094d\u0915 \u0938\u092e\u0930\u094d\u0925\u0928\u093e\u092a\u0930\u094d\u092f\u0902\u0924, \u0939\u093e \u0935\u093f\u092d\u093e\u0917 \u092d\u0930\u0924\u0940\u0938\u0902\u092c\u0902\u0927\u093f\u0924 \u0938\u0930\u094d\u0935\u093e\u0927\u093f\u0915 \u0935\u093e\u092a\u0930\u0932\u094d\u092f\u093e \u091c\u093e\u0923\u093e\u0930\u094d\u092f\u093e \u0938\u0947\u0935\u093e \u0938\u0941\u091f\u0938\u0941\u091f\u0940\u0924\u092a\u0923\u0947 \u0926\u0947\u0924\u094b.',
    explore: '\u0938\u0930\u094d\u0935 \u0938\u0947\u0935\u093e \u092a\u0939\u093e',
    cards: [
      {
        title: '\u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0915\u0945\u0932\u0947\u0902\u0921\u0930',
        description: '\u0906\u0917\u093e\u092e\u0940 \u092a\u0930\u0940\u0915\u094d\u0937\u093e \u0935\u0947\u0933\u093e\u092a\u0924\u094d\u0930\u0915, \u092c\u0901\u0915\u0928\u093f\u0939\u093e\u092f \u0935\u093f\u0902\u0921\u094b \u0906\u0923\u093f \u092e\u0939\u0924\u094d\u0935\u093e\u091a\u094d\u092f\u093e \u0924\u093e\u0930\u0916\u093e \u090f\u0915\u093e\u091a \u0920\u093f\u0915\u093e\u0923\u0940 \u092a\u0939\u093e.',
        href: ROUTES.recruitment,
        cta: '\u0935\u0947\u0933\u093e\u092a\u0924\u094d\u0930\u0915 \u092a\u0939\u093e',
        eyebrow: '\u0928\u093f\u092f\u094b\u091c\u0928',
        badge: '01',
      },
      {
        title: '\u092a\u094d\u0930\u0935\u0947\u0936\u092a\u0924\u094d\u0930 \u0921\u093e\u0909\u0928\u0932\u094b\u0921',
        description: '\u0938\u0915\u094d\u0930\u093f\u092f \u092d\u0930\u0924\u0940\u0938\u093e\u0920\u0940 \u0939\u093e\u0932 \u091f\u093f\u0915\u093f\u091f \u0906\u0923\u093f \u0909\u092e\u0947\u0926\u0935\u093e\u0930 \u0938\u0942\u091a\u0928\u093e \u0938\u094b\u092a\u094d\u092f\u093e \u092a\u0926\u094d\u0927\u0924\u0940\u0928\u0947 \u092e\u093f\u0933\u0935\u093e.',
        href: ROUTES.recruitment,
        cta: '\u092a\u094d\u0930\u0935\u0947\u0936\u092a\u0924\u094d\u0930 \u092e\u093f\u0933\u0935\u093e',
        eyebrow: '\u092a\u094d\u0930\u0935\u0947\u0936',
        badge: '02',
      },
      {
        title: '\u0928\u093f\u0915\u093e\u0932 \u0935 \u092e\u0947\u0930\u093f\u091f \u092f\u093e\u0926\u0940',
        description: '\u092a\u094d\u0930\u0915\u093e\u0936\u093f\u0924 \u0928\u093f\u0915\u093e\u0932, \u0936\u0949\u0930\u094d\u091f\u0932\u093f\u0938\u094d\u091f \u0905\u0926\u094d\u092f\u0924\u0928\u0947 \u0906\u0923\u093f \u092a\u0941\u0922\u0940\u0932 \u091f\u092a\u094d\u092a\u094d\u092f\u093e\u091a\u0940 \u0918\u094b\u0937\u0923\u093e \u0938\u094d\u092a\u0937\u094d\u091f\u092a\u0923\u0947 \u092a\u0939\u093e.',
        href: ROUTES.recruitment,
        cta: '\u0928\u093f\u0915\u093e\u0932 \u092a\u0939\u093e',
        eyebrow: '\u0928\u093f\u0915\u093e\u0932',
        badge: '03',
      },
      {
        title: '\u0909\u092e\u0947\u0926\u0935\u093e\u0930 \u0939\u0947\u0932\u094d\u092a\u0921\u0947\u0938\u094d\u0915',
        description: '\u0905\u0930\u094d\u091c, \u092d\u0930\u0924\u0940 \u0938\u0942\u091a\u0928\u093e \u0906\u0923\u093f \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u0947\u0938\u0902\u092c\u0902\u0927\u0940\u0924 FAQ, \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0928 \u0935 \u0938\u092e\u0930\u094d\u0925\u0928 \u0924\u092a\u0936\u093f\u0932 \u092e\u093f\u0933\u0935\u093e.',
        href: ROUTES.about,
        cta: '\u092e\u0926\u0924 \u092e\u093f\u0933\u0935\u093e',
        eyebrow: '\u0938\u092e\u0930\u094d\u0925\u0928',
        badge: '04',
      },
    ],
  },
} as const;

export const QUICK_ACTIONS_COPY = {
  en: {
    actions: [
      {
        title: 'Active Recruitments',
        description: '4 Open Positions',
        href: ROUTES.recruitment,
        iconKey: 'recruitment',
        iconClassName: 'text-blue-700',
        iconWrapClassName: 'bg-blue-50 ring-1 ring-blue-100',
      },
      {
        title: 'Notices & Circulars',
        description: 'Latest updates & instructions',
        href: ROUTES.recruitment,
        iconKey: 'notice',
        iconClassName: 'text-amber-700',
        iconWrapClassName: 'bg-amber-50 ring-1 ring-amber-100',
      },
      {
        title: 'Member Login',
        description: 'Login to member portal',
        href: ROUTES.login,
        iconKey: 'login',
        iconClassName: 'text-emerald-700',
        iconWrapClassName: 'bg-emerald-50 ring-1 ring-emerald-100',
      },
    ],
  },
  mr: {
    actions: [
      {
        title: '\u0938\u0915\u094d\u0930\u093f\u092f \u092d\u0930\u0924\u0940',
        description: '4 \u0916\u0941\u0932\u0940 \u092a\u0926\u0947',
        href: ROUTES.recruitment,
        iconKey: 'recruitment',
        iconClassName: 'text-blue-700',
        iconWrapClassName: 'bg-blue-50 ring-1 ring-blue-100',
      },
      {
        title: '\u0938\u0942\u091a\u0928\u093e \u0935 \u092a\u0930\u093f\u092a\u0924\u094d\u0930\u0915\u0947',
        description: '\u0928\u0935\u0940\u0928\u0924\u092e \u0905\u0926\u094d\u092f\u0924\u0928\u0947 \u0935 \u0938\u0942\u091a\u0928\u093e',
        href: ROUTES.recruitment,
        iconKey: 'notice',
        iconClassName: 'text-amber-700',
        iconWrapClassName: 'bg-amber-50 ring-1 ring-amber-100',
      },
      {
        title: '\u0938\u0926\u0938\u094d\u092f \u0932\u0949\u0917\u093f\u0928',
        description: '\u0938\u0926\u0938\u094d\u092f \u092a\u094b\u0930\u094d\u091f\u0932\u092e\u0927\u094d\u092f\u0947 \u0932\u0949\u0917\u093f\u0928 \u0915\u0930\u093e',
        href: ROUTES.login,
        iconKey: 'login',
        iconClassName: 'text-emerald-700',
        iconWrapClassName: 'bg-emerald-50 ring-1 ring-emerald-100',
      },
    ],
  },
} as const;

export const CURRENT_RECRUITMENTS = [
  {
    code: 'KM-016',
    name: '\u0936\u093f\u0935\u093e\u091c\u0940 \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915 \u0932\u093f., \u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930',
    date: '16-10-2025',
    time: '10:00 AM',
    status: 'Open',
  },
  {
    code: 'KM-015',
    name: '\u092a\u0941\u0923\u0947 \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915 \u0932\u093f., \u092a\u0941\u0923\u0947',
    date: '09-01-2026',
    time: '10:00 AM',
    status: 'Open',
  },
  {
    code: 'KM-014',
    name: '\u092a\u0941\u0923\u0947 \u092e\u0930\u094d\u091a\u0902\u091f\u094d\u0938 \u0915\u094b-\u0911\u092a \u092c\u0901\u0915 \u0932\u093f., \u092a\u0941\u0923\u0947',
    date: '02-01-2026',
    time: '10:00 AM',
    status: 'Open',
  },
  {
    code: 'KM-013',
    name: '\u0936\u093f\u0935\u093e\u092c\u093e\u0938\u0935\u0928\u094d\u0928\u093e \u091c\u0928\u0924\u093e \u0915\u094b-\u0911\u092a \u092c\u0901\u0915 \u0932\u093f., \u0915\u094b\u0932\u094d\u0939\u093e\u092a\u0942\u0930',
    date: '31-12-2025',
    time: '10:00 AM',
    status: 'Open',
  },
] as const;

export const PREVIOUS_RECRUITMENTS = [
  {
    code: 'KM-012',
    name: '\u0928\u093e\u0936\u093f\u0915 \u091c\u093f\u0932\u094d\u0939\u093e \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915 \u0932\u093f., \u0928\u093e\u0936\u093f\u0915',
    date: '18-08-2025',
    time: '10:00 AM',
    status: 'Closed',
  },
  {
    code: 'KM-011',
    name: '\u0938\u093e\u0924\u093e\u0930\u093e \u092e\u0930\u094d\u091a\u0902\u091f\u094d\u0938 \u0915\u094b-\u0911\u092a \u092c\u0901\u0915 \u0932\u093f., \u0938\u093e\u0924\u093e\u0930\u093e',
    date: '21-06-2025',
    time: '10:00 AM',
    status: 'Result published',
  },
  {
    code: 'KM-010',
    name: '\u0938\u093e\u0902\u0917\u0932\u0940 \u0936\u0939\u0930 \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915 \u0932\u093f., \u0938\u093e\u0902\u0917\u0932\u0940',
    date: '14-04-2025',
    time: '10:00 AM',
    status: 'Closed',
  },
] as const;

export const RECRUITMENT_OVERVIEW_COPY = {
  en: {
    current: 'Current Recruitments',
    previous: 'Previous Recruitments',
    code: 'Recruitment Code',
    name: 'Recruitment Name',
    start: 'Start Date / Time',
    status: 'Status',
    apply: 'Apply Now',
    viewArchive: 'View Details',
    note: 'All recruitment processes are conducted through the respective cooperative banks.',
    acts: 'Banking Regulation Acts',
    quickLinks: 'Quick Links',
    actItems: ['Banking Regulation Act', 'Cooperative Department Circulars', 'RBI & NABARD Updates'],
    linkItems: ['Application guidelines', 'Bank recruitment circulars', 'Fees and conditions'],
  },
  mr: {
    current: '\u0938\u0927\u094d\u092f\u093e\u091a\u094d\u092f\u093e \u092d\u0930\u0924\u0940',
    previous: '\u092e\u093e\u0917\u0940\u0932 \u092d\u0930\u0924\u0940',
    code: '\u092d\u0930\u0924\u0940 \u0915\u094b\u0921',
    name: '\u092d\u0930\u0924\u0940\u091a\u0947 \u0928\u093e\u0935',
    start: '\u0938\u0941\u0930\u0941\u0935\u093e\u0924\u0940\u091a\u0940 \u0924\u093e\u0930\u0940\u0916 / \u0935\u0947\u0933',
    status: '\u0938\u094d\u0925\u093f\u0924\u0940',
    apply: '\u0905\u0930\u094d\u091c \u0915\u0930\u093e',
    viewArchive: '\u0924\u092a\u0936\u0940\u0932 \u092a\u0939\u093e',
    note: '\u0938\u0930\u094d\u0935 \u092a\u0926 \u092d\u0930\u0924\u0940 \u092a\u094d\u0930\u0915\u094d\u0930\u093f\u092f\u093e \u0938\u0939\u0915\u093e\u0930\u0940 \u092c\u0901\u0915\u093e\u0902\u0926\u094d\u0935\u093e\u0930\u0947 \u0930\u093e\u092c\u0935\u093f\u0923\u094d\u092f\u093e\u0924 \u092f\u0947\u0924\u0947.',
    acts: '\u092c\u0945\u0902\u0915\u093f\u0902\u0917 \u0930\u0947\u0917\u094d\u092f\u0941\u0932\u0947\u0936\u0928 \u0915\u093e\u092f\u0926\u0947',
    quickLinks: '\u0926\u094d\u0930\u0941\u0924 \u0926\u0941\u0935\u0947',
    actItems: ['\u092c\u0901\u0915\u093f\u0902\u0917 \u0930\u0947\u0917\u094d\u092f\u0941\u0932\u0947\u0936\u0928 \u0915\u093e\u092f\u0926\u093e', '\u0938\u0939\u0915\u093e\u0930 \u0935\u093f\u092d\u093e\u0917\u093e\u091a\u0940 \u092a\u0930\u093f\u092a\u0924\u094d\u0930\u0915\u0947', 'RBI \u0935 NABARD \u0905\u0926\u094d\u092f\u0924\u0928\u0947'],
    linkItems: ['\u0905\u0930\u094d\u091c \u092e\u093e\u0930\u094d\u0917\u0926\u0930\u094d\u0936\u0915 \u0938\u0942\u091a\u0928\u093e', '\u092c\u0901\u0915 \u092d\u0930\u0924\u0940 \u092a\u0930\u093f\u092a\u0924\u094d\u0930\u0915\u0947', '\u0936\u0941\u0932\u094d\u0915 \u0935 \u0905\u091f\u0940'],
  },
} as const;
