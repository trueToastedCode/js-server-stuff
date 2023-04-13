export default function makeAmqpCallback (channel, controller) {
  return async function amqpCallback (rabbitMessage) {
    let result
    try {
      // parse controller and args from message
      const message = rabbitMessage.content.toString()
      // console.log(`[ ${new Date()} ] Received: ${message}`)
      const i = message.indexOf('{')
      const desired = i == -1 ? message : message.substring(0, i)
      // get controller
      const chosen = controller[desired]
      if (chosen) {
        // parse arguments
        let params
        try {
          params = i == -1 ? {} : JSON.parse(message.substring(i))
        } catch (e) {
          // failed to parse arguments
          result = {
            statusCode: 400,
            body: { error: 'Invalid controller parameters.' }
          }
        }
        if (!result) {
          // call controller
          try {
            result = await chosen(params)
          } catch (e) {
            // controller failed
            result = {
              statusCode: 500,
              body: { error: 'An unkown error occurred.' }
            }
          }
        }
      } else {
        // controller doesn't exist
        result = {
          statusCode: 400,
          body: { error: `Invalid controller: ${desired}` }
        }
      }
    } catch (e) {
      // failed to parse message
      result = {
        statusCode: 400,
        body: { error: 'Invalid message.' }
      }
    }
    // console.log(`[ ${new Date()} ] Sent: ${JSON.stringify(result)}`)
    // send result
    channel.sendToQueue(
      rabbitMessage.properties.replyTo,
      Buffer.from(JSON.stringify(result)),
      { correlationId: rabbitMessage.properties.correlationId }
    )
    channel.ack(rabbitMessage)
  }
}