import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'
import {
  createFakeMatch,
  matchWithOnePlayer,
  matchWithScore,
  maximalMatch,
  minimalMatch
} from './match.test-data'

// initialize Prisma Client
const prisma = new PrismaClient()

const roundsOfHashing = 10

async function main() {
  // create two user articles
  const avatar1 = await prisma.userAvatar.upsert({
    where: {
      id: 1
    },
    update: {},
    create: {
      private: false,
      filename: 'default.jpg'
    }
  })
  const user1 = await prisma.user.upsert({
    where: {
      userName: 'test'
    },
    update: {},
    create: {
      name: 'Ulli Test',
      userName: 'test',
      displayName: 'Ulli',
      email: 'ulli@gmx.de',
      activated2FA: false
    }
  })

  const user2 = await prisma.user.upsert({
    where: {
      userName: 'jthomsen'
    },
    update: {},
    create: {
      name: 'Jacob Thomsen',
      userName: 'jthomsen',
      displayName: 'Jacky',
      email: 'jacob.thomsen@example.com',
      activated2FA: false,
      following: {
        connect: { id: user1.id }
      }
    }
  })

  const user3 = await prisma.user.upsert({
    where: {
      userName: 'jhansen'
    },
    update: {},
    create: {
      name: 'Julia Hansen',
      userName: 'jhansen',
      displayName: 'Juli',
      email: 'julia.hansen@example.com',
      activated2FA: false,
      following: {
        connect: { id: user2.id }
      }
    }
  })

  const user4 = await prisma.user.upsert({
    where: {
      userName: 'cvasquez'
    },
    update: {},
    create: {
      name: 'Caroline Vasquez',
      userName: 'cvasquez',
      displayName: 'Caro',
      email: 'carito@example.com',
      activated2FA: false,
      following: {
        connect: [{ id: user1.id }, { id: user3.id }]
      }
    }
  })

  console.log({ avatar1, user1, user2, user3, user4 })

  await prisma.match.create({ data: createFakeMatch({ completed: true }) })
  await prisma.match.create({ data: createFakeMatch() })
  await prisma.match.create({ data: createFakeMatch({ withPlayers: true }) })
  await prisma.match.create({ data: createFakeMatch({ withPlayers: true, completed: false }) })
  await prisma.match.create({
    data: createFakeMatch({ withPlayers: true, completed: true, maxScore: 9999 })
  })


  // Chats Interface gen
  await prisma.profile_pic.create({
    data: {
      userId: user1.id,
      avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC',
    },
  });
  await prisma.profile_pic.create({
    data: {
      userId: user2.id,
      avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC',
    },
  });
  await prisma.profile_pic.create({
    data: {
      userId: user3.id,
      avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC',
    },
  });
  await prisma.profile_pic.create({
    data: {
      userId: user4.id,
      avatar: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC',
    },
  });
  const seedObj = {
    'ten': 'data:image/png;base64,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',
    'next': 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAHsAewMBEQACEQEDEQH/xAAcAAEAAQUBAQAAAAAAAAAAAAAAAQIEBQYHAwj/xAA3EAABAwMBBAYHCAMAAAAAAAABAAIDBAURIQYSMVETFEFhcZEHIjJCU4GhI1JikqKxwdEzQ3L/xAAbAQEBAAIDAQAAAAAAAAAAAAAAAQIGAwQFB//EADMRAAIBAgQEBAUDBAMAAAAAAAABAgMRBBIhMQVBUZEGFFKxE1NhcdEioeFCgcHwIzIz/9oADAMBAAIRAxEAPwDoa+VHuhQBAEAVAUAVAQBQBVIBLkChQqAgCXAUAQBWwCgCoCgCy22IFiUIAgCAIAgCoCgCAIAqgEAUAQBAUve2NjnyOaxjRlznHAA5krKMXJ2W5DSL16R6KkkdFbYetOGnSPJaz5Difotgw3AKk1mrPL9N3/BwyrJbGvu9I94kflraZg5CE4+pXorgOES59zj+NIu6D0mVQkArKWnlZn3Mxu+uQuGr4fotf8cmvvqVV3zN7sd9oL3CZKKQ77MdJE/R7PEcu8aLXsXga2ElaotOT5M54zUtjJrpmYCtgEbuAoAgCAIAgCoCEChTl3pP2jklrTZaV5bDDg1BHvvIyG+A0+fgtu4HgYwp+Ylu9vsdWtP+k0DvWwHXJc7OjfZQEIDI2O61FquENVTuIew6a6EdrT3FcGIw8MRTdOez/wBuZxk0zvFDVR11HBVw56OaNr255EZXz2tSdKo6ct0d6LurnuuIoQBUBAFAFQFAMq3AUAVB89Xic1N4r53HJkqZX57i84X0fDwUKEIrkl7Hnyd2XGzNgqdp7iaWnJjpoxvT1G7kM5DvJPZ4lZzmoK7EIObsZG+7A3ezxunpntr4G6uEbC14H/OufkfksYVoy0ehlKjKOq1NZY9rxlpXKcZ6NGmToOxAdp9HM5m2SpQ45Mbnt/USP3Wj8bgo42VudvY7tF3ibKvKOUKALIgUKFAEAVAUAQBUhwSHZ64zXe1Ut0p5aOG4yEsccBxaNXHHEHHMdq+lZ4qLyvY6Kg3JJ8ztlot9Ja6CKkt8DIIGj2W9p5k8Se8rpSk5O7O5GKirIu3NDhghYlNI2r2DprlM6tt5bS1h1dp9nKfxAcD3j6rnp1nHR6o4p0U9Vuc/uOz13t8kbayjc0SSCKIscHh7jwAxzXYjOMtmdeUJR3R1fYC31lr2fFNcITDN0znbhcDgHGOBIWncdaeLuuiO1STUdTZF4pyhAEAQBAFlsQLEoQBAMqgwO0FuFVcrPWBwDqKd7iCPaDmFuPMg/Jb1QrKdLMv6kjjlG7T6GYhOY29ypmVoQIDGXW2CuqbZK3dHVKsTuHMBjh+5B+SyjK1zGSvYyrRotY4xUUq6guS99fwZlS8kEKFCoCgCy0IFiUKgYSwCgCAtblHmDeHuuyvb4Vi5KaoSenIhRSyjALvZK2IF1nOo4KECADUrqY3EeXoua35FPQLUZzlOTnLdgFYFIQBAFQFAFQAgJRsEKAICCMjB1CqbTugY6qgdSDpm/wCEnGp7VtWBx3x0ozX6v2f89TG62EVSB7LsdxXolPVlQ6R4jYWF54ALCpUjTi5y2BeRsLfaOXHitTxuLliZ3eiWyCKl0ygqAhWwCrAWICAIAgCAKkPGqrKajj6Sqnjib2bxxnwXYw2Dr4qWWjByf0/OyOGtiKVFXqSSMBV7X0zHblFTyTu+871G/wBrZML4Trz1xE1H6LV/j3PFr+IKUdKUc330X5No2TuVNtDZ5KWugiE0Z+0iPAgnRw/b5LZKfD6eEpRox1j9TDC494m89pIt6rZJ0VSOpzgwvdgNldgs/tdeeFd/0nrQxit+vczdBaaK0QuqHkF7Glz5n6boHHHJc9OhGG2rOrWxMpJ30RpLtrGPrJXGlIgc8lhafWA7Mgry8d4UVWTqUKlm9bNad1r+zPOo+Icryzhp1W/Z/kytHdKOswIJm733HaO8lq2M4RjcH/6w06rVd1/k9vDcRw2I/wCktemzLsrzTvBAFAEAQBVgKAIDB7V3WW20sTKZ27LM4+tjO6ANceYWxeHeGUsbWlKsrxjy6t7ezPG4xjZ4anFU3aUvZGjlz6qo3pnuke7i5ziSvo1OnCnFQgrJckafUnKbcpO7LpjWsGGjAXJY4i5oK6pttXHV0Um5NHz1Dh2tI7Qf65LGUFJWZyUasqU1OO5kL1tLX3espqkZo+retCxj84f2uPPljl4rjhRUU0+Z2K+NqVZxktLFzf8Aa6qvVIykZAaWHAM/rZMjh2D8OfNSnQUHdnJisfKtDIlZczX1znnDGT3oUy1qvVVTTRxTSmSAkNIfqWjmDxWvcV4DhsTTlOnHLU300T+62/vuevgOK1qM4wnK8Ntd19bm5L5obuEAVSISrcEKFCgCA0bbefpLpHCDpFEPMnP8BfRPClHJgpVPVJ/tZe9zT+PVM2JUOi9zC0g9cnkMLZzwpF2qYgjAQoQgQBAScDQeaFKSMghUj2OhUUvTUcEucl8bT9F8dx1L4OKqU+kn7n0fC1Pi0IT6pHuuodgIAgCoJ4IkQpJGMkgeKLVlObbQztnvdW8OBAfujXlp/C+r8Goulw+lG3K/fU0HiVRTxlR3527aHjR46MnI1K9RHnykupcBwHaM+KWJmXUjI5jzQmZdRkcx5oMy6jI5jzQZl1GRzHmgzLqMjmPNBmXUZHMeaDMupu+z0gktFP6wy0FvHkSF8u8QUnHiVX6tPukb7weWbBU/tbszJLxD0wqAoAqAgPGanEpzvEFZxnlM4zyls63jU7sZ8WrsrGVPU+7Jak94rsU9RI4RMx3AK+cqet92XLR9K7Ip6mfgt8gr5yp8x92MlD0rsOqn4A/Kr5up8x92X4dD0rsiOqn4A/KnmqvzH3Y+HR9K7Inqp+B+lXzVT5j7sfDo+ldkOqH4I8gsfN1PmPuyZKHpXYkUTj/pb5BPOVPmPuxko+ldioUHNjAPBTzlT1y7v8ky0fSuyPVlGG+9gcmjC4amIlN3ev3KpRirRVi6AwAOS4DAlQBAEAQBUBXYgUKEAQBLgIAoAqAoAgCoGNEtoQKFCAICEBKoCgCAIAgCAIAVkwFiAgAWUdyAqMBQp//Z',
    'donit': 'data:image/jpeg;base64,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',
    'wesrin': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACCCAMAAAC93eDPAAAAM1BMVEWVu9////+QuN6JtNz2+fzw9frH2u2zzeefweHT4vHs8vm50emryOWbv+Dj7Pba5vO/1eqZf+wEAAADfUlEQVR4nO2bbZOrIAyFMVBAReD//9qrVXftXV9yLOk6O55P3WlnfQbCSUhapW7dunWrpGjSbz1d+ZBt3cvm4NWnOUgrG021kIlW6c9RELVNtaKm/dRSUGvWAJ5r0X6CgXzcAhgUvTgEhT2AQUGYgdojgqqS3QwOgSzD8S6I7wVtHoVXGTEEqnkEVVVLMXguQVV5GQJKfIQkswzAIggtA1kEwUosAz0QhIcEgmeeyEmhPAHPGL8lYJF8UxglYA16tUrZVqPLI2AEVfUnERSKUJ4A8sZB5f3xRrgIwgXC8QKH8goIUK7us3V5BNq9x/1UFMiUUNEkUjZdoF5QzJvULIGqSSmocDMSBFjNIlCxXKOIh4JB5nLdAcFgOgkCyJwEjOmJADiDWKOFjyAEANzuhe72yJmQazZxE7ZAop7FDUjRrh/LpBvJ3icvGpxs+5VhT0K29M1wjCAL0CO4392GQfogZ1u5A/ml/Y6PWOv3lWFnHUQqlTWGvEWQ5adCanwEhfUJ3ZQa5o8JAOhspmCjlSmdmUeE2posMbIk7Z8hUOv5b5cWFCa5+an6Ga7Wl6Ug3bnZFut5HDpMjFubYky2/Z4X09eBia4rRUFEbjkcjh0t39N6OTanbuHgJroiI3UdftRKmzvdR8v/n03h3aXQq7H/WB1O9zG6VtI04S2/3HTCR+5evi7Qv+7yVk31jmPupuZog9LjNyi0Cnb3o6cZGMXBo4mxOa4ozzKgE4g9ndwLsKexr1MdD3QGsq8z/QbsLn+sE7cbZDbL0Zk7XlmCE1Ut2uM7FnzFQputx4K9Aenq8AT3fgqfh0GgNaAdZ47A6rqsL40C3QkegHCEIcDDMI6ggVl5VxgEOYNENILxWDpBjILSBDoL4wlqxDF6KWeErEIngwBY9HE355yAHpDMgYCOhMyBgI5E+WJhFFIyCCSpQQ2foHy9MgqoWkSS1CB+oroAgkDVNopdu0k5E+BNMtXCIHbFsN1dfVfs7qyUPwMOfQWE34+FK/jCBZJ17wwStynsek8qpKK5yqSATym0csUql+TUuS4wkQ7129VLrIN+px8/NPNd3ZzcE9PUTpWYB/T/w4ecDPbVKpNy8EV/4Udady7XvMl9nV2nRX5RNzXdc53i6oXvEVOdp/a8wONfQVTXeR/abMcfM9rcBu+76b1Pihb66INv3br11/UPM+IoaoPy9hQAAAAASUVORK5CYII=',
    'getMy': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC',
    'jaonse': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAIIAAACCCAMAAAC93eDPAAAAYFBMVEUiLTqzusC2vcO6wcccKDYfKjgTITAWIzIZJjSss7kRHy8AFyhbY2wLHCyZoKcrNUFMVF6iqrCCiZEAEiY2P0uTmqE9RlFnb3h2fYVsdHwwOkZTW2RHT1l8g4thaXKJkJhg8Gt6AAAD+0lEQVR4nO2a23aqMBCGIecghINCAWl9/7fcgWqrVkOGZnCvvfkvXN7xrT+TmSQzUbRp06ZNmzZt2rTpXxdnIttlYvph/AXfF6wvuqo2VnXVFT0T61KwLG+NppSSSfaPNl2UsPUA9kdjvx7fyHLUxX4dJ7gYSnL3/TMFMY1YgYCx9/ghwAQRtwrdCJWX9BnAKGo4ckSI4fEaXBtxkKgEx+eL8MWgC0QGNehZgpGhQVsLHvkQjAxoMZkZLwLLUGc4BOLNuReuRVOUcOC99iWIY91jLEVWeZtgbagQloI3/gCjEGxI3j1j8VOkDV8t9oBIGBH0PjQBKwCRMIoGz08Stg7jSoTel8w3LX0hGBUYIYKFgpUODMB7YCjYYAi8LdURjlCEjUfpXx++EN7CxqPo4Ahd2OSULEBok6AIS1wInKKXxELghViyIz7ChiNv4AhD2E3Jc2B+Dp+a/oIEHan65WVKtsBgQCjWA/TIEjgaI/DBLY53oQns8RVkA0E4xbMB5AEJXKoned8oJwKDcasE5WiaBj85juL+NhCD88Kg/K8StEAxwW4K3wyJ9r4Q8Wj+pWkiiPGepGXqh4DzwPGpzCc/0SrsofFO8jTLQGvUd0dbKuoZBmqC3+rvxJWbgdb43RHOXGtBT6v0Z7L0vhdxEaEpVkK4k+zrRxCE1j1yJH6LqeOPrgghZcrW6wxZI2Q69obI5fOUmlSuZsFZahelldGaEK1NlfIdUmFyiiupotxq/POCPuU3yCs/vmnTtfik13x5HBxIeJT3VnZbJtMAwVosXAmRN0VXmbLUZ5Wlqbqi6ZnATxBMJvmxNZrQ7/R8SdE0HtNknkjESsGT/dAa8mNu4IaElO2wT3C8kKJpbUWYbxjbqvE+INQsGaUm9r9NxSaNAj9Bq658bv9DL2jZsXCHeSFbfwOurWhlmAdYpj78uuUPrNBvPMAxQjRmPgSfO2GG3xrBsxYWAz+MoO3vZo3EwSwIgjsjyuYXYSlSv9v8jBFxungxFvRBHmtxg2YHmRaYYTgtuWVx0CPfnIiBlw337RUuWoNPE0m4VTgznIAxuYO9OHsxVKCHcfERnGBs3wJ8YIfwAFYEMFWhQm6GK4TSGwE0PgSR96gRK3AArMjRr3bvS5RlmBBKr10hMXbDRX5DDWrpGclL2iMiF/ToIfKyAS8SRpFyfhngUwIwzXetdtDeNFTEzGwKjpOab3RwV231hmyCtWEmIHc41eEGYWYlMnQCG5DOQgGealyE4Gxni3YFF9wzqRJ7S04ItSszcNzUeJZ70AY8t7NI+fPMwPs1TLBnyOcIrFkFwbUlwGM7CxEcxzf0MnlGcBRLla6D4JgBXAvBUaj+W4Q/eLY3FVG6AH0AAAAASUVORK5CYII=',
    'apier': 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAMAAADUMSJqAAAAOVBMVEXv7OjGw70AAADCv7ry7+v49fHm49/g3dns6eXMycR4dnTPzMekop9WVVTKx8QYFxcyMjG8ubPY1dHE2mloAAACUklEQVRoge2a25KDIAyGoUbR4qHl/R92Aa21HQmYhJud/jd79zXzb8hhorptmsbZ9Iqt3szj9GKq9c/dtAB8dBBAa+4H+GJbIfLGb+3ygj86UXTEd48VvsizA32JcFuB7ek2wO9tDbZS7d3DTZXAfejmpqZKgfvQJzVWCtyHPqq5HnxWphZbebRAPUnpChpC9QGpEvRBVp2zVmtrXadk+dDZptGbmsYKFgwweidvfC329OwXOuKtBBm6E3TE871JsiXoaXag89g9wvZ01guEAWNrPTCMAYMG7kNnZCRk2J5OhoPLsbV2VDrk2VpT4Vga7r4Q07HEFbIvuTxcRczGfK5EX4imP0vgTxr7Bz9V1X9o0QOlPlGwJWzqdJ8ruNEV6jiIt6ENTm1GJe+f3ovyZZHRo/Ohc5poznVW+weHjxbkJrfSUWM4pkTNafbMI/s1ok/De8VYM6Bzw/dk/mF5MzjaMArKYeD9B7QjbDFFrX+Vuxi2KUcHXRoZzxYV1JwLS0zRwPKpoRBdUmlPgi+qBDR2IZ2GDsqiywbEc+VKTaYM4soVSarhGx21nWNKEGpMyS6Bho60VG7gaOjcwLHQy5YgXOmE4bPTL4mXh6uS2XixiJ8rMZhKWJ40nZ+IQYlkLFtTckqsMXXhEuzkjiQT+Tn7B/8X8L4evD8eRKTh5njKEYbDfDxCScPH4/lMGN5Ox8OfLDwc/g4nS1l4PFm+j62i8PXY+j4TS8JfZ+L9wC0I3w/cPvYhnubF4NAOy/dHBUJt7uujgu1ziKfEUPQ8fA7xB92pGr+J4j6kAAAAAElFTkSuQmCC',
  }
  for (let key in seedObj) {
    const avatar = seedObj[key];
    const delay = await prisma.user.create({
      data: {
        name: key,
        userName: key,
        email: key + '@gmx.de',
        activated2FA: false,
      },
      select: {
        id: true,
      }
    });
    const delay2 = await prisma.profile_pic.create({
      data: {
        userId: delay.id,
        avatar: avatar,
      }
    });
    const delayChannel = await prisma.channel.create({
      data: {
        name: key + 'Channel',
        desc: key + ' owns this Channel',
        visibility: 'public',
      },
      select: {
        id: true,
      }
    });
    const delayChannel2 = await prisma.channel_link.create({
      data: {
        chId: delayChannel.id,
        userId: delay.id,
        role: 'owner',
        linkStatus: 'good'
      },
    });
  }
  const allUsers = await prisma.user.findMany({
    where: {},
    select: {
      id: true,
    }
  });
  for (let key in allUsers) {
    const oneUser = allUsers[key];
    try {
      const test = await prisma.profile_pic.findFirstOrThrow({
        where: {
          userId: oneUser.id,
        },
      });
    } catch (error) {
      const createPic = await prisma.profile_pic.create({
        data: {
          userId: oneUser.id,
          avatar: 'data:image/png;base64,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',
        }
      });
    }
  }











}

// execute the main function
main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect()
  })
