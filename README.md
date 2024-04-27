# Welcome at Manifest

Manifest is an open-source platform that provides alternative user interfaces for Conjur services.

![Dashboard](static/dashboard-screenshot_2024_04_11.png)

## Installing and Running Manifest

There are two ways to start using Manifest:

- **with Docker**: See the [Local Installation Guides][Install Local Manifest] documentation.

[Install Local Manifest]: /#1-install-local-manifest-with-docker 'Install Local Manifest'

- **with Kubernetes**:

  - [Install K8s][Install K8s]

  [Install K8s]: /#21-install-kubernetes-k8s 'Install K8s'

  - [K8s + Manifest + Conjur Open Source Environment][K8s + Manifest + Conjur Open Source Environment]

  [K8s + Manifest + Conjur Open Source Environment]: /#22-k8s--manifest--conjur-open-source-environment 'K8s + Manifest + Conjur Open Source Environment'

  - [K8s + Manifest + Config your Existing Conjur K8s Setup][K8s + Manifest + Config your Existing Conjur K8s Setup]

  [K8s + Manifest + Config your Existing Conjur K8s Setup]: /#23-k8s--manifest--your-existing-conjur-kubernetes-setup 'K8s + Manifest + Config your Existing Conjur K8s Setup'

[Install Local Manifest]: /#1-install-local-manifest-with-docker 'Install Local Manifest'

## 1. Install Local Manifest with Docker

