import { GraphQLServer } from 'graphql-yoga'
import { prisma } from './generated/prisma-client'
import resolvers from './resolvers'

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: request => ({
    ...request,
    prisma,
  }),
})

// Start the server when executed directly
if (require.main === module) {
  server.start(() => console.log(`Server is running on http://localhost:4000`))
}

export default server;
