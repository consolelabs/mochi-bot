import { Message } from "discord.js"
import { Command } from "types/common"
import { PREFIX } from "utils/constants"
import {
  composeEmbedMessage,
  getErrorEmbed,
  getPaginationRow,
  listenForPaginateAction,
} from "utils/discordEmbed"
import Community from "adapters/community"

async function composeNFTListEmbed(msg: Message, pageIdx: number) {
  const data = await Community.getCurrentNFTCollections({
    page: pageIdx,
  })
  if (!data.data || !data.data.length) {
    return {
      messageOptions: {
        embeds: [
          getErrorEmbed({
            msg,
            description: "No NFT collections found",
          }),
        ],
      },
    }
  }

  const { names, symbols, chains } = data.data.reduce(
    (acc: any, cur: any, i: number) => ({
      names: [...acc.names, `#${++i + data.page * data.size}. ${cur.name}`],
      symbols: [...acc.symbols, `${cur.symbol}`],
      chains: [...acc.chains, `${cur.chain}`],
    }),
    {
      names: [],
      symbols: [],
      chains: [],
    }
  )

  const totalPage = Math.ceil(data.total / data.size)
  const embed = composeEmbedMessage(msg, {
    title: "Newly Supported NFT collections",
    footer: [`Page ${pageIdx + 1} / ${totalPage}`],
  })
    .addField("Name", `${names.join("\n")}\n\u200B`, true)
    .addField("Symbol", `${symbols.join("\n")}\n\u200B`, true)
    .addField("Chain", chains.join("\n"), true)

  return {
    messageOptions: {
      embeds: [embed],
      components: getPaginationRow(data.page, totalPage),
    },
  }
}

const command: Command = {
  id: "nft_recent",
  command: "recent",
  brief: "Show list of newly added NFTs",
  category: "Community",
  run: async function (msg: Message) {
    const msgOpts = await composeNFTListEmbed(msg, 0)
    const reply = await msg.reply(msgOpts.messageOptions)
    listenForPaginateAction(reply, msg, composeNFTListEmbed)
    return {
      messageOptions: null,
    }
  },
  getHelpMessage: async (msg) => ({
    embeds: [
      composeEmbedMessage(msg, {
        usage: `${PREFIX}nft newListed`,
      }),
    ],
  }),
  canRunWithoutAction: true,
  colorType: "Market",
}

export default command
