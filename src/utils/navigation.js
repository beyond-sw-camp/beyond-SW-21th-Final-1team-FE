export const safeBack = (router, fallback = '/') => {
  const state = router?.options?.history?.state
  if (state?.back) {
    router.back()
    return
  }
  router.push(fallback)
}
