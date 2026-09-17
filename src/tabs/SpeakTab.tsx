import Stack from '@mui/material/Stack'
import { TabHeader } from '../components/tabs/TabHeader'

export function SpeakTab(){
  return (
      <Stack spacing={2} sx={{ p: 1, pb: 3 }}>
        <TabHeader
            title="Озвучка"
            subtitle="Озвучивайте текст."
        />
      </Stack>
  )
}