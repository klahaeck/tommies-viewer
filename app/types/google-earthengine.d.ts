declare module '@google/earthengine' {
  const ee: {
    initialize(): void;
    data: {
      authenticateViaApiKey(
        apiKey: string,
        onSuccess: () => void,
        onError: (error: any) => void
      ): void;
      setProjectId(projectId: string): void;
    };
  };
  export = ee;
}
