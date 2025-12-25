// Global typings for Spotify Web Playback SDK used in MediaEmbed.
export {};

type SpotifyPlayerState = {
  paused: boolean;
} | null;

type SpotifyErrorPayload = {
  message: string;
};

type SpotifyPlayerInit = {
  name: string;
  getOAuthToken: (cb: (token: string) => void) => void;
  volume?: number;
};

type SpotifyReadyPayload = {
  device_id: string;
};

type SpotifyPlayer = {
  connect(): Promise<boolean>;
  disconnect(): void;
  addListener(event: 'ready', cb: (payload: SpotifyReadyPayload) => void): void;
  addListener(event: 'player_state_changed', cb: (state: SpotifyPlayerState) => void): void;
  addListener(event: 'initialization_error' | 'authentication_error' | 'account_error', cb: (payload: SpotifyErrorPayload) => void): void;
};

type SpotifyNamespace = {
  Player: new (options: SpotifyPlayerInit) => SpotifyPlayer;
};

declare global {
  namespace Spotify {
    type Player = SpotifyPlayer;
    type PlayerState = SpotifyPlayerState;
  }

  interface Window {
    Spotify?: SpotifyNamespace;
    onSpotifyWebPlaybackSDKReady?: () => void;
  }
}
