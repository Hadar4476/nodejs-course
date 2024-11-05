// building a schema
const { buildSchema } = require("graphql");

// the "!" indicates that it is required
// adding "()" indicates that these arguments are required for to resolver

// createUser(userInput: UserInputData): User!
// indicates what will be received as an argument and what is going to be returned
const graphqlSchema = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        email: String!
        name: String!
        password: String!
        status: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type PostsData {
        posts: [Post!]!
        totalPosts: Int!
    }
    
    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
    }

    input UserInputData {
        email: String!
        name: String!
        password: String!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getPosts(page: Int!): PostsData!
        getPost(postId: ID!): Post!
        getUserStatus: String!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(postId: ID!, postInput: PostInputData!): Post!
        updateUserStatus(status: String!): String!
        deletePost(postId: ID!): Boolean!
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);

module.exports = graphqlSchema;
