import SensitiveAccessHeader from './SensitiveAccessHeader';
import SensitiveAccessForm from './SensitiveAccessForm';

export default function SensitiveAccessPage() {
    return (
        <div className="mx-auto w-full max-w-[1500px]">
            <SensitiveAccessHeader />

            <SensitiveAccessForm />
        </div>
    );
}
