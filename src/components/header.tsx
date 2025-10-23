import Link from 'next/link';
export default function Header() {
    return (
        <header className="bg-blue-600 text-white shadow-md">
            <nav className="container mx-auto flex justify-between items-center p-4">

                <div className="text-2xl font-bold tracking-wide">
                    NextPWA
                </div>

                <div className="flex gap-6">
                    <Link href="/" className="hover:text-gray-200 transition-colors">Home</Link>
                    <Link href="/reception" className="hover:text-gray-200 transition-colors">Reception</Link>
                    <Link href="/room" className="hover:text-gray-200 transition-colors">Chat</Link>
                    <Link href="/galleries" className="hover:text-gray-200 transition-colors">Galeries photo</Link>
                    <Link href="/camera" className="hover:text-gray-200 transition-colors">Camera</Link>
                </div>

            </nav>
        </header>

    );
}
