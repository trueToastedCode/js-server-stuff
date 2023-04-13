export default function makeExampleApi ({ makeApiAccess }) {
  const sendRPCMessage = makeApiAccess({
    url: process.env.EXAMPLE_API_URL,
    rpcQueue: process.env.EXAMPLE_API_RPC_QUEUE,
    replyQueue: process.env.EXAMPLE_API_REPLY_QUEUE
  })

  return Object.freeze({
    someFunction
  })

  async function someFunction (args) {
    let result = await sendRPCMessage({
      message: `someFunction${JSON.stringify(args)}`
    })
    result = proccessResult(result)
    // for this example, result shall contain a key "whatever"
    return result.body.whatever
  }

  function proccessResult (result) {
    if (!result) {
      throw new Error('Empty result.')
    }
    result = JSON.parse(result)
    if (result.statusCode !== 200) {
      throw new Error(result.body.error)
    }
    return result
  }
}