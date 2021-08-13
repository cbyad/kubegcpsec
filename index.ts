#!/usr/bin/env node

import { Command } from 'commander'
import * as fs from 'fs'
import yaml from 'yaml'

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

const kubegcpsec = (name: string, namespace: string, input: string, output: string) => {
    const tag = "[kubegcpsec] --- "
    const log = (msg: string) => console.log(`${tag} ${msg}`)
    const logError = (msg: string) => console.error(`${tag} - ${msg}`)

    log('start generate')
    try {
        const testData = fs.readFileSync(input)
        log(`local file ${input} has been read with success`)
        const encoded = encodeData(JSON.parse(testData.toString()))
        log(`all secrets has been encoded into base64`)
        const secret = getSecret(name, namespace, encoded)
        fs.writeFileSync(output, secret)
        log(`k8s secrets manifests succesfully built under ${output}`)
    } catch (error) {
        logError(String(error))
    }
}

const main = () => {
    const program = new Command()
    program
        .version('0.0.1', '-v, --version')
        .description("A tool to generate k8s secrets manifests")
        .option('-f, --filename <input-file>', 'input file with your .json key-value pairs')
        .option('-n, --name <secret-name>', 'secret name')
        .option('-N, --namespace <app-namespace>', 'your app namespace')
        .option('-o, --output <output-file>', 'generated k8s secrets manifest .yaml')
        .parse(process.argv)

    if (process.argv.slice(2).length == 0) { program.outputHelp(); return }

    const options = program.opts()
    const filename = options.input, name = options.name, namespace = options.namespace
    if (filename && name && namespace) {
        const output = options.output || 'secrets.yaml'
        kubegcpsec(name, namespace, filename, output)
        return
    }
    program.outputHelp()
}

main()
