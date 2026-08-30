export default function ContractsHeader() {
    return (
        <div dir="rtl" className="mb-7">
            {/* عنوان اصلی */}
            <h1 className="mt-3 text-right text-3xl font-black tracking-tight text-[#123f37] sm:text-4xl">
                کنترل وضعیت قرارداد همکاری
            </h1>

            {/* توضیحات */}
            <p className="mt-3 max-w-4xl text-right text-sm leading-7 text-[#7c8882]">
                هر قرارداد با رابطه همکاری مشخص متصل است. روی شناسه یا عنوان آن
                کلیک کنید تا جزئیات کامل باز شود.
            </p>
        </div>
    );
}
