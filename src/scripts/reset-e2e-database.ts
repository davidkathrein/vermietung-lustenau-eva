import { unlink } from 'node:fs/promises'
import path from 'node:path'

const databaseName = 'hausvermietung-lustenau.e2e.db'
const databaseFiles = [databaseName, `${databaseName}-shm`, `${databaseName}-wal`]

for (const fileName of databaseFiles) {
  const filePath = path.join(process.cwd(), fileName)

  try {
    await unlink(filePath)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}
