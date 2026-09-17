import Stack from '@mui/material/Stack'
import { TabHeader } from '../components/tabs/TabHeader'

export function MusicTab(){
  return (
    <Stack spacing={2} sx={{ p: 1, pb: 3 }}>
      <TabHeader
        title="Музыка"
        subtitle={`Создавайте музыкальные треки.`}
      />
    </Stack>
  )
}
