
import { users } from './(users)/usersData';
import UsersHeader from './(users)/UsersHeader';
import UsersTable from './(users)/UsersTable';

export default function UsersPage() {
    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <UsersHeader />

            <UsersTable users={users} />
        </div>
    );
}
