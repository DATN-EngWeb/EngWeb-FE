// components/Student/Common/ListPartTab.jsx
'use client';

import { Box, Typography } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
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
 * Tab hiển thị Part với badge progress góc dưới-phải dạng tam giác.
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
        ...listeningtestStyles.boxPart,
        width: 'auto',
        minWidth: '80px',
        height: '36px',
        px: '10px',
        flexDirection: 'row',
        flexShrink: 0,
        // Cần cho badge absolute + cắt tam giác
        position: 'relative',
        overflow: 'hidden',
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

      {/* ── Tam giác góc dưới-phải: In-Progress (chấm than đỏ/cam) ── */}
      {showBadge && status === 'in-progress' && (
        <Box
          component="span"
          aria-label={`${unanswered} câu chưa làm`}
          sx={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '24px',
            height: '24px',
            // Tạo hình tam giác vuông góc dưới-phải
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            backgroundColor: 'warning.main',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            pb: '3px',
            pr: '4px',
          }}
        >
          <Box
            component="span"
            sx={{
              fontSize: '11px',
              lineHeight: 1,
              color: '#fff',
              fontWeight: 800,
              userSelect: 'none',
            }}
          >
            !
          </Box>
        </Box>
      )}

      {/* ── Tam giác góc dưới-phải: Completed (check xanh) ── */}
      {showBadge && status === 'completed' && (
        <Box
          component="span"
          aria-label="Đã hoàn thành"
          sx={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '24px',
            height: '24px',
            clipPath: 'polygon(100% 0, 100% 100%, 0 100%)',
            backgroundColor: 'success.main',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'flex-end',
            pb: '3px',
            pr: '3px',
          }}
        >
          <CheckIcon
            sx={{
              fontSize: '11px',
              color: '#fff',
              stroke: '#fff',
              strokeWidth: 1,
            }}
          />
        </Box>
      )}
    </Box>
  );
}
