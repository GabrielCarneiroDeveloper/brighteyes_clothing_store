import { DTOController } from '@src/common/dto/DTOController'
import { IController } from '@src/interfaces/IControllers'
import { AbstractController } from '@src/modules/abstract.controller'
import { Request, Response, Router } from 'express'
import { getRepository } from 'typeorm'
import { Client } from '../client/Client'
import { Clothes } from '../clothes/Clothes'
import { ClothesStatus } from '../clothes_status/ClothesStatus'
import { ClothesStatusEnum } from '../clothes_status/ClothesStatusEnum'
import { EnumEmployeeClientStatus } from '../employee_client_status/IEmployeeClientStatus'
import { 
  ClientValuable, 
  ClothesAvailabilityMetrics, 
  ShoppingCartValuable,
  ClientAvailabilityMetrics
} from './StatisticsInterface'

enum MonthEnum {
  JAN = 'Jan',
  FEV = 'Fev',
  MAR = 'Mar',
  APR = 'Apr',
  MAY = 'May',
  JUN = 'Jun',
  JUL = 'Jul',
  AUG = 'Aug',
  SEP = 'Sep',
  OCT = 'Oct',
  NOV = 'Nov',
  DEC = 'Dec'
}

enum getMonthEnumByMonthName {
  'Jan' = MonthEnum.JAN,
  'Fev' = MonthEnum.FEV,
  'Mar' = MonthEnum.MAR,
  'Apr' = MonthEnum.APR,
  'May' = MonthEnum.MAY,
  'Jun' = MonthEnum.JUN,
  'Jul' = MonthEnum.JUL,
  'Aug' = MonthEnum.AUG,
  'Sep' = MonthEnum.SEP,
  'Oct' = MonthEnum.OCT,
  'Nov' = MonthEnum.NOV,
  'Dec' = MonthEnum.DEC
}

const getMonthNameByNumber = {
  0: 'Jan',
  1: 'Fev',
  2: 'Mar',
  3: 'Apr',
  4: 'May',
  5: 'Jun',
  6: 'Jul',
  7: 'Aug',
  8: 'Sep',
  9: 'Oct',
  10: 'Nov',
  11 : 'Dec'
}

interface Month {
  name: MonthEnum,
  value: number
}


function increaseClientNumberInMonth(QuantityClientsByMonth: Month[], month: string): void {
  const monthEnum = getMonthEnumByMonthName[month] as MonthEnum
  QuantityClientsByMonth.forEach(o => {
    if (o.name === monthEnum) ++o.value
  })
}

interface IStatisticsController {
  getQuantityOfClientRegisteredByMonth(): Promise<{ label: string, data: Month[] }>
  getQuantityInStockAndOutOfStockClothes(): Promise<ClothesAvailabilityMetrics[]>
  getQuantityActivatedDeactivatedClients(): Promise<ClientAvailabilityMetrics[]>
  getHowManyShoppingCartWhereCreatedInCurrentMonth(): Promise<number>
  getShoppingCartRanking(): Promise<ShoppingCartValuable[]>
  getThreeCustomerWhoBuyTheMostInCurrentMonth(): Promise<ClientValuable[]>
}

interface StatisticsResponse {
  data: {
    client_registered_current_year_by_month: { label: string, data: Month[] },
    clothes_availability_quantity: ClothesAvailabilityMetrics[],
    client_availability_quantity: ClientAvailabilityMetrics[],
    number_of_shopping_carts_created_current_month: number,
    shopping_cart_rank: ShoppingCartValuable[],
    customer_rank: ClientValuable[]
  }
}

/**
 * Metrics:
 *  [ ok ] - Quantity of clients registered in current year sorted by month.
 *  [ ok ] - Quantity of clothes in stock and out of stock 
 *  - Quantity of clients activated and deactivated
 *  - How many shopping carts were created in current month?
 *  - Which are the most valuable shopping cart?
 *  - Which are the customers who buy the most?
 */

export class StatisticsController extends AbstractController implements IController, IStatisticsController {
  route: Router
  factory: any

  constructor({ route }: DTOController) {
    super()
    this.route = route
  }

  async init(): Promise<void> {
    this.route.get('/statistics', this.getStatistics)
  }

  async getShoppingCartRanking(): Promise<ShoppingCartValuable[]> {
    return [
      {
        shoppingCartId: 1,
        value: 18
      },
      {
        shoppingCartId: 2,
        value: 17
      },
      {
        shoppingCartId: 3,
        value: 16
      }
    ]
  }

