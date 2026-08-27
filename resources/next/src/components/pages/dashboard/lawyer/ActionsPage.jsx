import ActionsHeader from './(actions)/ActionsHeader';
import RequiredActions from './(actions)/RequiredActions';


const ActionsPage = () => {
    return (
        <div className="mt-10 px-10 py-12">
            <ActionsHeader/>

            <RequiredActions />
        </div>
    );
};

export default ActionsPage;
