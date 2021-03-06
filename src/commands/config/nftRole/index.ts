import { Command } from "types/common"
import { getCommandArguments } from "utils/commands"
import { PREFIX } from "utils/constants"
import { composeEmbedMessage, getErrorEmbed } from "utils/discordEmbed"
import Config from "../../../adapters/config"
import list from "./list"
import remove from "./remove"

const actions: Record<string, Command> = {
  list,
  remove,
}

const command: Command = {
  id: "nftrole",
  command: "nftrole",
  brief: "Set a role that users will get when they own specific amount of NFT",
  category: "Config",
  onlyAdministrator: true,
  run: async function (msg) {
    const args = getCommandArguments(msg)
    const [roleArg, nftAddress, amountArg, tokenId] = args.slice(1)
    if (!roleArg.startsWith("<@&") || !roleArg.endsWith(">")) {
      return {
        messageOptions: {
          embeds: [getErrorEmbed({ msg, description: "Invalid role" })],
        },
      }
    }
    const roleId = roleArg.substring(3, roleArg.length - 1)
    const role = await msg.guild.roles.fetch(roleId)
    if (!role) {
      return {
        messageOptions: {
          embeds: [getErrorEmbed({ msg, description: "Role not found" })],
        },
      }
    }

    const amount = +amountArg
    if (isNaN(amount))
      return {
        messageOptions: {
          embeds: [
            getErrorEmbed({ msg, description: "amount has to be a number" }),
          ],
        },
      }

    const nfts: any[] = await Config.getAllNFTCollections()
    const nft = nfts.find(
      (nft) => nft.address.toLowerCase() === nftAddress.toLowerCase()
    )
    if (!nft) {
      return {
        messageOptions: {
          embeds: [
            getErrorEmbed({
              msg,
              description: "Unsupported NFT Address",
            }),
          ],
        },
      }
    }

    if (nft.erc_format == "1155" && !tokenId) {
      return {
        messageOptions: {
          embeds: [
            getErrorEmbed({
              msg,
              description: "Token ID is required for ERC-1155 NFT",
            }),
          ],
        },
      }
    }

    await Config.newGuildNFTRoleConfig({
      guild_id: msg.guildId,
      role_id: roleId,
      nft_collection_id: nft.id,
      number_of_tokens: amount,
      token_id: tokenId,
    })

    return {
      messageOptions: {
        embeds: [
          composeEmbedMessage(msg, {
            description: `Successfully configured role <@&${
              role.id
            }> for ${amount} ${nft.symbol} ${tokenId ? `No.${tokenId}` : ""}`,
          }),
        ],
      },
    }
  },
  getHelpMessage: async (msg) => ({
    embeds: [
      composeEmbedMessage(msg, {
        usage: `${PREFIX}nr <role> <nft_address> <amount> [erc1155_token_id]\n${PREFIX}nr <action>`,
        examples: `${PREFIX}nr @Mochi 0x7aCeE5D0acC520faB33b3Ea25D4FEEF1FfebDE73 1`,
        includeCommandsList: true,
      }),
    ],
  }),
  canRunWithoutAction: true,
  aliases: ["nr"],
  actions,
  colorType: "Server",
  minArguments: 4,
}

export default command