  async getThreeCustomerWhoBuyTheMostInCurrentMonth(): Promise<ClientValuable[]> {
    const c1 = new Client()
    const c2 = new Client()
    const c3 = new Client()

    const cl = [c1,c2,c3]

    for (let i = 0; i < cl.length; i++) {
      cl[i].id = i
      cl[i].name = 'blabla',
      cl[i].address = 'lero lero'
    }

    return [
      {
        client: c1,
        value: 16
      },
      {
        client: c2,
        value: 15
      },
      {
        client: c3,
        value: 14
      }
    ]
  }

  async getQuantityInStockAndOutOfStockClothes(): Promise<ClothesAvailabilityMetrics[]> {
    const clothesRepo = getRepository(Clothes)
    const clothesStatusRepo = getRepository(ClothesStatus)

    const inStockStatus = await clothesStatusRepo.findOne({ 
      where: { name: ClothesStatusEnum.IN_STOCK } 
    })
    const outOfStockStatus = await clothesStatusRepo.findOne({ 
      where: { name: ClothesStatusEnum.OUT_OF_STOCK } 
    })

    const inStockCount = await clothesRepo.findAndCount({ 
      where: { status: inStockStatus },
      relations: ['status'] 
    })
    const outOfStockCount = await clothesRepo.findAndCount({ 
      where: { status: outOfStockStatus }, 
      relations: ['status']
    })

    return [
      {
        status: ClothesStatusEnum.IN_STOCK,
        quantity: inStockCount[1]
      },
      {
        status: ClothesStatusEnum.OUT_OF_STOCK,
        quantity: outOfStockCount[1]
      }
    ]
  }

  async getHowManyShoppingCartWhereCreatedInCurrentMonth(): Promise<number> {
    return 5;
  }

  async getQuantityOfClientRegisteredByMonth(): Promise<{ label: string, data: Month[] }> {

    const QuantityClientsByMonth = [
      { name: MonthEnum.JAN, value: 0 },
      { name: MonthEnum.FEV, value: 0 },
      { name: MonthEnum.MAR, value: 0 },
      { name: MonthEnum.APR, value: 0 },
      { name: MonthEnum.MAY, value: 0 },
      { name: MonthEnum.JUN, value: 0 },
      { name: MonthEnum.JUL, value: 0 },
      { name: MonthEnum.AUG, value: 0 },
      { name: MonthEnum.SEP, value: 0 },
      { name: MonthEnum.OCT, value: 0 },
      { name: MonthEnum.NOV, value: 0 },
      { name: MonthEnum.DEC, value: 0 },
    ]    

    const clientRepo = getRepository(Client)
    const currentYear = new Date().getFullYear()
    const currentYearClientList = (await clientRepo.find()).filter(i => i.createdAt.getFullYear() === currentYear)

    currentYearClientList.map(
      client => {
        const monthName = getMonthNameByNumber[client.createdAt.getMonth()]
        increaseClientNumberInMonth(QuantityClientsByMonth, monthName)
      }
    )

    // increaseClientNumberInMonth('Fev')

    return {
      label: 'Quantity of clients',
      data: QuantityClientsByMonth
    }
  }

  async getQuantityActivatedDeactivatedClients(): Promise<ClientAvailabilityMetrics[]> {
    return [
      { status: EnumEmployeeClientStatus.ACTIVATED, quantity: 15 },
      { status: EnumEmployeeClientStatus.DEACTIVATED, quantity: 5 }
    ]
  }

  getStatistics = async (_: Request, res: Response): Promise<Response<StatisticsResponse>> => {
    const clothes_availability_quantity = await this.getQuantityInStockAndOutOfStockClothes()
    const number_of_shopping_carts_created_current_month = await this.getHowManyShoppingCartWhereCreatedInCurrentMonth()
    const customer_rank = await this.getThreeCustomerWhoBuyTheMostInCurrentMonth()
    const shopping_cart_rank = await this.getShoppingCartRanking()
    const client_registered_current_year_by_month = await this.getQuantityOfClientRegisteredByMonth()
    const client_availability_quantity = await this.getQuantityActivatedDeactivatedClients()

    const response: StatisticsResponse = { 
      data: { 
        number_of_shopping_carts_created_current_month,
        clothes_availability_quantity,
        customer_rank,
        shopping_cart_rank,
        client_registered_current_year_by_month,
        client_availability_quantity
      } 
    }

    return res.json(response)
  }
}
