import React from 'react';

export const FaqPage: React.FC = () => {
  const faqs = [
    {
      q: 'Do you offer Cash on Delivery (COD) across Pakistan?',
      a: 'Yes, we provide Cash on Delivery (COD) to all urban and suburban postal codes nationwide, including Karachi, Lahore, Islamabad, Rawalpindi, Peshawar, Quetta, Multan, and Faisalabad.',
    },
    {
      q: 'What is the delivery timeline and shipping fee?',
      a: 'Orders are dispatched within 24 business hours. Typical transit time is 2 to 4 business days. Delivery is completely FREE on orders over Rs. 4,000; a flat delivery fee of Rs. 250 applies to orders below this threshold.',
    },
    {
      q: 'How can I track my parcel status?',
      a: 'Once your order is processed and handed to our courier partner (TCS or Leopards), we update your order with a live tracking code viewable under "My Account → My Orders". You can also inquire directly on WhatsApp with your order number.',
    },
    {
      q: 'What alternative payment methods are available?',
      a: 'In addition to COD, we welcome direct bank transfer to our Meezan Bank corporate account, as well as mobile wallet transfers via EasyPaisa and JazzCash.',
    },
    {
      q: 'Can I return or exchange an item?',
      a: 'We offer a 7-day hassle-free inspection and exchange guarantee on unworn apparel, sealed electronics, and unused home goods if there is any defect or sizing discrepancy.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      <div className="text-center space-y-2">
        <span className="text-xs uppercase tracking-wider text-neutral-500 font-medium">Help Center</span>
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white font-display">
          Frequently Asked Questions
        </h1>
        <p className="text-xs text-neutral-500">Everything you need to know about purchasing, shipping, and returns.</p>
      </div>

      <div className="divide-y divide-neutral-200 dark:divide-neutral-800 border-y border-neutral-200 dark:border-neutral-800">
        {faqs.map((faq, i) => (
          <div key={i} className="py-5 space-y-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">{faq.q}</h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
