import RestartAltIcon from '@mui/icons-material/RestartAlt'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

type Props = {
  title: string
  subtitle: string
  onReset?: () => void
}

export function EditorHeader({ title, subtitle, onReset }: Props) {
  return (
    <Stack spacing={1.5}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
        <Typography
          variant="h5"
          component="h1"
          className="com-title"
          sx={{ fontSize: { xs: 22, sm: 26 } }}
        >
          {title}
        </Typography>
        {onReset && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            startIcon={<RestartAltIcon />}
            onClick={onReset}
            sx={{ flexShrink: 0, minHeight: 36, px: 1.5 }}
          >
            Вернуть
          </Button>
        )}
      </Box>
      <Typography color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.5 }}>
        {subtitle}
      </Typography>
    </Stack>
  )
}
