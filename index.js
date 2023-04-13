export default async function timeout({ promise, ms }) {
  if (ms == null || ms <= 0) {
    return await promise
  }
  return await Promise.race([
    promise,
    new Promise(async (_, rej) => {
      await new Promise(r => setTimeout(r, ms))
      rej(new Error('Timeout error.'))
    })
  ])
}