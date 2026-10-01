from __future__ import annotations

from typing import Any

import httpx

from .config_generated import DEFAULT_BASE_URL
from .rpc_generated import AsyncRawRoot, AsyncRoot, SyncRawRoot, SyncRoot
from .transport import (
    DEFAULT_MAX_RETRY_AFTER,
    AsyncHeaderProvider,
    AsyncTransport,
    SyncHeaderProvider,
    SyncTransport,
)


class Photon(SyncRoot):
    def __init__(
        self,
        *,
        base_url: str = DEFAULT_BASE_URL,
        headers: SyncHeaderProvider | None = None,
        timeout: float = 30.0,
        max_attempts: int = 3,
        client: httpx.Client | None = None,
        max_retry_after: float = DEFAULT_MAX_RETRY_AFTER,
    ) -> None:
        self._transport = SyncTransport(
            base_url=base_url,
            headers=headers,
            timeout=timeout,
            max_attempts=max_attempts,
            client=client,
            max_retry_after=max_retry_after,
        )
        super().__init__(self._transport)
        self.raw = SyncRawRoot(self._transport)

    def close(self) -> None:
        self._transport.close()

    def __enter__(self) -> Photon:
        return self

    def __exit__(self, *_: Any) -> None:
        self.close()


class AsyncPhoton(AsyncRoot):
    def __init__(
        self,
        *,
        base_url: str = DEFAULT_BASE_URL,
        headers: AsyncHeaderProvider | None = None,
        timeout: float = 30.0,
        max_attempts: int = 3,
        client: httpx.AsyncClient | None = None,
        max_retry_after: float = DEFAULT_MAX_RETRY_AFTER,
    ) -> None:
        self._transport = AsyncTransport(
            base_url=base_url,
            headers=headers,
            timeout=timeout,
            max_attempts=max_attempts,
            client=client,
            max_retry_after=max_retry_after,
        )
        super().__init__(self._transport)
        self.raw = AsyncRawRoot(self._transport)

    async def close(self) -> None:
        await self._transport.close()

    async def __aenter__(self) -> AsyncPhoton:
        return self

    async def __aexit__(self, *_: Any) -> None:
        await self.close()
