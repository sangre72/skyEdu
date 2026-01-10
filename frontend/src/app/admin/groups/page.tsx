'use client';

import { useEffect, useState } from 'react';
import {
    Box,
    Typography,
    Button,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Chip,
    Tooltip,
} from '@mui/material';
import { Add, Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { api } from '@/lib/api';
import { UserGroup } from '@/types';
import dayjs from 'dayjs';

export default function AdminGroupsPage() {
    const [groups, setGroups] = useState<UserGroup[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<UserGroup | null>(null);

    // Form state
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    const fetchGroups = async () => {
        setIsLoading(true);
        try {
            const data = await api.getUserGroups();
            setGroups(data);
        } catch (error) {
            console.error('Failed to fetch groups:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchGroups();
    }, []);

    const handleOpenModal = (group?: UserGroup) => {
        if (group) {
            setEditingGroup(group);
            setName(group.name);
            setDescription(group.description || '');
        } else {
            setEditingGroup(null);
            setName('');
            setDescription('');
        }
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setEditingGroup(null);
        setName('');
        setDescription('');
    };

    const handleSave = async () => {
        try {
            if (editingGroup) {
                await api.updateUserGroup(editingGroup.id, { name, description });
            } else {
                await api.createUserGroup({ name, description });
            }
            handleCloseModal();
            fetchGroups();
        } catch (error) {
            console.error('Failed to save group:', error);
            alert('그룹 저장에 실패했습니다.');
        }
    };

    const handleDelete = async (group: UserGroup) => {
        if (confirm(`'${group.name}' 그룹을 삭제하시겠습니까?`)) {
            try {
                await api.deleteUserGroup(group.id);
                fetchGroups();
            } catch (error) {
                console.error('Failed to delete group:', error);
                alert('그룹 삭제에 실패했습니다.');
            }
        }
    };

    const handleToggleActive = async (group: UserGroup) => {
        try {
            await api.updateUserGroup(group.id, { is_active: !group.is_active });
            fetchGroups();
        } catch (error) {
            console.error('Failed to toggle group status:', error);
            alert('상태 변경에 실패했습니다.');
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    유저 그룹 관리
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpenModal()}
                >
                    그룹 추가
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>그룹명</TableCell>
                            <TableCell>설명</TableCell>
                            <TableCell>상태</TableCell>
                            <TableCell>생성일</TableCell>
                            <TableCell align="right">관리</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {groups.map((group) => (
                            <TableRow key={group.id}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>
                                    {group.name}
                                </TableCell>
                                <TableCell>{group.description || '-'}</TableCell>
                                <TableCell>
                                    {group.is_active ? (
                                        <Chip
                                            icon={<CheckCircle />}
                                            label="활성"
                                            color="success"
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleToggleActive(group)}
                                        />
                                    ) : (
                                        <Chip
                                            icon={<Cancel />}
                                            label="비활성"
                                            color="default"
                                            variant="outlined"
                                            size="small"
                                            onClick={() => handleToggleActive(group)}
                                        />
                                    )}
                                </TableCell>
                                <TableCell>
                                    {dayjs(group.created_at).format('YYYY-MM-DD')}
                                </TableCell>
                                <TableCell align="right">
                                    <Tooltip title="수정">
                                        <IconButton size="small" onClick={() => handleOpenModal(group)}>
                                            <Edit />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="삭제">
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(group)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {groups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                                    등록된 그룹이 없습니다.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog open={modalOpen} onClose={handleCloseModal} maxWidth="xs" fullWidth>
                <DialogTitle>{editingGroup ? '그룹 수정' : '새 그룹 추가'}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="그룹명"
                        fullWidth
                        variant="outlined"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="설명"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal}>취소</Button>
                    <Button onClick={handleSave} variant="contained">
                        저장
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
