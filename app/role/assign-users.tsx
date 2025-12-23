import React, {useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useDocumentTitle from 'app/common/use-document-title';
import { useTranslation } from "react-i18next";
import { handleServerError } from "app/common/utils";
import axios from "axios";
import { UserDTO } from "app/user/user-model";
import { RoleDTO } from "app/role/role-model";

export default function AssignUsersToRole() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [userList, setUserList] = useState<Map<number, UserDTO>>(new Map());
    const [roleUserList, setRoleUserList] = useState<Map<number, UserDTO>>(new Map());
    const [roleId, setRoleId] = useState<number | null>(null);
    const [roleObj, setRoleObj] = useState<RoleDTO | null>(null);
    const [formError, setFormError] = useState<string|undefined>(undefined);
    const params = useParams();

    const title = roleObj && roleObj.roleName ? `${t('role.assignUsers.headline')} to ${roleObj.roleName}` : t('role.assignUsers.headline');
    useDocumentTitle(title);

    useEffect(() => {
        // wait until roleId is available before loading users for that role
        if (roleId == null) return;
        let mounted = true;
        const load = async () => {
            try {
                const response = await axios.get(`/api/users`);
                const map = new Map<number, UserDTO>();
                const mapRoleUsers = new Map<number, UserDTO>();
                response.data.forEach((item: any) => {
                    
                    if (item.userRoleRoles && Array.isArray(item.userRoleRoles) && roleId != null && item.userRoleRoles.includes(roleId)) {
                        mapRoleUsers.set(item.id, item);
                    }
                    else map.set(item.id, item);
                });
                if (mounted) {
                    setUserList(map);
                    setRoleUserList(mapRoleUsers);
                }
                



            } catch (error: any) {
                handleServerError(error, navigate);
            }
        };
        load();
        return () => { mounted = false; };
    }, [navigate, roleId]);

    // fetch role details once we have roleId
    useEffect(() => {
        if (roleId == null) return;
        let mounted = true;
        const loadRole = async () => {
            try {
                const resp = await axios.get(`/api/roles/${roleId}`);
                if (mounted) setRoleObj(resp.data as RoleDTO);
            } catch (error: any) {
                handleServerError(error, navigate);
            }
        };
        loadRole();
        return () => { mounted = false; };
    }, [roleId, navigate]);

    useEffect(() => {
        // read role id from route params: support both :roleid and :id
        const raw = (params as any)?.roleid ?? (params as any)?.id ?? null;
        if (!raw) {
            // missing role id — navigate back with error
            navigate('/roles', { state: { msgError: 'Role id is required' } });
            return;
        }
        const parsed = parseInt(raw, 10);
        if (Number.isNaN(parsed)) {
            navigate('/roles', { state: { msgError: 'Role id is invalid' } });
            return;
        }
        setRoleId(parsed);
    }, [params, navigate]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(undefined);
        try {
            const form = event.currentTarget as HTMLFormElement;
            const select = form.elements.namedItem('userId') as HTMLSelectElement | null;
            const selectedUserId = select && select.value ? parseInt(select.value, 10) : null;

            if (selectedUserId == null) {
                setFormError(t('role.assignUsers.selectUser') || 'User is required');
                return;
            }
            if (roleId == null) {
                setFormError('Role id is missing');
                return;
            }

            // fetch the user, add the role id to their userRoleRoles array and PUT back
            const resp = await axios.get(`/api/users/${selectedUserId}`);
            const userObj = resp.data as any;
            const currentRoles: number[] = Array.isArray(userObj.userRoleRoles) ? [...userObj.userRoleRoles] : [];
            if (!currentRoles.includes(roleId)) currentRoles.push(roleId);
            const payload = { ...userObj, userRoleRoles: currentRoles };
            await axios.put(`/api/users/${selectedUserId}`, payload);

            // update local state: move user from userList to roleUserList
            setRoleUserList(prev => {
                const m = new Map(prev);
                m.set(selectedUserId, payload);
                return m;
            });
            setUserList(prev => {
                const m = new Map(prev);
                m.delete(selectedUserId);
                return m;
            });

            navigate('/assignUsers/' + roleId, {
                state: {
                    msgSuccess: t('role.assignUsers.success')
                }
            });
            
            
            
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const resp = error.response;
                if (resp) {
                    const data = resp.data as any;
                    const serverMessage = data?.message || data?.error || resp.statusText || ('Server error: ' + resp.status);
                    setFormError(serverMessage);
                    return;
                }
                setFormError(t('server.unavailable') || 'Server unavailable');
                return;
            }
            handleServerError(error, navigate);
        }
    };

    const unassignUser = async (userId: number) => {
        if (roleId == null) {
            setFormError('Role id is missing');
            return;
        }
        const user = roleUserList.get(userId);
        const name = (user?.fullName && user.fullName.trim()) ? user.fullName : (user?.username ?? String(userId));
        const confirmed = window.confirm(t('role.assignUsers.confirmUnassign') || `Unassign ${name} from this role?`);
        if (!confirmed) return;
        try {
            // fetch latest user object, remove roleId from their userRoleRoles array and PUT back
            const resp = await axios.get(`/api/users/${userId}`);
            const userObj = resp.data as any;
            const currentRoles: number[] = Array.isArray(userObj.userRoleRoles) ? [...userObj.userRoleRoles] : [];
            const newRoles = currentRoles.filter(r => r !== roleId);
            const payload = { ...userObj, userRoleRoles: newRoles };
            await axios.put(`/api/users/${userId}`, payload);

            // update local state: remove from roleUserList and add back to userList
            setRoleUserList(prev => {
                const m = new Map(prev);
                m.delete(userId);
                return m;
            });
            setUserList(prev => {
                const m = new Map(prev);
                m.set(userId, payload);
                return m;
            });
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                const resp = error.response;
                if (resp) {
                    const data = resp.data as any;
                    const serverMessage = data?.message || data?.error || resp.statusText || ('Server error: ' + resp.status);
                    setFormError(serverMessage);
                    return;
                }
                setFormError(t('server.unavailable') || 'Server unavailable');
                return;
            }
            handleServerError(error, navigate);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-medium mb-4">{title}</h1>

            {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded">
                    {formError}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                    <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">{t('role.assignUsers.selectUser') || 'Select user'}</label>
                    <select id="userId" name="userId" className="block w-full rounded border-gray-300 px-3 py-2">
                        <option value="">{t('role.assignUsers.selectUser') || '-- choose --'}</option>
                        {Array.from(userList.entries()).map(([id, user]) => (
                            <option key={id} value={id}>{(user?.fullName && user.fullName.trim()) ? user.fullName : (user?.username ?? id)}</option>
                        ))}
                    </select>
                </div>

                <input type="submit" value={t('role.assignUsers.submit')} className="inline-block text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-300  focus:ring-4 rounded px-5 py-2 cursor-pointer mt-6" />
            </form>

            <table className="min-w-full divide-y divide-gray-200 mt-6">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user.field.id') || 'ID'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user.field.username') || 'Username'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user.field.fullName') || 'Full Name'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user.field.email') || 'Email'}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from(roleUserList.entries()).map(([id, user]) => (
                        <tr key={id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.username}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.fullName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <button
                                    type="button"
                                    onClick={() => unassignUser(id)}
                                    className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 hover:bg-red-200"
                                    aria-label={t('role.assignUsers.unassign') || 'Unassign'}
                                >
                                    ×
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

