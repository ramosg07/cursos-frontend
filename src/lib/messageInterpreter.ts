const isHTML = RegExp.prototype.test.bind(/^(<([^>]+)>)$/i)

export const serializeError = (err: unknown) =>
  JSON.parse(JSON.stringify(err, Object.getOwnPropertyNames(err)))

export const MessageInterpreter = (message: any): string => {
  try {
    const errorMessage = serializeError(message)
    return (
      errorMessage.mensaje ??
      errorMessage.message ??
      errorMessage.error ??
      'Solicitud errónea 🚨'
    )
  } catch (e) {
    return isHTML(message) ? 'Solicitud errónea 🚨' : `${message}`
  }
}
