# Discord Bot

A personal Discord bot with music playback, voice clip recording, and a story proofreader.

## Features

- **General** — ping, a greeting, and rock-paper-scissors
- **Music** — search and play YouTube audio in a voice channel, with a queue, skip, and stop
- **Voice clips** — record a short clip of someone talking and replay it later
- **Story proofreading** — check a short story for spelling and grammar errors before posting it to a site like WebNovel

## Commands

### General
| Command | Description |
| --- | --- |
| `/ping` | Replies with the bot's latency |
| `/hello` | Says hello back to you |
| `/rps` | Play rock-paper-scissors against the bot |

### Music
| Command | Description |
| --- | --- |
| `/play song:<name>` | Search YouTube and play a song, or add it to the queue if something's already playing |
| `/queue` | Show the current song and what's up next |
| `/skip` | Skip the current song |
| `/stop` | Stop playback, clear the queue, and leave voice |
| `/join` | Bring the bot into your voice channel ahead of time (e.g. before recording) |
| `/leave` | Disconnect the bot from voice |

### Voice clips
| Command | Description |
| --- | --- |
| `/record name:<clip> [user]` | Record a short clip of yourself (or someone else) talking. Starts capturing immediately and stops automatically after a pause |
| `/clip name:<clip>` | Play back a saved clip (autocompletes existing names) |
| `/deleteclip name:<clip>` | Delete a clip — only the person who recorded it, or a moderator (Manage Messages), can delete it |

### Story proofreading
| Command | Description |
| --- | --- |
| `/proofread` | Opens a form to paste a story (up to 4,000 characters per run). Replies privately with a list of spelling, grammar, and punctuation fixes plus a corrected copy as a `.txt` file. Uses the free [LanguageTool](https://languagetool.org/) API, so no key is needed |

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 22+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp), installed as a system binary (used for `/play`):
  ```
  brew install yt-dlp
  ```
- A Discord application with a bot user, created at the [Discord Developer Portal](https://discord.com/developers/applications). No privileged intents (Message Content, Server Members, Presence) need to be enabled — the bot only uses the default `Guilds` and `GuildVoiceStates` intents.

### Install

```
npm install
```

### Configure

Copy `.env.example` to `.env` and fill in:

```
DISCORD_TOKEN=   # your bot's token, from the Developer Portal
CLIENT_ID=       # your application's client ID
GUILD_ID=        # the server (guild) ID to register commands to
```

### Register commands and run

```
npm run deploy   # registers slash commands with Discord (run again after adding/changing commands)
npm start        # starts the bot
```

## Data storage

The bot stores runtime data locally, gitignored:

- `clips/<guildId>/` — recorded voice clips (`.ogg`) and a `_metadata.json` tracking who recorded each one

None of this is committed to the repository, so it won't carry over if you move the bot to a different machine or clone a fresh copy.
