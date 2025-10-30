import React from 'react';
import { Role } from '../../types';

interface RoleFilterProps {
    activeRole: Role;
    setRole: (role: Role) => void;
}

export const RoleFilter: React.FC<RoleFilterProps> = ({ activeRole, setRole }) => {
    const roles: { id: Role; label: string }[] = [
        { id: 'Austin', label: "Austin's View" },
        { id: 'Angie', label: "Angie's View" },
        { id: 'Shared', label: 'Shared View' }
    ];

    return (
        <div className="flex justify-center items-center bg-slate-100 rounded-xl p-1.5 space-x-2">
            {roles.map(role => (
                <button
                    key={role.id}
                    onClick={() => setRole(role.id)}
                    className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 w-full ${
                        activeRole === role.id 
                            ? 'bg-white text-indigo-900 shadow-md' 
                            : 'text-slate-600 hover:bg-white/60'
                    }`}
                >
                    {role.label}
                </button>
            ))}
        </div>
    );
};