import Stack from '@mui/material/Stack'
import {EditorHeader} from "./audio-editor/EditorHeader.tsx";

export function AudioEditor() {

  return (
    <Stack spacing={1} className="com-editor-panel " sx={{ p: 1.5, borderRadius: 1 }}>
      <EditorHeader
          title="Редактор"
          subtitle="Редактируйте звуковые дорожки и экспортируйте результат"
      />
    </Stack>
  )
}