> [!NOTE]
> Before you begin, ensure you have the following prerequisites:
>
> - [Docker](https://docs.docker.com/get-docker/)
> - [Docker-Compose](https://docs.docker.com/compose/install/)

1. Clone this project repository.
2. Navigate to the repository folder by using the `cd` commands.
3. Go to folder `conjur-tooling`:

   ```bash
   cd conjur-tooling
   ```

4. Start the Docker container by using the below command. You may need to use `sudo` if you don't have permission to run docker-compose:

   ```bash
   docker compose up -d
   ```

   **Verification:** When the required images are successfully pulled, the terminal returns the following:

   ```bash
   [+] Running 7/8
   ✔ Network conjur              Created
   ✔ Container bot_app           Created
   ✔ Container conjur-pgadmin-1  Created
   ✔ Container postgres_database Created
   ✔ Container openssl           Created
   ✔ Container conjur_server     Created
   ✔ Container nginx_proxy       Created
   ✔ Container conjur_client     Created
   ```

5. Create an account named `default`:

   ```bash
   docker exec conjur_server conjurctl account create default > admin-data
   ```

   **Verification:** When the account is generated, the terminal returns the following:

   ```bash
   Created new account 'default'
   ```

6. Connect the Conjur client to the Conjur server

   This is a one-time action. For the duration of the container’s life or until additional initcommand is issued, the Conjur client and the Conjur server remain connected.

   Use the account name that you created in step 5. You will be prompted to trust the TLS certificate of the Conjur server. Type y to trust the certificate:

   ```bash
   docker exec -it conjur_client conjur init -u https://proxy -a default --self-signed
   ```

   **Verification:** The terminal returns the following output:

   ```bash
   Wrote certificate to /root/conjur-server.pem
   Wrote configuration to /root/.conjurrc
   ```

7. Log in as the **admin** user using the `API key for admin` key from the `conjur-tooling/admin-data` file. Replace `{api-key}` with this key and run the following command.

   ```bash
   docker exec conjur_client conjur login -i admin -p {api-key}
   ```

   **Verification:** The terminal returns the following output:

   ```bash
   Logged in
   ```

8. Set your own admin password:

   ```bash
   docker exec conjur_client conjur user change-password -p CONJUR_password1
   ```

   **Verification:** The terminal returns the following output:

   ```bash
   Password changed
   ```

9. Rename the `.env.example` file to `.env` and setup your own variables or let the default values.

> [!IMPORTANT]
> If you are running Conjur on a local machine, make sure that NODE_TLS_REJECT_UNAUTHORIZED is set to 0 in your environment

| **Setup for Developers**                                                                                                                                                     | **Setup for Users**                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10. Install project dependencies:                                                                                                                                            | 10. Install project dependencies:                                                                                                                                                                         |
| `pnpm install`                                                                                                                                                               | `pnpm install`                                                                                                                                                                                            |
| 11. Start a development server:                                                                                                                                              | 11. Create a production version of Manifest App with the following command:                                                                                                                               |
| `pnpm run dev`                                                                                                                                                               | `pnpm run build`                                                                                                                                                                                          |
| 12. Open the local URL which is provided by the terminal returns and wait for the server to come up. Once the server is up and running, you can access Manifest at this URL. | 12. Run Manifest App |
| 13. 🚀 Check: Enhance Your Development Experience with Recommended VS Code Extensions 🚀                                                                                     | `pnpm run preview`                                                                                                                                                                                        |

> [!IMPORTANT]
> Before login at Manifest Platform the Nginx_proxy Contanier should run at Docker. Check if the Conjur Server is Running at https://localhost:8443/.

To Login, the default account name is `default` the default username is `admin` and the default password is `CONJUR_password1`.

### Enhance Your Development Experience with Recommended VS Code Extensions

To streamline your development workflow and take full advantage of our project's features, we recommend installing the following Visual Studio Code extensions:

1. [Svelte for VS Code](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
2. [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
3. [JavaScript and TypeScript Nightly](https://marketplace.visualstudio.com/items?itemName=ms-vscode.vscode-typescript-next)
4. [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
5. [Prettier ESLint](https://marketplace.visualstudio.com/items?itemName=rvest.vs-code-prettier-eslint)
6. [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
7. [Conventional Commits](https://marketplace.visualstudio.com/items?itemName=vivaxy.vscode-conventional-commits)

When you open this project in Visual Studio Code, you may be prompted to install these recommended extensions. We encourage you to accept this recommendation to optimize your coding experience and leverage the full potential of our project.

Happy coding! ✨

## 2. Install Manifest on Kubernetes Cluster

### 2.1. Install Kubernetes (k8s)

> [!NOTE]
> Before you begin, ensure you have the following prerequisites:
>
> 1. Install Helm package manager on your local machine. See the official Helm documentation for your operating system. [your operating system](https://helm.sh/docs/intro/install/#through-package-managers).
> 2. Install and configure `kubectl` to interact with your Kubernetes cluster. Follow the below guides available on the official Kubernetes documentation for instructions on how to install `kubectl` on your specific operating system:
>
>    - [MacOS using Homebrew](https://kubernetes.io/docs/tasks/tools/install-kubectl-macos/#install-with-homebrew-on-macos)
>    - [Linux using native package management](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#install-using-native-package-management)
>    - [Windows using Chocolatey, Scoop, or winget](https://kubernetes.io/docs/tasks/tools/install-kubectl-windows/#install-nonstandard-package-tools)
>
> 3. Set up a Kubernetes cluster and persistent volume on your preferred platform for hosting the Kubernetes cluster.

### 2.2. K8s + Manifest + Conjur Open Source Environment

1. Install the Conjur OSS Helm Chart:

   ```bash
   CONJUR_NAMESPACE=<conjur-namespace>
   kubectl create namespace "$CONJUR_NAMESPACE"
   DATA_KEY="$(docker run --rm cyberark/conjur data-key generate)"
   HELM_RELEASE=<helm-release>
   VERSION=<conjur-oss-chart-version>
   helm install \
   -n "$CONJUR_NAMESPACE" \
   --set dataKey="$DATA_KEY" \
   --set account.create=true \
   --set image.tag=1.20.0-4262 \
   "$HELM_RELEASE" \
   https://github.com/cyberark/conjur-oss-helm-chart/releases/download/v$VERSION/conjur-oss-$VERSION.tgz
   ```

2. Retrieve the admin API Key

   ```bash
   CONJUR_ACCOUNT=<conjur-account-name>
   CONJUR_NAMESPACE=<conjur-namespace>
   HELM_RELEASE=<helm-release>
   POD_NAME=$(kubectl get pods --namespace "$CONJUR_NAMESPACE" \
            -l "app=conjur-oss,release=$HELM_RELEASE" \
            -o jsonpath="{.items[0].metadata.name}")
   kubectl exec --namespace "$CONJUR_NAMESPACE" \
            "$POD_NAME" \
            --container=conjur-oss \
            -- conjurctl role retrieve-key "$CONJUR_ACCOUNT":user:admin | tail -1
   ```

3. Procceed with the installation of Manifest by following the steps in the K8s Manifest + Your Existing Conjur Kubernetes Setup section.

### 2.3. K8s + Manifest + Your Existing Conjur Kubernetes Setup

> [!NOTE]
> Before you begin, ensure you have the following prerequisites:
>
> - [Conjur OSS](https://www.conjur.org/get-started/quick-start/oss-environment/) (version Version 1.20.0-4262 or later)
> - Conjur Authn authentication works.

Follow these steps to install Manifest:

1. Create a folder named `manifest` on your machine for deployment and data storage. Then, navigate to this folder using the `cd` command.

2. Generate the values.yaml file with:

   ```bash
   helm show values oci://ghcr.io/codefactoryhu/manifest-chart  > values.yaml
   ```

3. Run the below command to deploy Manifest:

   ```bash
   helm install manifest oci://ghcr.io/codefactoryhu/manifest-chart -n <conjur-namespace> -f values.yaml
   ```

4. Get pod name with:

   ```bash
   kubectl get pods -n <conjur-namespace>
   ```

   _The above command displays the status of the pods. Proceed to the next step once the pod status is shown as RUNNING._

5. To access and verify the installation locally, use the below command that forwards the port 8080 to port 8080:

   ```bash
   kubectl --namespace <conjur-namespace> port-forward <manifest-pod> 8080:8080
   ```

6. Open <http://localhost:8080> and wait for the server to come up. This can take up to 5 minutes. Once the server is up and running, you can access Manifest at <http://localhost:8080>.

#### Values.yaml documentation

| Key                 | Type    | Default                       | Description                                                                     |
| ------------------- | ------- | ----------------------------- | ------------------------------------------------------------------------------- |
| conjurApiUrl        | string  | <https://conjur-oss>          | The Conjur API URL that's accessible within the namespace                       |
| httpSecureCookie    | boolean | false                         | Wether or not the to use secure cookies on Manifest                             |
| conjurTlsSecretName | string  | conjur-oss-conjur-ssl-ca-cert | The name of the TLS secret that contains the certificate the Conjur API uses    |
