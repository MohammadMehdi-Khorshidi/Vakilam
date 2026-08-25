import LawyerCard from '@/components/carts/LawyerCard';


const lawyers = [
    {
        id: 1,
        name: 'نگرس سعادتی',
        initial: 'ن',
        title: 'وکیل پایه یک دادگستری',
        location: 'تهران',
        description:
            'تمرکز حرفه‌ای بر پرونده‌های چک، سفته و اختلافات قراردادی با رویکرد شفاف و مرحله‌بندی‌شده.',
        trustScore: '۹۲',
        cooperationScore: '۴.۸',
        reviewedCases: '۳۶',
        responseTime: 'کمتر از ۲ ساعت',
        experience: '۱۱ سال',
        match: '۹۴',
    },
    {
        id: 2,
        name: 'محمد رضایی',
        initial: 'م',
        title: 'وکیل پایه یک دادگستری',
        location: 'تهران',
        description:
            'متخصص پرونده‌های مالی و قراردادهای تجاری با سابقه همکاری مستمر و پاسخ‌گویی سریع.',
        trustScore: '۸۹',
        cooperationScore: '۴.۷',
        reviewedCases: '۲۸',
        responseTime: 'کمتر از ۳ ساعت',
        experience: '۹ سال',
        match: '۸۹',
    },
];

const LawyersList = () => {
    return (
        <section className="space-y-4">
            {lawyers.map((lawyer) => (
                <LawyerCard key={lawyer.id} {...lawyer} />
            ))}
        </section>
    );
};

export default LawyersList;
