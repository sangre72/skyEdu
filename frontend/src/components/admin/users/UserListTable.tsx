import {
    Chip,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
} from '@mui/material';
import { Edit, Delete, CheckCircle, Cancel } from '@mui/icons-material';
import { UserWithProfile } from '@/types';
import dayjs from 'dayjs';

interface UserListTableProps {
    users: UserWithProfile[];
    onEdit: (user: UserWithProfile) => void;
    onDelete: (user: UserWithProfile) => void;
    onActivate: (user: UserWithProfile) => void;
}

export default function UserListTable({
    users,
    onEdit,
    onDelete,
    onActivate,
}: UserListTableProps) {
    const getRoleLabel = (role: string) => {
        switch (role) {
            case 'admin':
                return <Chip label="관리자" color="error" size="small" />;
            case 'companion':
                return <Chip label="동행인" color="primary" size="small" />;
            default:
                return <Chip label="사용자" color="default" size="small" />;
        }
    };

    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>이름</TableCell>
                        <TableCell>전화번호</TableCell>
                        <TableCell>역할</TableCell>
                        <TableCell>그룹</TableCell>
                        <TableCell>상태</TableCell>
                        <TableCell>가입일</TableCell>
                        <TableCell align="right">관리</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {users.map((user) => (
                        <TableRow key={user.id}>
                            <TableCell>{user.name}</TableCell>
                            <TableCell>{user.phone}</TableCell>
                            <TableCell>{getRoleLabel(user.role)}</TableCell>
                            <TableCell>
                                {user.group ? (
                                    <Chip label={user.group.name} size="small" variant="outlined" />
                                ) : (
                                    '-'
                                )}
                            </TableCell>
                            <TableCell>
                                {user.is_active ? (
                                    <Chip
                                        icon={<CheckCircle />}
                                        label="활성"
                                        color="success"
                                        variant="outlined"
                                        size="small"
                                    />
                                ) : (
                                    <Chip
                                        icon={<Cancel />}
                                        label="비활성"
                                        color="default"
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            </TableCell>
                            <TableCell>
                                {dayjs(user.created_at).format('YYYY-MM-DD HH:mm')}
                            </TableCell>
                            <TableCell align="right">
                                {!user.is_active && (
                                    <Tooltip title="계정 활성화">
                                        <IconButton
                                            size="small"
                                            color="success"
                                            onClick={() => onActivate(user)}
                                        >
                                            <CheckCircle />
                                        </IconButton>
                                    </Tooltip>
                                )}
                                <Tooltip title="정보 수정">
                                    <IconButton size="small" onClick={() => onEdit(user)}>
                                        <Edit />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="삭제">
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => onDelete(user)}
                                    >
                                        <Delete />
                                    </IconButton>
                                </Tooltip>
                            </TableCell>
                        </TableRow>
                    ))}
                    {users.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                                사용자가 없습니다.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
