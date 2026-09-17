import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import MicIcon from '@mui/icons-material/Mic'
import MusicNoteIcon from '@mui/icons-material/MusicNote'
import VolumeUpIcon from '@mui/icons-material/VolumeUp'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import CssBaseline from '@mui/material/CssBaseline'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { ThemeProvider } from '@mui/material/styles'
import { useRef, useState, type PointerEvent } from 'react'
import { MusicTab } from './tabs/MusicTab'
import { SpeakTab } from './tabs/SpeakTab'
import { TranscribeTab } from './tabs/TranscribeTab'
import { AppFooter } from './components/AppFooter'
import { AudioEditor } from './components/AudioEditor'
import {theme} from "./theme.ts";

const STAGE = { width: { xs: '96%', sm: '88%' }, mx: 'auto' } as const

const tabs = [
    { label: 'Озвучка', icon: <VolumeUpIcon sx={{ fontSize: 18 }} /> },
    { label: 'Музыка', icon: <MusicNoteIcon sx={{ fontSize: 18 }} /> },
    { label: 'Диктовка', icon: <MicIcon sx={{ fontSize: 18 }} /> },
] as const

export default function App() {
  const [tab, setTab] = useState(1)
  const [tabsOpen, setTabsOpen] = useState(true)
  const [editorOpen, setEditorOpen] = useState(true)
  const [split, setSplit] = useState(0.55)
  const splitRef = useRef<HTMLDivElement | null>(null)

  function toggleTabs() {
    setTabsOpen((v) => {
      if (v && !editorOpen) setEditorOpen(true)
      return !v
    })
  }

  function toggleEditor() {
    setEditorOpen((v) => {
      if (v && !tabsOpen) setTabsOpen(true)
      return !v
    })
  }

  function onSplitDown(e: PointerEvent<HTMLDivElement>) {
    const root = splitRef.current
    if (!root || !tabsOpen || !editorOpen) return
    e.preventDefault()
    try {
      e.currentTarget.setPointerCapture(e.pointerId)
    } catch {
      /* synthetic / lost pointer */
    }
    const move = (ev: globalThis.PointerEvent) => {
      const r = root.getBoundingClientRect()
      setSplit(Math.max(0.18, Math.min(0.82, (ev.clientY - r.top) / Math.max(1, r.height))))
    }
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      document.body.style.removeProperty('cursor')
      document.body.style.removeProperty('user-select')
    }
    document.body.style.cursor = 'row-resize'
    document.body.style.userSelect = 'none'
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
            <Box className="cyber-bg" sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <Box
                  component="header"
                  sx={{
                    flexShrink: 0,
                    zIndex: 20,
                    px: 2,
                    pt: 2,
                    pb: 1.5,
                    background: 'linear-gradient(180deg, rgba(7,6,12,0.75) 0%, rgba(7,6,12,0.35) 70%, transparent 100%)',
                    backdropFilter: 'blur(12px)',
                  }}
              >
{/*Logo*/}
                <Stack className='com-logo' spacing={2} sx={{ alignItems: 'center' }}>
                  <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                    <Box
                        component="img"
                        src="/compozitorium-logo.png"
                        alt=""
                        sx={{
                          width: 52,
                          height: 52,
                          borderRadius: '16px',
                          objectFit: 'cover',
                          border: '1px solid rgba(255,255,255,0.12)',
                          boxShadow: '0 10px 32px rgba(0,240,255,0.28), 0 0 0 1px rgba(255,43,214,0.15)',
                        }}
                    />
                    <Box>
                      <Typography
                          sx={{
                            fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
                            fontWeight: 800,
                            fontSize: 22,
                            letterSpacing: '-0.02em',
                            lineHeight: 1.05,
                          }}
                      >
                          Compozitorium{' '}
                        <Box component="span" sx={{ color: 'secondary.main' }}>
                          Ai
                        </Box>
                      </Typography>
                      <Typography
                          sx={{
                            color: 'rgba(255, 196, 120, 0.9)',
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            fontSize: 10,
                            fontWeight: 600,
                            mt: 0.25,
                          }}
                      >
                        Audio Studio
                      </Typography>
                    </Box>
                  </Stack>
{/*Menu*/}
                <Box sx={{ position: 'relative', width: 'max-content' }}>
                    <Box
                        className="nav-pill"
                        role="tablist"
                        sx={{
                          display: 'flex',
                          width: 'max-content',
                          gap: 0.5,
                          p: 0.5,
                          borderRadius: 999,
                          background: 'rgba(10, 12, 22, 0.55)',
                          border: '2px solid rgba(255,255,255,0.1)',
                          backdropFilter: 'blur(18px) saturate(1.3)',
                          boxShadow: '0 12px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)',
                        }}
                    >
                      {tabs.map((t, i) => {
                        const active = tab === i
                        return (
                            <Box
                                key={t.label}
                                component="button"
                                role="tab"
                                aria-selected={active}
                                onClick={() => setTab(i)}
                                sx={{
                                  appearance: 'none',
                                  border: 0,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0,
                                  gap: 0.75,
                                  py: 1.1,
                                  px: 1.75,
                                  borderRadius: 999,
                                  fontFamily: '"DM Sans", system-ui, sans-serif',
                                  fontSize: 13,
                                  fontWeight: 600,
                                  letterSpacing: '-0.01em',
                                  color: active ? '#001018' : 'rgba(200,220,235,0.65)',
                                  background: active
                                      ? 'linear-gradient(135deg, #00f0ff 0%, #7af0ff 45%, #ff8fd9 100%)'
                                      : 'transparent',
                                  boxShadow: active ? '0 4px 20px rgba(0,240,255,0.35)' : 'none',
                                  transition: 'background 0.25s ease, color 0.2s ease, box-shadow 0.25s ease',
                                  '&:hover': {
                                    color: active ? '#001018' : '#e8fbff',
                                    background: active
                                        ? 'linear-gradient(135deg, #00f0ff 0%, #7af0ff 45%, #ff8fd9 100%)'
                                        : 'rgba(255,255,255,0.05)',
                                  },
                                }}
                            >
                              {t.icon}
                              {t.label}
                            </Box>
                        )
                      })}
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Box
                  ref={splitRef}
                  sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}
              >
                <Box
                    sx={{
                      ...STAGE,
                      display: 'flex',
                      flexDirection: 'column',
                      flex: tabsOpen ? (editorOpen ? `${split} 1 0` : '1 1 0') : '0 0 36px',
                      minHeight: tabsOpen ? 80 : 36,
                      minWidth: 0,
                      position: 'relative',
                      zIndex: 1,
                      pl: '5px',
                    }}
                >
                  <PaneToggle
                      open={tabsOpen}
                      onToggle={toggleTabs}
                      collapseLabel="Свернуть вкладки"
                      expandLabel="Развернуть вкладки"
                      up
                  />
                  {tabsOpen && (
                      <Container
                          maxWidth={false}
                          disableGutters
                          className="stage-scroll"
                          sx={{ flex: 1, minHeight: 0, overflow: 'auto', pb: 1, pr: 5 }}
                      >
                        <Box sx={{ display: tab === 0 ? 'block' : 'none' }}>
                          <SpeakTab />
                        </Box>
                        <Box sx={{ display: tab === 1 ? 'block' : 'none' }}>
                          <MusicTab />
                        </Box>
                        <Box sx={{ display: tab === 2 ? 'block' : 'none' }}>
                          <TranscribeTab />
                        </Box>
                      </Container>
                  )}
                </Box>
{/*Разделитель AI инструментов и редактора*/}
                {tabsOpen && editorOpen && (
                    <Box
                        role="slider"
                        tabIndex={0}
                        aria-orientation="horizontal"
                        aria-label="Размер панелей"
                        aria-valuemin={18}
                        aria-valuemax={82}
                        aria-valuenow={Math.round(split * 100)}
                        onPointerDown={onSplitDown}
                        onDoubleClick={() => setSplit(0.55)}
                        sx={{
                          flexShrink: 0,
                          height: 20,
                          mx: { xs: '2%', sm: '6%' },
                          cursor: 'row-resize',
                          touchAction: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 3,
                          outline: 'none',
                          '&:hover > span, &:active > span, &:focus-visible > span': {
                            bgcolor: 'primary.main',
                            boxShadow: '0 0 10px #00f0ff',
                          },
                        }}
                    >
                      <Box
                          component="span"
                          sx={{
                            width: 200,
                            height: 7,
                            borderRadius: 99,
                            bgcolor: 'rgba(255,255,255,0.22)',
                            transition: 'background 0.15s, box-shadow 0.15s',
                          }}
                      />
                    </Box>
                )}
                <Box
                    sx={{
                      ...STAGE,
                      display: 'flex',
                      flexDirection: 'column',
                      flex: editorOpen ? (tabsOpen ? `${1 - split} 1 0` : '1 1 0') : '0 0 36px',
                      minHeight: editorOpen ? 80 : 36,
                      minWidth: 0,
                      overflow: 'hidden',
                      position: 'relative',
                      zIndex: 2,
                      pl: '5px',
                      pb: editorOpen ? 10 : 0,
                    }}
                >
                  <PaneToggle
                      open={editorOpen}
                      onToggle={toggleEditor}
                      collapseLabel="Свернуть редактор"
                      expandLabel="Развернуть редактор"
                  />
                  {editorOpen && (
                      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', pr: 5 }}>
                        <AudioEditor />
                      </Box>
                  )}
                </Box>
              </Box>
              <AppFooter />
            </Box>
      </ThemeProvider>
  )
}

function PaneToggle({
                      open,
                      onToggle,
                      collapseLabel,
                      expandLabel,
                      up = false,
                    }: {
  open: boolean
  onToggle: () => void
  collapseLabel: string
  expandLabel: string
  up?: boolean
}) {
  const label = open ? collapseLabel : expandLabel
  const Icon = open === up ? ExpandLessIcon : ExpandMoreIcon
  return (
      <Tooltip title={label}>
        <IconButton
            size="small"
            onClick={onToggle}
            aria-label={label}
            aria-pressed={open}
            sx={{
              position: 'absolute',
              top: 2,
              right: 10,
              zIndex: 4,
              color: 'text.secondary',
              bgcolor: 'rgba(7,6,12,0.55)',
              '&:hover': { bgcolor: 'rgba(7,6,12,0.85)', color: 'primary.main' },
            }}
        >
          <Icon fontSize="small" />
        </IconButton>
      </Tooltip>
  )
}
