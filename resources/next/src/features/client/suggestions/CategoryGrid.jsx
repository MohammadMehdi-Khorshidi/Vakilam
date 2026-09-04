const categories = [
    {
        id: 'حقوق و مالی',
        letter: 'ح',
        description: 'چک، سفته، بدهی و مطالبه وجه',
    },
    {
        id: 'ملکی',
        letter: 'م',
        description: 'مالکیت، اجاره، تخلیه و سرقفلی',
    },
    {
        id: 'کار و تأمین اجتماعی',
        letter: 'ک',
        description: 'حقوق کار، بیمه و اختلاف کارگر و کارفرما',
    },
    {
        id: 'شرکت‌ها و قراردادها',
        letter: 'ش',
        description: 'قرارداد تجاری، شرکت و اختلاف شرکت‌ها',
    },
    {
        id: 'خانواده',
        letter: 'خ',
        description: 'طلاق، مهریه، حضانت و نفقه',
    },
    {
        id: 'کیفری',
        letter: 'ک',
        description: 'شکایت، اتهام و جرایم',
    },
];

const CategoryGrid = ({ selectedCategory, onSelect }) => {
    return (
        <div
            dir="rtl"
            className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
            {categories.map((category) => {
                const selected = selectedCategory === category.id;

                return (
                    <button
                        key={category.id}
                        type="button"
                        onClick={() => onSelect(category.id)}
                        className={`min-h-[130px] rounded-[15px] border p-5 text-right transition-all duration-200 ${
                            selected
                                ? 'border-[#d3a94f] bg-[#fffdf7] shadow-[0_5px_18px_rgba(201,169,110,0.08)]'
                                : 'border-[#dfe7e4] bg-white hover:border-[#b8cec6] hover:bg-[#fbfcfc]'
                        }`}
                    >
                        <div
                            className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-[12px] font-extrabold ${
                                selected
                                    ? 'bg-[#eff6f3] text-[#123f37]'
                                    : 'bg-[#f1f6f4] text-[#123f37]'
                            }`}
                        >
                            {category.letter}
                        </div>

                        <h3 className="text-center font-extrabold text-[#173f38]">
                            {category.id}
                        </h3>

                        <p className="mt-2 text-center leading-6 text-[#899591]">
                            {category.description}
                        </p>
                    </button>
                );
            })}
        </div>
    );
};

export default CategoryGrid;
