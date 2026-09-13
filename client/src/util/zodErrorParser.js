export function zodErrorParser(zodError) {
  return zodError.issues[0]?.message ?? 'Invalid workflow details'
}