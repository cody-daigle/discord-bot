# Discord Bot

A personal Discord bot with music playback, voice clip recording, and a lightweight digital companion for the *Artifakt: Brickquest* tabletop game.

## Features

- **General** — ping, a greeting, and rock-paper-scissors
- **Music** — search and play YouTube audio in a voice channel, with a queue, skip, and stop
- **Voice clips** — record a short clip of someone talking and replay it later
- **Artifakt: Brickquest rulebook** — browse the full rulebook in Discord via an interactive dropdown
- **Artifakt Lite** — character sheets, dice rolling, and a Builder-run monster tracker for playing the game digitally

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

### Artifakt: Brickquest rulebook
| Command | Description |
| --- | --- |
| `/brickquest` | Browse the rulebook via a dropdown menu, with a link to the full interactive rulebook |

### Artifakt Lite (digital character tracker)
| Command | Description |
| --- | --- |
| `/character create name:<> class:<>` | Create (or replace) your character; stats auto-fill from your class |
| `/character sheet [user]` | View a character's Heart, Defense, Attack die, Trick, and Skill |
| `/heart action:<add\|remove\|set> amount:<> [user]` | Adjust Heart (HP). Adjusting someone else's requires Manage Messages |
| `/roll [sides]` | Roll a die (d4/d6/d8/d10/d20, defaults to d20) |
| `/damage` | Roll your class's own damage die |
| `/attack target:<monster>` | Roll to hit a tracked monster; auto-rolls damage and depletes its Heart on a hit |
| `/monster spawn name:<> [template] [heart] [defense] [damage]` | *(Builder only)* Start tracking a monster, from a rulebook template or custom stats |
| `/monster sheet name:<>` | View a tracked monster's stats |
| `/monster hp name:<> action:<> amount:<>` | *(Builder only)* Adjust a monster's Heart |
| `/monster remove name:<>` | *(Builder only)* Stop tracking a monster |
| `/monster list` | List all currently tracked monsters |

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
- `data/characters/<guildId>.json` — player characters
- `data/monsters/<guildId>.json` — tracked monster encounters

None of this is committed to the repository, so it won't carry over if you move the bot to a different machine or clone a fresh copy.
