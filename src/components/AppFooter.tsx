import GitHubIcon from '@mui/icons-material/GitHub'
import { openUrl } from '@tauri-apps/plugin-opener'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
const PROFILE = 'https://github.com/z-ev'
const ORG = 'https://github.com/audio-studio-ai'
function openExternal(url: string) {
  void openUrl(url).catch(() => {
    window.open(url, '_blank', 'noopener,noreferrer')
  })
}

const iconBtn = {
  width: 36,
  height: 36,
  color: 'rgba(200,220,235,0.7)',
  border: '2px solid transparent',
  transition: 'color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease',
  '&:hover': {
    color: '#e8fbff',
    background: 'rgba(0,240,255,0.08)',
    borderColor: 'rgba(0,240,255,0.35)',
  },
} as const

function Divider() {
  return (
    <Typography
      component="span"
      sx={{ width: 3, height: 16, bgcolor: 'rgba(255,255,255,0.12)', borderRadius: 1 }}
    />
  )
}

export function AppFooter() {
  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        left: '50%',
        bottom: 'max(12px, env(safe-area-inset-bottom))',
        transform: 'translateX(-50%)',
        zIndex: 30,
        width: 'max-content',
        maxWidth: 'calc(100vw - 24px)',
      }}
    >
      <Stack
        direction="row"
        spacing={0.75}
        sx={{
          alignItems: 'center',
          flexWrap: 'nowrap',
          px: 1,
          py: 0.5,
          borderRadius: 999,
          overflowX: 'auto',
          background: 'rgba(10, 12, 22, 0.72)',
          border: '2px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(18px) saturate(1.3)',
          boxShadow: '00 4px 20px rgba(0, 240, 255, 0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <Tooltip title="GitHub · z-ev">
          <IconButton
            component="a"
            href={PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              openExternal(PROFILE)
            }}
            aria-label="GitHub профиль z-ev"
            size="small"
            sx={iconBtn}
          >
            <GitHubIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Tooltip>

        <Divider />

        <Tooltip title="GitHub · audio-studio-ai">
          <IconButton
            component="a"
            href={ORG}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              e.preventDefault()
              openExternal(ORG)
            }}
            aria-label="Организация audio-studio-ai"
            size="small"
            sx={{ ...iconBtn, p: 0.5 }}
          >
            <Box
              component="img"
              src="/compozitorium-logo.png"
              alt=""
              sx={{ width: 22, height: 22, borderRadius: '7px', objectFit: 'cover', display: 'block' }}
            />
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  )
}
