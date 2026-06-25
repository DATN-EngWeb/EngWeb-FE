// components/Student/Common/ListPartTab.jsx
'use client';

import { Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { listeningtestStyles } from '@/styles/Student/Listening/listeningTestStyles';

const STATUS_STYLES = {
  default: {},
  'in-progress': {
    borderColor: 'warning.main',
    color: 'primary.main',
    '&:hover': { borderColor: 'warning.dark' },
  },
  completed: {
    borderColor: 'success.main',
    color: 'success.dark',
    '&:hover': { borderColor: 'success.dark' },
  },
};

/**
 * Tab hiển thị Part với badge progress (1 dòng duy nhất).
 *
 * @param {number}   props.index      - Index của tab (0-based), dùng để hiển thị "Part N+1"
 * @param {boolean}  props.isActive   - Tab này đang được xem không
 * @param {'default'|'in-progress'|'completed'} props.status
 * @param {number}   props.unanswered - Số câu chưa làm (hiển thị khi status = 'in-progress')
 * @param {Function} props.onClick
 * @param {object}   [props.sx]       - Extra sx (vd: responsive hiding)
 */
export default function ListPartTab({ index, isActive, status, unanswered, onClick, sx = {} }) {
  const statusSx = STATUS_STYLES[status] ?? {};

  // Active style luôn override status style
  const activeSx = isActive
    ? {
        backgroundColor: 'background.default',
        borderColor: 'orange.light',
        color: 'orange.dark',
      }
    : {};

  // Badge chỉ hiển thị khi KHÔNG active
  const showBadge = !isActive && status !== 'default';

  return (
    <Box
      onClick={onClick}
      sx={{
        // Base style (giữ các thuộc tính của boxPart, override width/height)
        ...listeningtestStyles.boxPart,
        width: 'auto', // Tự co giãn theo nội dung
        minWidth: '80px', // Không nhỏ hơn 80px
        height: '36px', // Giữ nguyên chiều cao cố định — 1 dòng
        px: '10px', // Tăng padding ngang để có khoảng thở cho badge
        flexDirection: 'row', // Đảm bảo 1 dòng ngang
        gap: '6px', // Khoảng cách giữa label và badge
        flexShrink: 0,
        transition: 'border-color 0.18s ease, background-color 0.18s ease',
        ...statusSx,
        ...activeSx,
        ...sx,
      }}
    >
      {/* Label: "Part N" */}
      <Typography
        component="span"
        sx={{
          fontSize: '0.9rem',
          fontWeight: 600,
          lineHeight: 1,
          whiteSpace: 'nowrap',
          color: 'inherit',
        }}
      >
        Part {index + 1}
      </Typography>

      {/* Badge In-Progress: pill đỏ với số câu chưa làm */}
      {showBadge && status === 'in-progress' && (
        <Box
          component="span"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '18px',
            height: '18px',
            borderRadius: '999px',
            backgroundColor: 'error.main',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            lineHeight: 1,
            px: '4px',
            flexShrink: 0,
          }}
        >
          {unanswered}
        </Box>
      )}

      {/* Badge Completed: icon checkmark xanh lá */}
      {showBadge && status === 'completed' && (
        <CheckCircleIcon
          sx={{
            fontSize: '14px',
            color: 'success.main',
            flexShrink: 0,
          }}
        />
      )}
    </Box>
  );
}
