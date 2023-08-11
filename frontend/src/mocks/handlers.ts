import { MockedRequest, RestHandler, rest, type DefaultBodyType } from 'msw'

const backendURL = import.meta.env.VITE_BACKEND_SERVER_URI

// Mock data
export const matches = [
  {
    id: 1,
    completed: true,
    start: '2023-07-08T13:47:45.386Z',
    end: '2023-07-08T14:47:45.386Z',
    players: [
      {
        playerId: 1,
        matchId: 1,
        score: 4,
        player: {
          id: 1,
          email: 'alice@prisma.io',
          name: 'Alice'
        }
      },
      {
        playerId: 2,
        matchId: 1,
        score: 0,
        player: {
          id: 2,
          email: 'bob@prisma.io',
          name: 'Bob'
        }
      }
    ]
  },
  {
    id: 2,
    completed: true,
    start: '2021-06-24T14:13:53.081Z',
    end: '2022-06-24T15:13:53.081Z',
    players: [
      {
        playerId: 1,
        matchId: 3,
        score: 0,
        player: {
          id: 1,
          email: 'alice@prisma.io',
          name: 'Alice'
        }
      },
      {
        playerId: 2,
        matchId: 3,
        score: 1,
        player: {
          id: 2,
          email: 'bob@prisma.io',
          name: 'Bob'
        }
      }
    ]
  }
]

export const handlers: RestHandler<MockedRequest<DefaultBodyType>>[] = [
  rest.get(`${backendURL}/match`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json(matches))
  })
]