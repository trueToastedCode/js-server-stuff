export default function makeMakeApiAccess ({ amqp, EventEmitter, Id, timeout }) {
  return function makeApiAccess ({
    url, rpcQueue, replyQueue, defaultTimeoutMs = process.env.API_ACCESS_DEFAULT_TIMEOUT_MS
  }) {
    const channelPromise = new Promise(resolve => {
      amqp.connect(url, (connectionError, connection) => {
        if (connectionError) {
          throw new Error(connectionError)
        }
        connection.createChannel(function (channelError, channel) {
          if (channelError) {
            throw new Error(channelError)
          }
          channel.responseEmitter = new EventEmitter()
          channel.responseEmitter.setMaxListeners(0)
          channel.consume(
            replyQueue,
            message => {
              channel.responseEmitter.emit(
                message.properties.correlationId,
                message.content.toString()
              )
            },
            { noAck: true }
          )
          resolve(channel)
        })
      })
    })
    return async function sendRPCMessage ({ message, timeoutMs = defaultTimeoutMs }) {
      const channel = await channelPromise
      return await timeout({
        promise: new Promise(resolve => {
          const correlationId = Id.createId()
          channel.responseEmitter.once(correlationId, resolve)
          channel.sendToQueue(rpcQueue, Buffer.from(message), {
            correlationId,
            replyTo: replyQueue
          })
        }),
        ms: timeoutMs
      })
    }
  }
}