
import { users } from '../../../features/admin/users/usersData';
import UsersHeader from '../../../features/admin/users/UsersHeader';
import UsersTable from '../../../features/admin/users/UsersTable';

export default function UsersPage() {
    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <UsersHeader />

            <UsersTable users={users} />
        </div>
    );
}
