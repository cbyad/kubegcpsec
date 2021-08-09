import yaml from 'yaml'
import * as fs from 'fs'

const getSecret = (name: string, namespace: string, data: { [key: string]: string }) => yaml.stringify({
    apiVersion: "v1",
    kind: "Secret",
    metadata: { name, namespace },
    type: "Opaque",
    data
})

const encodeData = (data: { [key: string]: string }) => {
    const toBase64 = (key: string, value: string) => ({ [key]: Buffer.from(value, 'utf-8').toString('base64') })
    const keys = Object.keys(data), values = Object.values(data)
    return zipWith(keys, values, toBase64).reduce((acc, curr) => {
        const key = Object.keys(curr)[0]
        acc[key] = curr[key]
        return acc
    }, {})
}

const zipWith = <A, B, C>(as: readonly A[], bs: readonly B[], f: (a: A, b: B) => C): C[] => {
    const mins = Math.min(as.length, bs.length), cs: C[] = []
    for (let i = 0; i < mins; i++)
        cs[i] = f(as[i], bs[i])
    return cs
}

const tag = "[kubegcpsec] --- "
const log = (msg: string) => console.log(`${tag} ${msg}`)
const logError = (msg: string) => console.error(`${tag} - ${msg}`)

const kubegcpsec = (name: string, namespace: string, input: string, output?: string) => {
    log('start generate')
    try {
        const testData = fs.readFileSync(input)
        log(`local file ${input} has been read with success`)
        const encoded = encodeData(JSON.parse(testData.toString()))
        log(`all secrets has been encoded into base64`)
        const secret = getSecret(name, namespace, encoded)
        fs.writeFileSync(output || 'secrets.yaml', secret)
        log(`k8s secrets manifests succesfully built under ${output || 'secrets.yaml'}`)
    } catch (error) {
        logError(String(error))
    }
}

const main = () => {
    kubegcpsec("toto", "toto-namespace", "/Users/mac/Desktop/WT/dev/secret-generator/secret.json", "")
}
main()
