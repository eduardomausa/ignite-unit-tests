import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let getStatementOperationUseCase: GetStatementOperationUseCase;

describe("Get Statement Operation", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
    getStatementOperationUseCase = new GetStatementOperationUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to get the statement operation", async () => {
    const user = await createUserUseCase.execute({
      name: "Eduardo Mausa",
      email: "eduardomausa@mail.com",
      password: "12345",
    });

    const deposit = await createStatementUseCase.execute({
      amount: 5000,
      description: "Test deposit",
      type: "deposit" as OperationType,
      user_id: user.id
    });

    const statementOperation = await getStatementOperationUseCase.execute({
      statement_id: deposit.id,
      user_id: user.id
    });

    expect(statementOperation).toEqual(deposit);
  })

  it("should not be able to get a statement operation that does not exist", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Eduardo Mausa",
        email: "eduardomausa@mail.com",
        password: "12345",
      });

      await getStatementOperationUseCase.execute({
        statement_id: "Statement id",
        user_id: user.id
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  })

  it("should not be able to get the statement operation if the user does not exist", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Eduardo Mausa",
        email: "eduardomausa@mail.com",
        password: "12345",
      });

      const deposit = await createStatementUseCase.execute({
        amount: 10000,
        description: "Test deposit",
        type: "deposit" as OperationType,
        user_id: user.id
      });

      await getStatementOperationUseCase.execute({
        statement_id: deposit.id,
        user_id: "Test user id"
      })
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  })
})