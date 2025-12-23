//{roleid}

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import { RoleDTO } from "app/role/role-model";
import useDocumentTitle from "app/common/use-document-title";
import { useNavigate, useParams } from "react-router";
import { ResourceDTO } from "./resource-model";
import { handleServerError } from "app/common/utils";


export default function AssignResourceToRole() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const params = useParams();

    const [role, setRole] = useState<RoleDTO | null>(null);
    const [availableResources, setAvailableResources] = useState<ResourceDTO[]>([]);
    const [assignedResources, setAssignedResources] = useState<ResourceDTO[]>([]);
    const [selectedResourceId, setSelectedResourceId] = useState<string>('');
    
    const title = role && role.roleName ? `${t('resource.assignResource.headline')} to ${role.roleName}` : t('resource.assignResource.headline');
    useDocumentTitle(title);

    useEffect(()=>{
        const raw = (params as any)?.roleid ?? (params as any)?.id ?? null;
        if (!raw) return;
        const id = parseInt(raw, 10);
        if (Number.isNaN(id)) return;

        let mounted = true;
        const load = async () => {
            try{
                const resp = await axios.get(`/api/roles/${id}`);
                if (mounted) setRole(resp.data);

                const responseResource = await axios.get('/api/resources');
                const available: ResourceDTO[] = [];
                const assigned: ResourceDTO[] = [];
                responseResource.data.forEach((item: any) => {
                    if (resp.data.roleResources?.includes(item.id)) assigned.push(item);
                    else available.push(item);
                });
                if (mounted) {
                    setAvailableResources(available);
                    setAssignedResources(assigned);
                }
            
            }catch(error:any){
                handleServerError(error, navigate);
            }  
        }

        load();
        return () => { mounted = false; };
    }, [params, navigate, t]);

    const assignResource = async (e: React.FormEvent) => {

        
        e.preventDefault();
        if (!selectedResourceId || !role) return;
        try {
            const selIdNum = parseInt(selectedResourceId, 10);
            const newRoleResources = Array.from(new Set([...(role.roleResources || []), selIdNum]));
            const resp = await axios.put(`/api/roles/${role.id}`, { ...role, roleResources: newRoleResources });
            setRole(resp.data);
            // update local lists
            const assignedItem = availableResources.find(r => r.id === selIdNum);
            if (assignedItem) {
                setAssignedResources(prev => [...prev, assignedItem]);
                setAvailableResources(prev => prev.filter(r => r.id !== selIdNum));
            }
            setSelectedResourceId('');
        } catch (error: any) {
            handleServerError(error, navigate);
        }
             
    }

    const unassignResource = async (resourceId: number| null | undefined) => {
        if (!role) return;
        const confirmMsg = t('resource.assignResource.confirmUnassign') || 'Are you sure you want to unassign this resource?';
        if (!window.confirm(confirmMsg)) return;
        try {
            // re-fetch latest role to avoid stale data
            const respRole = await axios.get(`/api/roles/${role.id}`);
            const latestRole = respRole.data;
            const newRoleResources = (latestRole.roleResources || []).filter((id: number) => id !== resourceId);
            const resp = await axios.put(`/api/roles/${role.id}`, { ...latestRole, roleResources: newRoleResources });

            setRole(resp.data);
            // update local lists
            const unassignedItem = assignedResources.find(r => r.id === resourceId);
            if (unassignedItem) {
                setAvailableResources(prev => [...prev, unassignedItem]);
                setAssignedResources(prev => prev.filter(r => r.id !== resourceId));
            }
        } catch (error: any) {
            handleServerError(error, navigate);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-medium mb-4">{title}</h1>

            <form
                onSubmit={assignResource}
                className="mb-4"
            >
                
                <div className="flex items-center gap-2">
                    <label className="block mb-2">{t('resource.assignResource.resourceSelectLebel')}</label>
                    <select
                        value={selectedResourceId}
                        onChange={(e) => setSelectedResourceId(e.target.value)}
                        className="border rounded px-2 py-1"
                    >
                        <option value="">{t('resource.assignResource.resourceSelectLebel')}</option>
                        {availableResources.map((r, idx) => (
                            <option key={r.id ?? idx} value={String(r.id)}>{(r as any).resourceName || (r as any).name || String(r.id)}</option>
                        ))}
                    </select>
                    
                </div>
                <div className="flex items-center gap-2">
                        <button type="submit" className="bg-green-600 text-white px-3 py-1 rounded">{t('resource.assignResource.assignButton')}</button>
                </div>
                
            </form>

           

            <table className="min-w-full divide-y divide-gray-200 mt-6">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user.field.id') || 'ID'}</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('user.field.username') || 'Username'}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {Array.from(assignedResources.entries()).map(([id, resource]) => (
                        <tr key={id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.id}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{resource.resourceName}</td>
                         
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                                <button
                                    type="button"
                                    onClick={() => unassignResource(resource.id)}
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