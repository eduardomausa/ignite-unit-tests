import { InMemoryUsersRepository } from "../../../users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../../../users/useCases/createUser/CreateUserUseCase"
import { InMemoryStatementsRepository } from "../../repositories/in-memory/InMemoryStatementsRepository";
import { GetBalanceUseCase } from "../getBalance/GetBalanceUseCase";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";

enum OperationType {
  DEPOSIT = "deposit",
  WITHDRAW = "withdraw",
}

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let getBalanceUseCase: GetBalanceUseCase
let inMemoryStatementsRepository: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;

describe("Create Statement", () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getBalanceUseCase = new GetBalanceUseCase(inMemoryStatementsRepository, inMemoryUsersRepository);
    createStatementUseCase = new CreateStatementUseCase(inMemoryUsersRepository, inMemoryStatementsRepository);
  });

  it("should be able to deposit a statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Eduardo Mausa",
      email: "eduardomausa@mail.com",
      password: "1234",
    });

    const deposit = await createStatementUseCase.execute({
      amount: 1300,
      description: "Deposit",
      type: "deposit" as OperationType,
      user_id: user.id
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id,
    });

    expect(deposit).toHaveProperty("id");
    expect(balance.balance).toEqual(1300);
  });

  it("should be able to withdraw a statement", async () => {
    const user = await createUserUseCase.execute({
      name: "Eduardo Mausa",
      email: "eduardomausa@mail.com",
      password: "1234",
    });

    await createStatementUseCase.execute({
      amount: 1000,
      description: "Deposit",
      type: "deposit" as OperationType,
      user_id: user.id
    });

    const withdraw = await createStatementUseCase.execute({
      amount: 500,
      description: "Withdraw",
      type: "withdraw" as OperationType,
      user_id: user.id
    });

    const balance = await getBalanceUseCase.execute({
      user_id: user.id,
    });

    expect(withdraw).toHaveProperty("id");
    expect(balance.balance).toEqual(500);
  });

  it("should not be able to withdraw a statement greater than balance", async () => {
    await expect(async () => {
      const user = await createUserUseCase.execute({
        name: "Eduardo Mausa",
        email: "eduardomausa@mail.com",
        password: "1234",
      });

      await createStatementUseCase.execute({
        amount: 100,
        description: "Deposit",
        type: "deposit" as OperationType,
        user_id: user.id
      });

      await createStatementUseCase.execute({
        amount: 200,
        description: "Withdraw",
        type: "withdraw" as OperationType,
        user_id: user.id
      });
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds);
  });
});