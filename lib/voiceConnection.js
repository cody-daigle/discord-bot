import { joinVoiceChannel, getVoiceConnection, entersState, VoiceConnectionStatus } from '@discordjs/voice';

/** Reuses the guild's existing voice connection if there is one, otherwise joins and waits until ready. Returns null on failure. */
export async function ensureVoiceConnection(voiceChannel) {
  const existing = getVoiceConnection(voiceChannel.guild.id);
  if (existing) return existing;

  const connection = joinVoiceChannel({
    channelId: voiceChannel.id,
    guildId: voiceChannel.guild.id,
    adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    // Discord's voice server withholds incoming audio entirely from a self-deafened
    // client, which would silently break /record. Connections are shared across
    // features, so this has to be false here regardless of which feature joins first.
    selfDeaf: false,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
  } catch (error) {
    connection.destroy();
    console.error(error);
    return null;
  }

  return connection;
}
