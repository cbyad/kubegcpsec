# GCP_SECRET_GENERATOR
We can store our secrets in **GCP secret manager**. But in order to store secrets safely in a public or private Git repository (gitops), we use Bitnami’s **sealed-secrets** controller and encrypt our Kubernetes Secrets into SealedSecrets. The sealed secrets can be decrypted only by the controller running in our cluster and nobody else can obtain the original secret, even if they have access to the Git repository.
**kubegcpsec** help us to do all of the process easily.

# prerequistes
- kubectl
- kubeseal

# Features
- Generate from local file k8s secrets manifests used by kubeseal to generate sealed secrets [DONE]
- Generate from GCP secret manager k8s secrets manifests used by kubeseal to generate sealed secrets [TODO]
- Generate sealed secrets with kubeseal [TODO]

# Usage (TODO)
```
kubegcpsec --in toto.json --name toto --namespace toto-namespace --out toto-secrets.yaml
```