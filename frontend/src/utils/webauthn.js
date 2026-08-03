const base64urlToBuffer = (value) => {
    const padding = '='.repeat((4 - value.length % 4) % 4)
    const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/')
    const binary = window.atob(base64)
    return Uint8Array.from(binary, (character) => character.charCodeAt(0)).buffer
}

const bufferToBase64url = (value) => {
    const bytes = new Uint8Array(value)
    let binary = ''
    bytes.forEach((byte) => { binary += String.fromCharCode(byte) })
    return window.btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

const creationOptionsFromJSON = (options) => {
    if (window.PublicKeyCredential?.parseCreationOptionsFromJSON) {
        return window.PublicKeyCredential.parseCreationOptionsFromJSON(options)
    }
    return {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        user: {...options.user, id: base64urlToBuffer(options.user.id)},
        excludeCredentials: (options.excludeCredentials || []).map((credential) => ({
            ...credential,
            id: base64urlToBuffer(credential.id),
        })),
    }
}

const requestOptionsFromJSON = (options) => {
    if (window.PublicKeyCredential?.parseRequestOptionsFromJSON) {
        return window.PublicKeyCredential.parseRequestOptionsFromJSON(options)
    }
    return {
        ...options,
        challenge: base64urlToBuffer(options.challenge),
        allowCredentials: (options.allowCredentials || []).map((credential) => ({
            ...credential,
            id: base64urlToBuffer(credential.id),
        })),
    }
}

const credentialToJSON = (credential) => {
    if (credential.toJSON) return credential.toJSON()

    const response = credential.response
    const serializedResponse = {
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
    }

    if (response.attestationObject) {
        serializedResponse.attestationObject = bufferToBase64url(response.attestationObject)
        serializedResponse.transports = response.getTransports?.() || []
    } else {
        serializedResponse.authenticatorData = bufferToBase64url(response.authenticatorData)
        serializedResponse.signature = bufferToBase64url(response.signature)
        serializedResponse.userHandle = response.userHandle
            ? bufferToBase64url(response.userHandle)
            : null
    }

    return {
        id: credential.id,
        rawId: bufferToBase64url(credential.rawId),
        response: serializedResponse,
        type: credential.type,
        authenticatorAttachment: credential.authenticatorAttachment,
        clientExtensionResults: credential.getClientExtensionResults(),
    }
}

export const createBiometricCredential = async (options) => {
    const credential = await navigator.credentials.create({
        publicKey: creationOptionsFromJSON(options),
    })
    return credentialToJSON(credential)
}

export const getBiometricCredential = async (options) => {
    const credential = await navigator.credentials.get({
        publicKey: requestOptionsFromJSON(options),
    })
    return credentialToJSON(credential)
}
