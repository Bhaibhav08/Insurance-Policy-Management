const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar Date

  # User type
  type User {
    _id: ID!
    name: String!
    email: String!
    role: String!
    createdAt: Date
    updatedAt: Date
  }

  # Policy product type
  type PolicyProduct {
    _id: ID!
    code: String
    title: String!
    description: String
    premium: Float
    termMonths: Int
    minSumInsured: Float
    imagePath: String
  }

  # User purchased policy
  type UserPolicy {
    _id: ID!
    userId: ID
    policyProductId: ID
    startDate: Date
    endDate: Date
    premiumPaid: Float
    status: String
    assignedAgentId: ID
    nominee: Nominee
  }

  type Nominee {
    name: String
    relation: String
  }

  # Claim type
  type Claim {
    _id: ID!
    userId: ID
    userPolicyId: ID
    incidentDate: Date
    description: String
    amountClaimed: Float
    status: String
    decisionNotes: String
    decidedByAgentId: ID
  }

  # Payment type
  type Payment {
    _id: ID!
    userId: ID
    userPolicyId: ID
    amount: Float
    method: String
    reference: String
    createdAt: Date
  }

  # Auth payload
  type AuthPayload {
    token: String!
    user: User
  }

  # Summary for admin dashboard
  type Summary {
    users: Int
    policiesSold: Int
    claimsPending: Int
    totalPayments: Float
  }

  # Input types
  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: String!
  }

  input LoginInput {
    email: String!
    password: String!
  }

  input PolicyInput {
    code: String
    title: String!
    description: String
    premium: Float
    termMonths: Int
    minSumInsured: Float
  }

  input NomineeInput {
    name: String
    relation: String
  }

  # Queries
  type Query {
    me: User
    policies: [PolicyProduct]
    myPolicies: [UserPolicy]
    claims: [Claim]
    paymentsForUser: [Payment]
    adminSummary: Summary
  }

  # Mutations
  type Mutation {
    register(input: RegisterInput): AuthPayload
    login(input: LoginInput): AuthPayload
    createPolicy(input: PolicyInput): PolicyProduct
    purchasePolicy(
      policyId: ID!
      startDate: Date
      termMonths: Int
      nominee: NomineeInput
    ): UserPolicy
    submitClaim(
      policyId: ID!
      incidentDate: Date
      description: String
      amount: Float
    ): Claim
    recordPayment(
      policyId: ID!
      amount: Float!
      method: String!
      reference: String
    ): Payment
  }
`;
