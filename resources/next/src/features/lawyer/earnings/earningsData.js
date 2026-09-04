export const earnings = [
    {
        id: 'EARN-501',

        caseCode: 'VK-1405-00128',

        caseTitle: 'مطالبه وجه چک',

        engagementCode: 'COL-501',

        totalAmountToman: 48_000_000,

        prepaymentToman: 18_000_000,

        commissionRate: 10,

        paymentRegistered: true,

        contractRegistered: true,

        registeredCopyUploaded: true,

        clientConfirmed: true,

        settled: false,

        paidAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },

    {
        id: 'EARN-492',

        caseCode: 'VK-1405-00121',

        caseTitle: 'تنظیم قرارداد تجاری',

        engagementCode: 'COL-492',

        totalAmountToman: 36_000_000,

        prepaymentToman: 12_000_000,

        commissionRate: 10,

        paymentRegistered: true,

        contractRegistered: true,

        registeredCopyUploaded: false,

        clientConfirmed: false,

        settled: false,

        paidAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },

    {
        id: 'EARN-399',

        caseCode: 'VK-1404-00987',

        caseTitle: 'اختلاف در قرارداد اجاره',

        engagementCode: 'COL-399',

        totalAmountToman: 30_000_000,

        prepaymentToman: 10_000_000,

        commissionRate: 10,

        paymentRegistered: true,

        contractRegistered: true,

        registeredCopyUploaded: true,

        clientConfirmed: true,

        settled: true,

        settledAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),

        paidAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
];
