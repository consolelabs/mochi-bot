import { Command } from "types/common"
import { composeEmbedMessage, getErrorEmbed } from "utils/discordEmbed"
import Community from "adapters/community"
import { Message } from "discord.js"
import { PREFIX } from "utils/constants"

const command: Command = {
  id: "invite_leaderboard",
  command: "leaderboard",
  brief: "Show top 10 inviters.",
  category: "Community",
  run: async function leaderboard(msg: Message) {
    const resp = await Community.getInvitesLeaderboard(msg.guild.id)
    if (resp.error) {
      const errorEmbed = getErrorEmbed({ msg, description: resp.error })
      return {
        messageOptions: {
          embeds: [errorEmbed],
        },
      }
    }

    const data = resp.data
    if (!data || !data.length) {
      const embed = composeEmbedMessage(msg, {
        title: "Info",
        description: "Leaderboard is empty",
      })
      return {
        messageOptions: {
          embeds: [embed],
        },
      }
    }

    const embedMsg = composeEmbedMessage(msg, {
      title: `Invites Leaderboard`,
    })

    const respMsg: string[] = []
    data.forEach((d: any) => {
      respMsg.push(
        `<@${d.inviter_id}>  (regular: ${d.regular}, fake: ${d.fake}, left: ${d.left})`
      )
    })
    embedMsg.addField(`Top 10`, respMsg.join("\n"))

    return {
      messageOptions: {
        embeds: [embedMsg],
      },
    }
  },
  getHelpMessage: async (msg) => {
    const embed = composeEmbedMessage(msg, {
      usage: `${PREFIX}invite leaderboard`,
      examples: `${PREFIX}invite leaderboard\n${PREFIX}invite lb`,
      footer: [`Type ${PREFIX}help invite <action> for a specific action!`],
    })

    return { embeds: [embed] }
  },
  canRunWithoutAction: true,
  aliases: ["lb"],
  colorType: "Command",
}

export default command
