import { Box, Stack, Skeleton, Divider } from "@mui/material";

export function SkeletonMenu() {
  return (
    <Box
      width="400px"
      bgcolor="white"
      display="flex"
      flexDirection="column"
      sx={{ pointerEvents: "all" }}
    >
      {/* Кнопка "Добавить организацию" */}
      <Skeleton variant="rectangular" height={40} sx={{ mb: 2 }} />

      {/* Картинка и логотип */}
      <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
      {/* <Skeleton variant="rectangular" width={80} height={40} sx={{ mb: 2 }} /> */}

      {/* Текстовые данные */}
      <Skeleton variant="text" width="60%" />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" sx={{ mb: 2 }} />

      {/* Список компаний */}
      <Stack
        spacing={2}
        sx={{ maxHeight: 480, overflowY: "auto", overflowX: "hidden" }}
        divider={<Divider />}
      >
        {[1, 2, 3].map((i) => (
          <Box key={i} display="flex" alignItems="center" gap={2} p={2}>
            <Skeleton variant="rectangular" width={80} height={80} />
            <Stack spacing={1} flex={1}>
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="40%" />
            </Stack>
          </Box>
        ))}
      </Stack>

      {/* Кнопки действий */}
      <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
      <Skeleton variant="rectangular" height={40} sx={{ mt: 1 }} />
    </Box>
  );
}
