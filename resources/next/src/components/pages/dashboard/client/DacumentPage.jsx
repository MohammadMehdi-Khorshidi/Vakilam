import DocumentsHeader from './(Documents)/DocumentsHeader';
import DocumentsTabs from './(Documents)/DocumentsTabs';
import DocumentsNotice from './(Documents)/DocumentsNotice';
import DocumentsList from './(Documents)/DocumentsList';


const DocumentsPage = () => {
    return (
        <main dir="rtl" className="min-h-screen bg-[#f7f9f8] px-5 py-8 lg:px-8">
            <div className="mx-auto max-w-[1290px]">
                <DocumentsHeader />

                <DocumentsTabs />

                <DocumentsNotice />

                <DocumentsList />
            </div>
        </main>
    );
};

export default DocumentsPage;
