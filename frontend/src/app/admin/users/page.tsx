'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { Add } from '@mui/icons-material';
import { api } from '@/lib/api';
import { UserWithProfile } from '@/types';
import UserListTable from '@/components/admin/users/UserListTable';
import UserFilter from '@/components/admin/users/UserFilter';
import UserEditModal from '@/components/admin/users/UserEditModal';

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserWithProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [editModalOpen, setEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserWithProfile | null>(null);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getUsers({
                role: roleFilter || undefined,
                is_active: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
            });
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    const handleEdit = (user: UserWithProfile) => {
        setSelectedUser(user);
        setEditModalOpen(true);
    };

    const handleSaveUser = async (userId: string, role: string, groupId: string | null) => {
        await api.updateUserRole(userId, role);
        if (groupId !== undefined) {
            await api.assignUserGroup(userId, groupId);
        }
        fetchUsers();
    };

    const handleDelete = async (user: UserWithProfile) => {
        if (confirm(`${user.name}님을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`)) {
            try {
                await api.deleteUser(user.id);
                fetchUsers();
            } catch (error) {
                console.error('Failed to delete user:', error);
                alert('사용자 삭제에 실패했습니다.');
            }
        }
    };

    const handleActivate = async (user: UserWithProfile) => {
        if (confirm(`${user.name}님의 계정을 활성화하시겠습니까?`)) {
            try {
                await api.activateUser(user.id);
                fetchUsers();
            } catch (error) {
                console.error('Failed to activate user:', error);
                alert('사용자 활성화에 실패했습니다.');
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    회원 관리
                </Typography>
            </Box>

            <UserFilter
                role={roleFilter}
                onRoleChange={setRoleFilter}
                status={statusFilter}
                onStatusChange={setStatusFilter}
            />

            <UserListTable
                users={users}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onActivate={handleActivate}
            />

            <UserEditModal
                open={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                user={selectedUser}
                onSave={handleSaveUser}
            />
        </Container>
    );
}
