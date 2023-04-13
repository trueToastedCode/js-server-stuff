import bcrypt from 'bcrypt'

const Hash = Object.freeze({
    compareSync: bcrypt.compareSync,
    hashSync: (plain) => bcrypt.hashSync(plain, 10)
})

export default Hash