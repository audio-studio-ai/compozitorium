import Stack from '@mui/material/Stack'
import { TabHeader } from '../components/tabs/TabHeader'

export function TranscribeTab(){
    return (
        <Stack spacing={2} sx={{ p: 1, pb: 3 }}>
            <TabHeader
                title="Диктовка"
                subtitle="Транскрибация звука (вокал / песни)."
            />
        </Stack>
    )
}