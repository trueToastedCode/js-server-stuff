import amqp from 'amqplib/callback_api'
import EventEmitter from 'events'

import Id from '../Id'
import timeout from '../timeout'
import makeApiAccess from './make-make-api-access'
import makeExampleApi from './example-api'

const makeApiAccess = makeMakeApiAccess({ amqp, EventEmitter, Id, timeout })
const exampleApi = makeExampleApi({ makeApiAccess })

const apiAccess = Object.freeze({ exampleApi })

export default apiAccess
export { exampleApi }