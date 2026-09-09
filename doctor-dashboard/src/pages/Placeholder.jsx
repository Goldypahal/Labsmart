export default function Placeholder({ title }) {
    return (
        <div className="flex items-center justify-center h-full min-h-[50vh] border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-12 text-center">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{title} Module</h2>
                <p className="text-gray-500 dark:text-gray-400">This module is currently under development.</p>
            </div>
        </div>
    );
}
