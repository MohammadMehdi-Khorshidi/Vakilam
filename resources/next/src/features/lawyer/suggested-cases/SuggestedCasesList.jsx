import SuggestedCaseCard from './SuggestedCaseCard';

const cases = [
    {
        id: 'VK-1405-00128',
        title: 'مطالبه وجه چک',
        city: 'تهران',
        category: 'حقوقی و مالی',
        budget: '۸۲,۰۰۰,۰۰۰ تومان',
        match: 93,
        tags: ['چک', 'مطالبه وجه', 'گواهی عدم پرداخت دارد'],
    },
    {
        id: 'VK-1405-00129',
        title: 'مطالبه وجه چک',
        city: 'تهران',
        category: 'حقوقی و مالی',
        budget: '۸۲,۰۰۰,۰۰۰ تومان',
        match: 93,
        tags: ['چک', 'مطالبه وجه', 'گواهی عدم پرداخت دارد'],
    },
];

const SuggestedCasesList = () => {
    return (
        <section
            dir="rtl"
            className="rounded-[22px] border border-[#e1e8e4] bg-white px-5 shadow-[0_5px_25px_rgba(18,63,55,0.04)] sm:px-7 lg:px-9"
        >
            {cases.map((caseItem) => (
                <SuggestedCaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
        </section>
    );
};

export default SuggestedCasesList;
