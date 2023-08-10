// @ts-nocheck
//needs to be added as otherwise the mpyOn findMany throws an error
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from 'src/prisma/prisma.service'
import { HttpException, InternalServerErrorException } from '@nestjs/common'
import prisma from 'src/prisma/__mocks__/prisma'

describe('Unit test for UsersService', () => {
  let service: UsersService
  jest.mock('src/prisma/prisma.service')
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService]
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile()

    service = module.get<UsersService>(UsersService)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  it('findAllFriends should return list of friends', async () => {
    const spy = jest.spyOn(prisma.user, 'findMany')
    const mockFriendList = [
      {
        following: [
          { id: 1, name: 'test', displayName: 'displayTest', userName: 'test' },
          { id: 2, name: 'test2', displayName: 'displayTest2', userName: 'test2' }
        ]
      }
    ]
    const resultFriendList = [
      { id: 1, name: 'test', displayName: 'displayTest', userName: 'test' },
      { id: 2, name: 'test2', displayName: 'displayTest2', userName: 'test2' }
    ]
    prisma.user.findMany.mockResolvedValue(mockFriendList as any)
    const frindlist = await service.findAllFriends(1)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      select: {
        following: {
          select: {
            id: true,
            userName: true,
            displayName: true
          }
        }
      }
    })
    expect(frindlist).toStrictEqual(resultFriendList)
  })

  it('findAllFriends should return empty list if no friends', async () => {
    const spy = jest.spyOn(prisma.user, 'findMany')
    const mockFriendList = [{ following: [] }]
    const resultFriendList = []
    prisma.user.findMany.mockResolvedValue(mockFriendList as any)
    const frindlist = await service.findAllFriends(1)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      select: {
        following: {
          select: {
            id: true,
            userName: true,
            displayName: true
          }
        }
      }
    })
    expect(frindlist).toStrictEqual(resultFriendList)
  })

  it('findOne should return a user', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique')
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(resultUser as any)
    const user = await service.findOne(1)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      }
    })
    expect(user).toStrictEqual(resultUser)
  })

  it('updateDisplayName should return a user if valid displayName', async () => {
    const spy = jest.spyOn(prisma.user, 'findUnique')
    const spy2 = jest.spyOn(prisma.user, 'update')
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(null as any)
    prisma.user.update.mockResolvedValue({ ...resultUser, displayName: 'SecretName' } as any)
    const user = await service.updateDisplayName(1, { displayName: 'SecretName' })

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        displayName: 'SecretName'
      }
    })
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { displayName: 'SecretName' }
    })
    expect(user).toStrictEqual({ ...resultUser, displayName: 'SecretName' })
  })

  it('updateDisplayName should throw an error if name taken', async () => {
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(resultUser as any)

    expect(async () => {
      await service.updateDisplayName(1, 'SecretName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.updateDisplayName(1, 'SecretName')
    }).rejects.toThrow('DisplayName already taken')
  })

  it('updateDisplayName throws an error if update fails', async () => {
    prisma.user.findUnique.mockResolvedValue(null as any)
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('updateUserStatus')
    })

    expect(async () => {
      await service.updateDisplayName(2, 'Test')
    }).rejects.toThrow('updateDisplayName')
  })

  it('setTwoFactorAuthenticationSecret should run update', async () => {
    const spy = jest.spyOn(prisma.user, 'update')
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.update.mockResolvedValue(resultUser as any)
    await service.setTwoFactorAuthenticationSecret('SuperSecretSecret', 2)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: { id: 2 },
      data: {
        twoFactorAuthenticationSecret: 'SuperSecretSecret'
      }
    })
  })

  it('addFriend should run update on valid user name', async () => {
    const spy = jest.spyOn(prisma.user, 'update')
    const spy2 = jest.spyOn(prisma.user, 'findUnique')
    const friendUser = {
      id: 3,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    prisma.user.update.mockResolvedValue({} as any)
    await service.addFriend(1, 'myFriendsName')
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith({ where: { displayName: 'myFriendsName' } })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      data: {
        following: {
          connect: {
            id: 3
          }
        }
      }
    })
  })

  it('addFriend should throw an error if adding yourself', async () => {
    const friendUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow("Can't add yourself!")
  })

  it('addFriend should throw an error if friend not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null as any)

    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.addFriend(1, 'myFriendsName')
    }).rejects.toThrow('User not found')
  })

  it('removeFriend should run update on valid user name', async () => {
    const spy = jest.spyOn(prisma.user, 'update')
    const spy2 = jest.spyOn(prisma.user, 'findUnique')
    const friendUser = {
      id: 3,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    prisma.user.update.mockResolvedValue({} as any)
    await service.removeFriend(1, 'myFriendsName')
    expect(spy2).toBeCalledTimes(1)
    expect(spy2).toHaveBeenCalledWith({ where: { displayName: 'myFriendsName' } })
    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 1
      },
      data: {
        following: {
          disconnect: {
            id: 3
          }
        }
      }
    })
  })

  it('removeFriend should throw an error if removing yourself', async () => {
    const friendUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    prisma.user.findUnique.mockResolvedValue(friendUser as any)

    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow("Can't have yourself as friend!")
  })

  it('removeFriend should throw an error if friend not found', async () => {
    prisma.user.findUnique.mockResolvedValue(null as any)

    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow(HttpException)
    expect(async () => {
      await service.removeFriend(1, 'myFriendsName')
    }).rejects.toThrow('User not found')
  })

  it('findUser should return a list of user', async () => {
    const spy = jest.spyOn(prisma.user, 'findMany')
    const resultUser = [
      {
        displayName: 'displayTest',
        userName: 'test'
      },
      {
        displayName: 'displayTest2',
        userName: 'test2'
      }
    ]
    prisma.user.findMany.mockResolvedValue(resultUser as any)
    const user = await service.findUser('displayT')

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        OR: [
          {
            userName: {
              startsWith: 'displayT'
            }
          },
          {
            displayName: {
              startsWith: 'displayT'
            }
          }
        ]
      },
      select: {
        userName: true,
        displayName: true
      }
    })
    expect(user).toStrictEqual(resultUser)
  })
  it('getUserAvatarUrl should return an url', async () => {
    const spy = jest.spyOn(prisma.userAvatar, 'findUnique')
    const resultUrl = {
      filename: 'Test'
    }
    prisma.userAvatar.findUnique.mockResolvedValue(resultUrl as any)
    const url = await service.getUserAvatarUrl(2)

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 2
      },
      select: {
        filename: true
      }
    })
    expect(url).toStrictEqual(resultUrl)
  })

  it('setUserStatus should run update', async () => {
    const spy = jest.spyOn(prisma.user, 'update')

    prisma.userAvatar.findUnique.mockResolvedValue({} as any)
    await service.setUserStatus(2, 'ONLINE')

    expect(spy).toBeCalledTimes(1)
    expect(spy).toHaveBeenCalledWith({
      where: {
        id: 2
      },
      data: {
        currentStatus: 'ONLINE'
      }
    })
  })

  it('setUserStatus throws an error if update fails', async () => {
    prisma.user.update.mockImplementation(() => {
      throw new InternalServerErrorException('updateUserStatus')
    })

    expect(async () => {
      await service.setUserStatus(2, 'ONLINE')
    }).rejects.toThrow('updateUserStatus')
  })

  it('createUser should create a user', async () => {
    const newUser = {
      userName: 'test',
      displayName: 'displayTest',
      email: 'test@test.de',
      _json: {
        image: {
          versions: {
            small: 'smallTest'
          }
        }
      }
    }
    jest.spyOn(service, 'downloadProfil').mockReturnValue(false)

    prisma.user.create.mockResolvedValue({
      id: 1,
      name: newUser.userName,
      displayName: newUser.displayName,
      userName: newUser.userName,
      email: newUser.email,
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    })
    const resultUser = {
      id: 1,
      name: 'test',
      displayName: 'displayTest',
      userName: 'test',
      email: 'test@test.de',
      activated2FA: false,
      twoFactorAuthenticationSecret: '',
      refreshToken: '',
      currentStatus: 'OFFLINE',
      avatarId: 1
    }
    const user = await service.createUser(newUser)
    expect(user).toStrictEqual(resultUser)
  })
})
