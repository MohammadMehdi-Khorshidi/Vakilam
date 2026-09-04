export function createCaseSummary(caseItem) {
    const missingItems = [];

    if (!caseItem.information?.opposingParty) {
        missingItems.push('نام طرف مقابل');
    }

    if (!caseItem.information?.amountRial) {
        missingItems.push('مبلغ خواسته');
    }

    if (!caseItem.information?.dueDate) {
        missingItems.push('تاریخ سررسید');
    }

    return {
        title: `خلاصه پرونده ${caseItem.code}`,

        text: [
            `موضوع پرونده «${caseItem.title}» است.`,

            `موکل ${caseItem.client} درخواست «${
                caseItem.information?.clientRequest ?? 'خواسته ثبت نشده'
            }» را مطرح کرده است.`,

            `طرف مقابل ${
                caseItem.information?.opposingParty ?? 'مشخص نشده'
            } است.`,

            `پرونده در دسته ${caseItem.category} و شهر ${caseItem.city} ثبت شده و فوریت آن ${caseItem.urgency} است.`,

            caseItem.information?.certificateStatus ??
                'وضعیت گواهی عدم پرداخت ثبت نشده است.',

            missingItems.length
                ? `اطلاعات ناقص: ${missingItems.join('، ')}.`
                : 'اطلاعات اصلی پرونده تکمیل است.',
        ].join('\n\n'),
    };
}

export function createLegalDraft(caseItem) {
    const amountRial = caseItem.information?.amountRial;

    const formattedAmount = amountRial
        ? new Intl.NumberFormat('fa-IR').format(amountRial)
        : 'مبلغ ثبت‌نشده';

    return {
        title: 'پیش‌نویس درخواست مطالبه وجه',

        text: `ریاست محترم مرجع صالح

با سلام

احتراماً، این پیش‌نویس براساس اطلاعات تأییدشده پرونده ${caseItem.code} تهیه شده است.

خواهان: ${caseItem.client}

خوانده: ${caseItem.information?.opposingParty ?? 'نام طرف مقابل تکمیل نشده است'}

خواسته: ${caseItem.information?.clientRequest ?? 'خواسته پرونده تکمیل نشده است'}

مبلغ مورد مطالبه: ${formattedAmount} ریال

شرح اولیه:
${caseItem.description}

با توجه به مدارک موجود و گواهی عدم پرداخت، تقاضای بررسی استحقاق موکل و اتخاذ اقدام قانونی متناسب مورد درخواست است.

تذکر:
این متن صرفاً پیش‌نویس نمایشی است و پیش از هرگونه ثبت یا استفاده باید توسط وکیل بررسی و اصلاح شود.`,
    };
}

export function filterLegalSources(sources, searchText) {
    const query = searchText.trim().toLowerCase();

    if (!query) {
        return sources;
    }

    return sources.filter((source) => {
        const searchableText = [
            source.title,
            source.description,
            ...source.tags,
        ]
            .join(' ')
            .toLowerCase();

        return searchableText.includes(query);
    });
}
