import UserDetailsHeader from './UserDetailsHeader';
import UserRecordCard from './UserRecordCard';
import UserAccessControl from './UserAccessControl';
import AdminDecisionForm from './AdminDecisionForm';


export default function UserDetailsPage({ user }) {
    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <UserDetailsHeader user={user} />

            <section className="grid items-stretch gap-5 xl:grid-cols-[1.8fr_0.95fr]">
                <UserRecordCard user={user} />

                <UserAccessControl user={user} />
            </section>

            <AdminDecisionForm userId={user.id} />
        </div>
    );
}
