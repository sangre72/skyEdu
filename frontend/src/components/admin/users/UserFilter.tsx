import {
    Box,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    SelectChangeEvent,
    Tab,
    Tabs,
    TextField,
    Paper,
    InputAdornment,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface UserFilterProps {
    role: string;
    onRoleChange: (role: string) => void;
    status: string;
    onStatusChange: (status: string) => void;
}

export default function UserFilter({
    role,
    onRoleChange,
    status,
    onStatusChange,
}: UserFilterProps) {
    return (
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs
                    value={role || 'all'}
                    onChange={(_, newValue) => onRoleChange(newValue === 'all' ? '' : newValue)}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="전체" value="all" sx={{ fontWeight: 'bold' }} />
                    <Tab label="사용자" value="customer" sx={{ fontWeight: 'bold' }} />
                    <Tab label="동행인" value="companion" sx={{ fontWeight: 'bold' }} />
                    <Tab label="관리자" value="admin" sx={{ fontWeight: 'bold' }} />
                </Tabs>
            </Box>

            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <TextField
                    size="small"
                    placeholder="이름 또는 전화번호로 검색..."
                    sx={{ flexGrow: 1 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon color="action" fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>상태 필터</InputLabel>
                    <Select
                        value={status}
                        label="상태 필터"
                        onChange={(e: SelectChangeEvent) => onStatusChange(e.target.value)}
                    >
                        <MenuItem value="">전체 상태</MenuItem>
                        <MenuItem value="active">활성 계정</MenuItem>
                        <MenuItem value="inactive">비활성 계정</MenuItem>
                    </Select>
                </FormControl>
            </Box>
        </Paper>
    );
}
