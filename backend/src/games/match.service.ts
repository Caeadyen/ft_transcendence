import { ConflictException, Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { PrismaService } from 'src/prisma/prisma.service'
import { GameStatus } from './dto/query-match.dto'
import { MatchEntity } from './entities/match.entity'
import { Player, GameUpdate } from 'common-types'
import { SocketService } from 'src/socket/socket.service'

interface Game {
  players: {
    0: {
      player: Player
      id: number
      connected: boolean
    }
    1: {
      player: Player
      id: number
      connected: boolean
    }
  }
  gameid: number
  last_modified: Date
}

const matchWithScore = Prisma.validator<Prisma.MatchArgs>()({
  include: { players: true }
})
export type MatchWithScore = Prisma.MatchGetPayload<typeof matchWithScore>

const matchWithPlayers = Prisma.validator<Prisma.MatchArgs>()({
  include: { players: { include: { player: true } } }
})
export type MatchWithPlayers = Prisma.MatchGetPayload<typeof matchWithPlayers>

const playersOnMatchWithUserInfo = Prisma.validator<Prisma.PlayersOnMatchArgs>()({
  include: { player: true }
})
export type PlayersOnMatchWithUserInfo = Prisma.PlayersOnMatchGetPayload<
  typeof playersOnMatchWithUserInfo
>

@Injectable()
export class MatchService {
  constructor(
    private prisma: PrismaService,
    private socketService: SocketService
  ) {
    this.matches = new Map<number, Game>()
    setInterval(() => {
      let remove: number[] = []
      this.matches.forEach((game, key) => {
        const diff = Date.now() - game.last_modified.getTime()
        if (diff > 1000 * 60 * 2) {
          remove.push(key);
        }
      })
      remove.map((key) => {
        this.matches.delete(key);
      })
    }, 1000 * 60)
  }

  matches: Map<number, Game>

  async join(matchId: number, playerId: number) {
    const match = this.matches.get(matchId)
    // const match = this.matches[matchId]
    if (match === undefined) {
      console.log('Match is undefined')
      return undefined
    }

    if (playerId == match.players[1].id || match.players[1].id === undefined) {
      match.players[1].id = playerId
      await this.addPlayer(matchId, playerId)
      console.log('Player joined as 2')
    }

    const db_match = await this.findOne(matchId, {
      includePlayers: true,
      includeScores: true
    })

    return db_match
  }

  gameTick() {
    this.matches.forEach((game, key) => {

    })
  }

  async create(data: Prisma.MatchCreateInput, playerToken?: string) {
    const match = await this.prisma.match.create({
      data,
      include: { players: { include: { player: true } } }
    })
    const players = match.players

    const playerTwoId = match.players.length == 2 ? players[1].playerId : undefined

    this.matches.set(match.id, {
      players: [
        {
          player: {
            pos: 0,
            vector: 0
          },
          id: players[0].playerId,
          connected: false
        },
        {
          player: {
            pos: 0,
            vector: 0
          },
          id: playerTwoId,
          connected: false
        }
      ],
      gameid: match.id,
      last_modified: new Date()
    })

    return match
  }

  playerConnected(connection: string, userId: number, update: GameUpdate)  {
    const match = this.matches.get(update.gameid)
    if (!match) {
      console.log("Match not found")
      return undefined
    }

    console.log("Player connected", userId)
    let other_player = ""
    if (match.players[0].id === userId) {
      match.players[0].connected = true
      other_player = this.socketService.getSocketId(match.players[1].id)
    } else if (match.players[1].id === userId) {
      match.players[1].connected = true
      other_player = this.socketService.getSocketId(match.players[0].id)
    }

    if (match.players[0].connected && match.players[1].connected) {
      this.socketService.socket.to(connection).emit('start_game', update)
      this.socketService.socket.to(other_player).emit('start_game', update)
    }
  }

  moveHandler(match: Game, player_number: number, update: GameUpdate, connection: string) {
    match.players[player_number].player.pos = update.player.pos
    match.players[player_number].player.vector = update.player.vector
    match.players[player_number].connection = connection
    match.last_modified = new Date()

    const other_player_number = player_number == 0 ? 1 : 0
    const other_player = this.socketService.getSocketId(match.players[other_player_number].id)
    this.socketService.socket.to(other_player).emit('game_update', update)
  }

  makeMove(update: GameUpdate, connection: string, userId: number) {
    const match = this.matches.get(update.gameid)
    if (!match) {
      return undefined
    }

    if (match.players[0].id === userId) {
      this.moveHandler(match, 0, update, connection)
    } else if (match.players[1].id === userId) {
      this.moveHandler(match, 1, update, connection)
    }
  }

  /**
   *
   * @returns a list of all matches in the minimal representation (no score and players)
   */
  async all() {
    return this.prisma.match.findMany()
  }

  /**
   * Finds all matches according to filters and includes additional data.
   * @param options specifies what should be included and searched for
   * @param includeScores controls the inclusion of score information
   * @param includePlayers controls the inclusion of user information
   * @param status filter matches based on their current status {@link GameStatus}
   * @param players filter matches to only include matches with these players in it
   * @returns a list of all matches in detailed representation according to the query parameters
   */
  async findAll(options: {
    includeScores?: boolean
    includePlayers?: boolean
    gameStatus?: GameStatus
    players?: number[]
  }): Promise<MatchEntity | unknown> {
    // TODO: add sorting and limit
    const { includeScores, includePlayers, gameStatus, players } = options

    const playersOnMatchFilter =
      players?.length > 1
        ? { every: { playerId: { in: players } } }
        : { some: { playerId: { in: players } } }

    let includes = { players: undefined }
    if (includeScores) includes = { players: true }
    if (includePlayers) {
      includes = { players: { include: { player: true } } }
    }

    const filter: Prisma.MatchWhereInput = {
      start: undefined,
      end: undefined,
      players: playersOnMatchFilter
    }
    switch (gameStatus) {
      case GameStatus.CREATED:
        filter.start = null
        break
      case GameStatus.IN_PROGRESS:
        filter.start = {
          not: null
        }
        filter.end = null
        break
      case GameStatus.COMPLETED:
        filter.start = {
          not: null
        }
        filter.end = {
          not: null
        }
        break
      default:
        if (gameStatus) console.debug(`GameStatus ${gameStatus} not valid!`)
        break
    }

    return this.prisma.match.findMany({
      include: includes,
      where: filter
    })
  }

  async findOne(
    id: number,
    options?: {
      includeScores?: boolean
      includePlayers?: boolean
    }
  ) {
    const { includeScores, includePlayers } = options || {}
    let includes = { players: undefined }
    if (includeScores) includes = { players: true }
    if (includePlayers) {
      includes = { players: { include: { player: true } } }
    }

    return this.prisma.match.findUniqueOrThrow({
      include: includes,
      where: { id }
    })
  }

  // TODO: check if the player is already on the match
  async addPlayer(matchId: number, additionalPlayer: number) {
    // check if maxPlayersOnMatch already reached
    const currentPlayerCount = await this.prisma.playersOnMatch.count({
      where: { matchId: matchId }
    })

    if (currentPlayerCount != 1) throw new ConflictException('Cannot add player to match.')

    return this.prisma.match.update({
      include: { players: true },
      where: { id: matchId },
      data: {
        players: {
          connectOrCreate: {
            where: {
              playerId_matchId: {
                matchId: matchId,
                playerId: additionalPlayer
              }
            },
            create: {
              playerId: additionalPlayer
            }
          }
        }
      }
    })
  }

  async start(matchId: number) {
    await this.prisma.match.update({
      where: { id: matchId },
      data: {
        start: new Date(Date.now())
      }
    })
  }

  async addMatchResult(matchId: number, scores: { playerId: number; score: number }[]) {
    const playersOnMatchData = scores.map((score) => ({
      ...score,
      matchId: matchId
    }))
    console.log(playersOnMatchData)
    return this.prisma.match.update({
      include: { players: true },
      where: { id: matchId },
      data: {
        end: new Date(),
        players: {
          deleteMany: { matchId: matchId },
          createMany: {
            data: scores
          }
        }
      }
    })
  }

  async remove(id: number) {
    return this.prisma.match.delete({ where: { id } })
  }
}

// /**
//  * Creates a random string of given length
//  * @param length the lenth of the string
//  * @returns The random string
//  */
// function makeid(length: number) {
//   let result = ''
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
//   const charactersLength = characters.length
//   let counter = 0
//   while (counter < length) {
//     result += characters.charAt(Math.floor(Math.random() * charactersLength))
//     counter += 1
//   }
//   return result
// }
