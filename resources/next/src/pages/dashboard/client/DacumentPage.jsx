import DocumentsHeader from '../../../features/client/documents/DocumentsHeader';
import DocumentsTabs from '../../../features/client/documents/DocumentsTabs';
import DocumentsNotice from '../../../features/client/documents/DocumentsNotice';
import DocumentsList from '../../../features/client/documents/DocumentsList';


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
