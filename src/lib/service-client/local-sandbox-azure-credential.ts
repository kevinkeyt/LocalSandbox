import { AccessToken, GetTokenOptions, TokenCredential } from "@azure/core-auth"

export class LocalSandboxAzureCredential implements TokenCredential {
  constructor(private id: string) {}

  async getToken(
    _scopes: string | string[],
    _options?: GetTokenOptions,
  ): Promise<AccessToken | null> {
    return {
      token: this.id,
      expiresOnTimestamp: Infinity,
    }
  }
}
