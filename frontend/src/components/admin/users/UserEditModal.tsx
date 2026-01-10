import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Typography,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { UserWithProfile, UserGroup } from '@/types';
import { api } from '@/lib/api';

interface UserEditModalProps {
    open: boolean;
    onClose: () => void;
    user: UserWithProfile | null;
    onSave: (userId: string, role: string, groupId: string | null) => Promise<void>;
}

export default function UserEditModal({ open, onClose, user, onSave }: UserEditModalProps) {
    const [role, setRole] = useState('');
    const [groupId, setGroupId] = useState<string>('');
    const [groups, setGroups] = useState<UserGroup[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (open) {
            fetchGroups();
        }
    }, [open]);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setGroupId(user.group_id || '');
        }
    }, [user]);

    const fetchGroups = async () => {
        try {
            const data = await api.getUserGroups();
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await onSave(user.id, role, groupId || null);
            onClose();
        } catch (error) {
            console.error('Failed to update user:', error);
            alert('사용자 정보 수정에 실패했습니다.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!user) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle>사용자 정보 수정</DialogTitle>
            <DialogContent>
                <Typography variant="subtitle2" gutterBottom>
                    {user.name} ({user.phone})
                </Typography>

                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>역할</InputLabel>
                    <Select
                        value={role}
                        label="역할"
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <MenuItem value="customer">사용자 (Customer)</MenuItem>
                        <MenuItem value="companion">동행인 (Companion)</MenuItem>
                        <MenuItem value="admin">관리자 (Admin)</MenuItem>
                    </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>그룹</InputLabel>
                    <Select
                        value={groupId}
                        label="그룹"
                        onChange={(e) => setGroupId(e.target.value)}
                    >
                        <MenuItem value="">선택 안 함</MenuItem>
                        {groups.map((group) => (
                            <MenuItem key={group.id} value={group.id}>
                                {group.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>취소</Button>
                <Button onClick={handleSave} variant="contained" disabled={isLoading}>
                    {isLoading ? '저장 중...' : '저장'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
