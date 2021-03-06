import { Command } from "types/common"
import { PREFIX } from "utils/constants"
import { composeEmbedMessage } from "utils/discordEmbed"
import set from "./set"
import remove from "./remove"
import info from "./info"

const actions: Record<string, Command> = {
  set,
  remove,
  info,
}

const command: Command = {
  id: "defaultrole",
  command: "defaultrole",
  brief: "Default Role Configuration",
  category: "Config",
  onlyAdministrator: true,
  run: async () => null,
  getHelpMessage: async (msg) => ({
    embeds: [
      composeEmbedMessage(msg, {
        usage: `${PREFIX}dr <action>`,
        footer: [`Type ${PREFIX}help dr <action> for a specific action!`],
        includeCommandsList: true,
      }),
    ],
  }),
  aliases: ["dr"],
  actions,
  colorType: "Server",
}

export default command
